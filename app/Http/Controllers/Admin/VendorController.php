<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Party;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $verified = $request->input('is_verified', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = Vendor::query()
            ->with(['user:id,name,phone', 'factory:id,code,name'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%");
                });
            })
            ->when($verified !== 'all', function ($q) use ($verified): void {
                $q->where('is_verified', $verified === '1');
            });

        $vendors = $query->latest('id')->paginate($perPage)->withQueryString();

        $vendorParties = Party::query()
            ->with('factory:id,code,name')
            ->withCount('subcontractOrders')
            ->where('type', 'ven')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->get();

        $vendorUsers = User::query()
            ->with('factory:id,code,name')
            ->where(function ($q): void {
                $q->where('role', 'ven')->orWhere('is_vendor_rep', true);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('organization_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email', 'role', 'designation', 'organization_name', 'factory_id', 'vendor_id', 'is_vendor_rep', 'is_active']);

        $counts = [
            'total' => Vendor::count(),
            'verified' => Vendor::where('is_verified', true)->count(),
            'parties' => Party::where('type', 'ven')->count(),
            'vendor_users' => User::where('role', 'ven')->orWhere('is_vendor_rep', true)->count(),
        ];

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'vendorParties' => $vendorParties,
            'vendorUsers' => $vendorUsers,
            'existingVendorCodes' => Vendor::pluck('code')->values(),
            'counts' => $counts,
            'users' => User::orderBy('name')->get(['id', 'name', 'phone', 'role']),
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'is_verified' => $verified,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'factory_id' => ['nullable', 'integer', 'exists:factories,id'],
            'code' => ['required', 'string', 'max:30', Rule::unique('vendors', 'code')],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:40'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_verified' => ['boolean'],
        ]);

        $vendor = Vendor::create([
            ...$validated,
            'is_verified' => $request->boolean('is_verified', true),
        ]);

        if (! empty($validated['user_id'])) {
            User::where('id', $validated['user_id'])->whereNull('vendor_id')->update(['vendor_id' => $vendor->id]);
        }

        return back()->with('success', "Vendor \"{$validated['name']}\" created.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'factory_id' => ['nullable', 'integer', 'exists:factories,id'],
            'code' => ['required', 'string', 'max:30', Rule::unique('vendors', 'code')->ignore($vendor->id)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:40'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_verified' => ['boolean'],
        ]);

        $vendor->update([
            ...$validated,
            'is_verified' => $request->boolean('is_verified'),
        ]);

        return back()->with('success', "Vendor \"{$vendor->name}\" updated.");
    }

    public function toggleVerified(int $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update(['is_verified' => ! $vendor->is_verified]);

        return back()->with('success', "Verification updated for vendor \"{$vendor->name}\".");
    }

    public function destroy(int $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $name = $vendor->name;

        DB::transaction(function () use ($vendor): void {
            User::where('vendor_id', $vendor->id)->update(['vendor_id' => null]);
            $vendor->delete();
        });

        return back()->with('success', "Vendor \"{$name}\" deleted.");
    }
}
