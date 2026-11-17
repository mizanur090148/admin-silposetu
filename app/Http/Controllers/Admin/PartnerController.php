<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $payoutMethod = $request->input('payout_method', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = Partner::query()
            ->with('user:id,name,phone,email')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('partner_code', 'like', "%{$search}%")
                        ->orWhere('payout_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search): void {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($payoutMethod !== 'all', function ($q) use ($payoutMethod): void {
                $q->where('payout_method', $payoutMethod);
            });

        $partners = $query->latest('id')->paginate($perPage)->withQueryString();

        $summary = [
            'total_partners' => Partner::count(),
            'total_referrals' => (int) Partner::sum('total_referrals'),
            'total_commission_tk' => (float) Partner::sum('total_commission_tk'),
            'balance_commission_tk' => (float) Partner::sum('balance_commission_tk'),
        ];

        $partnerUsers = User::query()
            ->where('role', 'par')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('partner_code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email', 'partner_code', 'is_active']);

        return Inertia::render('Admin/Partners/Index', [
            'partners' => $partners,
            'partnerUsers' => $partnerUsers,
            'existingPartnerUserIds' => Partner::whereNotNull('user_id')->pluck('user_id')->values(),
            'existingPartnerCodes' => Partner::pluck('partner_code')->values(),
            'summary' => $summary,
            'users' => User::orderBy('name')->get(['id', 'name', 'phone', 'role']),
            'filters' => [
                'search' => $search,
                'payout_method' => $payoutMethod,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'partner_code' => ['required', 'string', 'max:30', Rule::unique('partners', 'partner_code')],
            'total_referrals' => ['required', 'integer', 'min:0'],
            'active_factories_count' => ['required', 'integer', 'min:0'],
            'total_commission_tk' => ['required', 'numeric', 'min:0'],
            'withdrawn_commission_tk' => ['required', 'numeric', 'min:0'],
            'balance_commission_tk' => ['required', 'numeric', 'min:0'],
            'payout_method' => ['required', 'string', 'max:30'],
            'payout_number' => ['nullable', 'string', 'max:30'],
        ]);

        Partner::create($validated);

        return back()->with('success', "Partner {$validated['partner_code']} created.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $partner = Partner::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'partner_code' => ['required', 'string', 'max:30', Rule::unique('partners', 'partner_code')->ignore($partner->id)],
            'total_referrals' => ['required', 'integer', 'min:0'],
            'active_factories_count' => ['required', 'integer', 'min:0'],
            'total_commission_tk' => ['required', 'numeric', 'min:0'],
            'withdrawn_commission_tk' => ['required', 'numeric', 'min:0'],
            'balance_commission_tk' => ['required', 'numeric', 'min:0'],
            'payout_method' => ['required', 'string', 'max:30'],
            'payout_number' => ['nullable', 'string', 'max:30'],
        ]);

        $partner->update($validated);

        return back()->with('success', "Partner {$partner->partner_code} updated.");
    }

    public function recordPayout(Request $request, int $id): RedirectResponse
    {
        $partner = Partner::findOrFail($id);

        $validated = $request->validate([
            'amount_tk' => ['required', 'numeric', 'min:1'],
        ]);

        $amount = round((float) $validated['amount_tk'], 2);
        $balance = round((float) $partner->balance_commission_tk, 2);

        if ($amount > $balance) {
            return back()->with('error', "Payout amount (৳{$amount}) exceeds available balance (৳{$balance}).");
        }

        $partner->update([
            'withdrawn_commission_tk' => round((float) $partner->withdrawn_commission_tk + $amount, 2),
            'balance_commission_tk' => max(0.0, round($balance - $amount, 2)),
        ]);

        return back()->with('success', "Recorded ৳{$amount} payout for partner {$partner->partner_code}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $partner = Partner::findOrFail($id);
        $code = $partner->partner_code;
        $partner->delete();

        return back()->with('success', "Partner {$code} deleted.");
    }
}
