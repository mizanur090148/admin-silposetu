<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Employee;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\Production;
use App\Models\SubcontractOrder;
use App\Support\PlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubcontractOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = (string) $request->input('status', 'all');
        $factoryId = (string) $request->input('factory_id', 'all');
        $partyCode = (string) $request->input('party_code', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = SubcontractOrder::query()
            ->with(['factory:id,code,name,area', 'party:id,code,name,type'])
            ->withCount(['lines', 'qcInspections', 'productions', 'deliveryChallans', 'fabricRolls'])
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
            })
            ->when($partyCode !== 'all', function ($q) use ($partyCode): void {
                $q->where('party_code', $partyCode);
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
            'parties' => Party::orderBy('name')->get(['id', 'factory_id', 'code', 'name', 'type', 'default_rate_tk']),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'factory_id' => $factoryId,
                'party_code' => $partyCode,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_no' => ['nullable', 'string', 'max:100', Rule::unique('subcontract_orders', 'order_no')],
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'party_id' => ['nullable', 'integer', 'exists:parties,id'],
            'party_code' => ['required', 'string', 'max:100'],
            'buyer' => ['nullable', 'string', 'max:255'],
            'fabric_summary' => ['required', 'string', 'max:1000'],
            'gsm' => ['nullable', 'string', 'max:100'],
            'finish_gsm' => ['nullable', 'string', 'max:100'],
            'stitch_length' => ['nullable', 'string', 'max:100'],
            'grey_dia' => ['nullable', 'string', 'max:100'],
            'dia_gauge' => ['nullable', 'string', 'max:191'],
            'color' => ['nullable', 'string', 'max:255'],
            'yarn_summary' => ['nullable', 'string', 'max:1000'],
            'total_qty_kg' => ['required', 'numeric', 'min:0.1'],
            'rate_tk' => ['required', 'numeric', 'min:0'],
            'daily_rate_kg' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', Rule::in(['run', 'wait', 'done'])],
            'order_date' => ['nullable', 'date'],
            'delivery_due_date' => ['nullable', 'date'],
            'machines' => ['nullable', 'string', 'max:500'],
        ]);

        $orderNo = trim((string) ($validated['order_no'] ?? ''));
        if ($orderNo === '') {
            $orderNo = $this->nextOrderNo();
        }

        $machines = collect(explode(',', (string) ($validated['machines'] ?? '')))
            ->map(fn (string $v): string => trim($v))
            ->filter()
            ->values()
            ->all();

        $partyId = $validated['party_id'] ?? Party::where('factory_id', (int) $validated['factory_id'])
            ->where('code', $validated['party_code'])
            ->value('id');

        $order = DB::transaction(function () use ($validated, $orderNo, $machines, $partyId): SubcontractOrder {
            $order = SubcontractOrder::create([
                'order_no' => $orderNo,
                'factory_id' => $validated['factory_id'],
                'party_id' => $partyId,
                'party_code' => trim($validated['party_code']),
                'buyer' => $validated['buyer'] ?? null,
                'fabric_summary' => $validated['fabric_summary'],
                'gsm' => $validated['gsm'] ?? null,
                'finish_gsm' => $validated['finish_gsm'] ?? null,
                'stitch_length' => $validated['stitch_length'] ?? null,
                'grey_dia' => $validated['grey_dia'] ?? null,
                'dia_gauge' => $validated['dia_gauge'] ?? null,
                'color' => $validated['color'] ?? null,
                'yarn_summary' => $validated['yarn_summary'] ?? null,
                'total_qty_kg' => $validated['total_qty_kg'],
                'done_kg' => 0,
                'delivered_kg' => 0,
                'daily_rate_kg' => $validated['daily_rate_kg'] ?? 300,
                'rate_tk' => $validated['rate_tk'],
                'status' => $validated['status'],
                'start_label' => ! empty($validated['order_date']) ? date('d M', strtotime($validated['order_date'])) : now()->format('d M'),
                'order_date' => $validated['order_date'] ?? now()->toDateString(),
                'delivery_due_date' => $validated['delivery_due_date'] ?? null,
                'complete_date' => $validated['status'] === 'done' ? now()->toDateString() : null,
                'machines_json' => $machines,
                'week_prod_json' => [0, 0, 0, 0, 0, 0, 0],
                'challans_json' => [],
                'yarn_in_json' => [],
            ]);

            OrderLine::create([
                'subcontract_order_id' => $order->id,
                'line_index' => 0,
                'knit_type' => 'c',
                'is_yarn_dyed' => false,
                'unit' => 'kg',
                'placement' => 'Body',
                'fabrication' => $validated['fabric_summary'],
                'color' => $validated['color'] ?? null,
                'qty' => $validated['total_qty_kg'],
                'done_qty' => 0,
                'delivered_qty' => 0,
                'grey_gsm' => $validated['gsm'] ?? null,
                'finish_gsm' => $validated['finish_gsm'] ?? null,
                'stitch_length' => $validated['stitch_length'] ?? null,
                'grey_dia' => $validated['grey_dia'] ?? null,
                'dia_gauge' => $validated['dia_gauge'] ?? null,
                'machines_json' => $machines,
            ]);

            return $order;
        });

        return redirect()->route('admin.orders.show', $order->id)
            ->with('success', "Order {$order->order_no} created.");
    }

    public function show(int $id): Response
    {
        $order = SubcontractOrder::query()
            ->with([
                'factory:id,code,name,area,phone',
                'party:id,code,name,type,phone,payment_terms',
                'lines',
                'productions' => fn ($q) => $q->latest('id')->limit(50),
                'qcInspections' => fn ($q) => $q->latest('id'),
                'deliveryChallans' => fn ($q) => $q->latest('id'),
                'fabricRolls' => fn ($q) => $q->latest('id')->limit(60),
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

        $factoryMachines = FactoryMachine::query()
            ->where('factory_id', $order->factory_id)
            ->orderBy('code')
            ->get(['id', 'code', 'spec_label', 'status']);

        $operators = Employee::query()
            ->where('factory_id', $order->factory_id)
            ->orderBy('name')
            ->get(['id', 'name', 'employee_type', 'shift', 'machine_assigned']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'relatedBills' => $relatedBills,
            'factoryMachines' => $factoryMachines,
            'operators' => $operators,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $order = SubcontractOrder::findOrFail($id);

        $validated = $request->validate([
            'buyer' => ['nullable', 'string', 'max:255'],
            'party_code' => ['required', 'string', 'max:100'],
            'fabric_summary' => ['required', 'string', 'max:1000'],
            'gsm' => ['nullable', 'string', 'max:100'],
            'finish_gsm' => ['nullable', 'string', 'max:100'],
            'stitch_length' => ['nullable', 'string', 'max:100'],
            'grey_dia' => ['nullable', 'string', 'max:100'],
            'dia_gauge' => ['nullable', 'string', 'max:191'],
            'color' => ['nullable', 'string', 'max:255'],
            'yarn_summary' => ['nullable', 'string', 'max:1000'],
            'total_qty_kg' => ['required', 'numeric', 'min:0'],
            'done_kg' => ['nullable', 'numeric', 'min:0'],
            'delivered_kg' => ['nullable', 'numeric', 'min:0'],
            'daily_rate_kg' => ['nullable', 'numeric', 'min:0'],
            'rate_tk' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', Rule::in(['run', 'wait', 'done'])],
            'order_date' => ['nullable', 'date'],
            'delivery_due_date' => ['nullable', 'date'],
            'machines' => ['nullable', 'string', 'max:500'],
        ]);

        $machines = collect(explode(',', (string) ($validated['machines'] ?? '')))
            ->map(fn (string $v): string => trim($v))
            ->filter()
            ->values()
            ->all();

        $completeDate = $order->complete_date;
        if ($validated['status'] === 'done' && ! $completeDate) {
            $completeDate = now()->toDateString();
        }

        $order->update([
            'buyer' => $validated['buyer'] ?? null,
            'party_code' => trim($validated['party_code']),
            'fabric_summary' => $validated['fabric_summary'],
            'gsm' => $validated['gsm'] ?? null,
            'finish_gsm' => $validated['finish_gsm'] ?? null,
            'stitch_length' => $validated['stitch_length'] ?? null,
            'grey_dia' => $validated['grey_dia'] ?? null,
            'dia_gauge' => $validated['dia_gauge'] ?? null,
            'color' => $validated['color'] ?? null,
            'yarn_summary' => $validated['yarn_summary'] ?? null,
            'total_qty_kg' => $validated['total_qty_kg'],
            'done_kg' => $validated['done_kg'] ?? $order->done_kg,
            'delivered_kg' => $validated['delivered_kg'] ?? $order->delivered_kg,
            'daily_rate_kg' => $validated['daily_rate_kg'] ?? $order->daily_rate_kg,
            'rate_tk' => $validated['rate_tk'],
            'status' => $validated['status'],
            'order_date' => $validated['order_date'] ?? $order->order_date,
            'delivery_due_date' => $validated['delivery_due_date'] ?? $order->delivery_due_date,
            'complete_date' => $completeDate,
            'machines_json' => $machines,
        ]);

        return back()->with('success', "Order {$order->order_no} updated.");
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

    public function storeProduction(Request $request, int $id): RedirectResponse
    {
        $order = SubcontractOrder::with('lines')->findOrFail($id);

        $validated = $request->validate([
            'placement_index' => ['required', 'integer', 'min:0'],
            'date_label' => ['nullable', 'string', 'max:20'],
            'shift' => ['required', 'string', 'max:10'],
            'machine_code' => ['required', 'string', 'max:20'],
            'operator_name' => ['nullable', 'string', 'max:60'],
            'qty_kg' => ['required', 'numeric', 'min:0.1'],
            'rolls_count' => ['required', 'integer', 'min:0', 'max:200'],
            'yarn_lot' => ['nullable', 'string', 'max:80'],
            'fault_code' => ['nullable', 'string', 'max:40'],
            'generate_rolls' => ['boolean'],
        ]);

        DB::transaction(function () use ($order, $validated, $request): void {
            $kg = (float) $validated['qty_kg'];
            $dateLabel = ! empty($validated['date_label']) ? $validated['date_label'] : now()->format('d M');
            $opName = trim((string) ($validated['operator_name'] ?? ''));
            $employeeId = $opName !== ''
                ? Employee::where('factory_id', $order->factory_id)->where('name', $opName)->value('id')
                : null;

            Production::create([
                'subcontract_order_id' => $order->id,
                'user_id' => $request->user()?->id,
                'employee_id' => $employeeId,
                'order_no' => $order->order_no,
                'placement_index' => $validated['placement_index'],
                'date_label' => $dateLabel,
                'shift' => $validated['shift'],
                'machine_code' => trim($validated['machine_code']),
                'operator_name' => $opName !== '' ? $opName : '—',
                'qty_kg' => $kg,
                'rolls_count' => $validated['rolls_count'],
                'yarn_lot' => ! empty($validated['yarn_lot']) ? trim($validated['yarn_lot']) : '—',
                'fault_code' => $validated['fault_code'] ?? null,
            ]);

            $order->increment('done_kg', $kg);
            $order->increment('today_prod_kg', $kg);

            $line = $order->lines->firstWhere('line_index', $validated['placement_index'])
                ?? $order->lines->values()->get($validated['placement_index']);
            if ($line) {
                $line->increment('done_qty', $kg);
            }

            if ($request->boolean('generate_rolls', true) && $validated['rolls_count'] > 0) {
                $existingRolls = FabricRoll::where('order_no', $order->order_no)
                    ->where('machine_code', trim($validated['machine_code']))
                    ->count();
                $perRollKg = round($kg / $validated['rolls_count'], 2);
                for ($i = 1; $i <= $validated['rolls_count']; $i++) {
                    $seq = str_pad((string) ($existingRolls + $i), 3, '0', STR_PAD_LEFT);
                    FabricRoll::create([
                        'roll_no' => trim($validated['machine_code']).'/'.$seq,
                        'jc_seq' => $seq,
                        'order_no' => $order->order_no,
                        'placement_index' => $validated['placement_index'],
                        'machine_code' => trim($validated['machine_code']),
                        'date_label' => $dateLabel,
                        'shift' => $validated['shift'],
                        'operator_name' => $opName !== '' ? $opName : '—',
                        'weight_kg' => $perRollKg,
                        'yarn_lot' => ! empty($validated['yarn_lot']) ? trim($validated['yarn_lot']) : '—',
                        'faults_json' => ! empty($validated['fault_code']) && $i === $validated['rolls_count']
                            ? [$validated['fault_code'] => 1]
                            : [],
                    ]);
                }
            }
        });

        return back()->with('success', "Production ({$validated['qty_kg']} kg) recorded on {$order->order_no}.");
    }

    public function receiveYarn(Request $request, int $id): RedirectResponse
    {
        $order = SubcontractOrder::findOrFail($id);

        $validated = $request->validate([
            'count' => ['required', 'string', 'max:100'],
            'spinner' => ['nullable', 'string', 'max:100'],
            'lot' => ['required', 'string', 'max:60'],
            'bags' => ['nullable', 'integer', 'min:0'],
            'kg' => ['required', 'numeric', 'min:0.1'],
        ]);

        $yarnIn = $order->yarn_in_json ?? [];
        $yarnIn[] = [
            'count' => trim($validated['count']),
            'spinner' => trim((string) ($validated['spinner'] ?? '')) ?: '—',
            'lot' => trim($validated['lot']),
            'bags' => (int) ($validated['bags'] ?? 0),
            'kg' => (float) $validated['kg'],
        ];

        $order->update(['yarn_in_json' => $yarnIn]);

        return back()->with('success', "Yarn inward lot {$validated['lot']} ({$validated['kg']} kg) added.");
    }

    public function returnYarn(Request $request, int $id): RedirectResponse
    {
        $order = SubcontractOrder::findOrFail($id);

        $validated = $request->validate([
            'lot' => ['required', 'string', 'max:60'],
            'kg' => ['required', 'numeric', 'min:0.1'],
            'date_label' => ['nullable', 'string', 'max:20'],
        ]);

        $returns = $order->yarn_returns_json ?? [];
        $challanNo = 'YRC-'.str_pad((string) (count($returns) + 1), 3, '0', STR_PAD_LEFT);

        $returns[] = [
            'challan_no' => $challanNo,
            'lot' => trim($validated['lot']),
            'kg' => (float) $validated['kg'],
            'd' => ! empty($validated['date_label']) ? $validated['date_label'] : now()->format('d M'),
            'date' => now()->toDateString(),
            'by' => $request->user()?->name ?: 'Admin',
        ];

        $requests = $order->yarn_requests_json ?? [];
        if (isset($requests[$validated['lot']])) {
            $requests[$validated['lot']]['status'] = 'completed';
        }

        $order->update([
            'yarn_returns_json' => $returns,
            'yarn_requests_json' => $requests,
        ]);

        return back()->with('success', "Yarn return challan {$challanNo} issued for lot {$validated['lot']}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $order = SubcontractOrder::findOrFail($id);
        $orderNo = $order->order_no;
        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', "Order {$orderNo} deleted.");
    }

    private function nextOrderNo(): string
    {
        $prefix = 'SC-'.now()->format('ym').'-';
        $count = SubcontractOrder::withTrashed()->count() + 1;
        while (SubcontractOrder::withTrashed()->where('order_no', $prefix.str_pad((string) $count, 3, '0', STR_PAD_LEFT))->exists()) {
            $count++;
        }

        return $prefix.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }
}
