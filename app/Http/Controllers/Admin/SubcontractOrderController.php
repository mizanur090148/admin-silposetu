<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Factory;
use App\Models\SubcontractOrder;
use App\Support\PlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubcontractOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status', 'all');
        $factoryId = $request->input('factory_id', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = SubcontractOrder::query()
            ->with(['factory:id,code,name,area', 'party:id,code,name,type'])
            ->withCount(['lines', 'qcInspections', 'productions', 'deliveryChallans'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('order_no', 'like', "%{$search}%")
                        ->orWhere('buyer', 'like', "%{$search}%")
                        ->orWhere('party_code', 'like', "%{$search}%")
                        ->orWhere('fabric_summary', 'like', "%{$search}%")
                        ->orWhereHas('factory', function ($fq) use ($search): void {
                            $fq->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        })
                        ->orWhereHas('party', function ($pq) use ($search): void {
                            $pq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                if ($status === 'run') {
                    $q->whereIn('status', ['run', 'running']);
                } elseif ($status === 'wait') {
                    $q->whereIn('status', ['wait', 'pending']);
                } elseif ($status === 'done') {
                    $q->whereIn('status', ['done', 'completed', 'delivered']);
                } else {
                    $q->where('status', $status);
                }
            })
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            });

        $orders = $query->latest('id')->paginate($perPage)->withQueryString();

        $summary = [
            'total' => SubcontractOrder::count(),
            'running' => SubcontractOrder::whereIn('status', ['run', 'running'])->count(),
            'waiting' => SubcontractOrder::whereIn('status', ['wait', 'pending'])->count(),
            'completed' => SubcontractOrder::whereIn('status', ['done', 'completed', 'delivered'])->count(),
            'total_qty_kg' => (float) SubcontractOrder::sum('total_qty_kg'),
            'done_kg' => (float) SubcontractOrder::sum('done_kg'),
            'delivered_kg' => (float) SubcontractOrder::sum('delivered_kg'),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'summary' => $summary,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'factory_id' => $factoryId,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(int $id): Response
    {
        $order = SubcontractOrder::query()
            ->with([
                'factory:id,code,name,area,phone',
                'party:id,code,name,type,phone,payment_terms',
                'lines',
                'productions' => fn ($q) => $q->latest('id')->limit(25),
                'qcInspections' => fn ($q) => $q->latest('id'),
                'deliveryChallans' => fn ($q) => $q->latest('id'),
            ])
            ->findOrFail($id);

        $relatedBills = Bill::query()
            ->when($order->factory?->code, function ($q) use ($order): void {
                $q->where('factory_code', $order->factory->code);
            })
            ->where('party_code', $order->party_code)
            ->latest('id')
            ->get()
            ->map(function (Bill $bill): array {
                return [
                    'id' => $bill->id,
                    'bill_no' => $bill->bill_no,
                    'jv_no' => $bill->jv_no,
                    'bill_date' => $bill->bill_date?->format('Y-m-d'),
                    ...PlanCatalog::billTotals($bill),
                ];
            })
            ->values();

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'relatedBills' => $relatedBills,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $order = SubcontractOrder::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['run', 'wait', 'done'])],
        ]);

        $payload = ['status' => $validated['status']];
        if ($validated['status'] === 'done' && ! $order->complete_date) {
            $payload['complete_date'] = now()->toDateString();
        }

        $order->update($payload);

        return back()->with('success', "Order {$order->order_no} status updated to {$validated['status']}.");
    }
}
