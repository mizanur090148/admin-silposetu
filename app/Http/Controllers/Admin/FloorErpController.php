<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\Production;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FloorErpController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = (string) $request->input('tab', 'production');
        if (! in_array($tab, ['production', 'rolls', 'qc', 'challans'], true)) {
            $tab = 'production';
        }

        $search = trim((string) $request->input('search', ''));
        $factoryId = (string) $request->input('factory_id', 'all');
        $shift = (string) $request->input('shift', 'all');
        $qcFilter = (string) $request->input('qc_status', 'all');
        $rollFilter = (string) $request->input('roll_status', 'all');
        $challanFilter = (string) $request->input('challan_status', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $selectedFactory = $factoryId !== 'all' ? Factory::find((int) $factoryId) : null;
        $factoryOrderNos = $selectedFactory
            ? SubcontractOrder::where('factory_id', $selectedFactory->id)->pluck('order_no')
            : null;

        $productions = Production::query()
            ->with(['order:id,order_no,factory_id,party_code,buyer,fabric_summary', 'order.factory:id,code,name'])
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->whereHas('order', fn ($oq) => $oq->where('factory_id', (int) $factoryId));
            })
            ->when($shift !== 'all', function ($q) use ($shift): void {
                $q->where('shift', $shift);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('order_no', 'like', "%{$search}%")
                        ->orWhere('machine_code', 'like', "%{$search}%")
                        ->orWhere('operator_name', 'like', "%{$search}%")
                        ->orWhere('yarn_lot', 'like', "%{$search}%")
                        ->orWhere('fault_code', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate($perPage, ['*'], 'prod_page')
            ->withQueryString();

        $rolls = FabricRoll::query()
            ->with(['order:id,order_no,factory_id,party_code,buyer'])
            ->when($factoryOrderNos !== null, function ($q) use ($factoryOrderNos): void {
                $q->whereIn('order_no', $factoryOrderNos);
            })
            ->when($shift !== 'all', function ($q) use ($shift): void {
                $q->where('shift', $shift);
            })
            ->when($rollFilter === 'ready', function ($q): void {
                $q->whereNull('challan_no');
            })
            ->when($rollFilter === 'dispatched', function ($q): void {
                $q->whereNotNull('challan_no');
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('roll_no', 'like', "%{$search}%")
                        ->orWhere('order_no', 'like', "%{$search}%")
                        ->orWhere('machine_code', 'like', "%{$search}%")
                        ->orWhere('operator_name', 'like', "%{$search}%")
                        ->orWhere('challan_no', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate($perPage, ['*'], 'rolls_page')
            ->withQueryString();

        $allQc = QcInspection::query()
            ->with(['order:id,order_no,factory_id,party_code,buyer,fabric_summary', 'order.factory:id,code,name'])
            ->when($factoryOrderNos !== null, function ($q) use ($factoryOrderNos): void {
                $q->whereIn('order_no', $factoryOrderNos);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('qc_no', 'like', "%{$search}%")
                        ->orWhere('order_no', 'like', "%{$search}%")
                        ->orWhere('roll_no', 'like', "%{$search}%")
                        ->orWhere('machine_code', 'like', "%{$search}%")
                        ->orWhere('issue_description', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->get();

        $qcFiltered = $allQc->filter(function (QcInspection $qc) use ($qcFilter): bool {
            $facOk = ! empty(($qc->factory_sign_json ?? [])['v']);
            $venOk = ! empty(($qc->vendor_sign_json ?? [])['v']);
            $isDualSigned = $facOk && $venOk;

            if ($qcFilter === 'pending') {
                return ! $isDualSigned;
            }
            if ($qcFilter === 'signed') {
                return $isDualSigned;
            }

            return true;
        })->values();

        $challans = DeliveryChallan::query()
            ->with(['factory:id,code,name', 'order:id,order_no,buyer,fabric_summary'])
            ->when($selectedFactory, function ($q) use ($selectedFactory): void {
                $q->where('factory_code', $selectedFactory->code);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('challan_no', 'like', "%{$search}%")
                        ->orWhere('order_no', 'like', "%{$search}%")
                        ->orWhere('party_code', 'like', "%{$search}%")
                        ->orWhere('vehicle_no', 'like', "%{$search}%")
                        ->orWhere('driver_name', 'like', "%{$search}%");
                });
            })
            ->when($challanFilter === 'unsigned', function ($q): void {
                $q->whereNull('vendor_sign_json');
            })
            ->when($challanFilter === 'signed', function ($q): void {
                $q->whereNotNull('vendor_sign_json');
            })
            ->latest('id')
            ->paginate($perPage, ['*'], 'challan_page')
            ->withQueryString();

        $pendingQcGlobal = QcInspection::all(['factory_sign_json', 'vendor_sign_json'])
            ->filter(fn (QcInspection $qc): bool => empty(($qc->factory_sign_json ?? [])['v']) || empty(($qc->vendor_sign_json ?? [])['v']))
            ->count();

        $summary = [
            'total_productions' => Production::count(),
            'total_knitted_kg' => (float) Production::sum('qty_kg'),
            'total_rolls' => FabricRoll::count(),
            'ready_rolls' => FabricRoll::whereNull('challan_no')->count(),
            'total_qc' => QcInspection::count(),
            'pending_qc_signs' => $pendingQcGlobal,
            'total_challans' => DeliveryChallan::count(),
            'unsigned_challans' => DeliveryChallan::whereNull('vendor_sign_json')->count(),
        ];

        return Inertia::render('Admin/FloorErp/Index', [
            'tab' => $tab,
            'productions' => $productions,
            'rolls' => $rolls,
            'qcInspections' => $qcFiltered,
            'challans' => $challans,
            'summary' => $summary,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'orders' => SubcontractOrder::orderByDesc('id')->get(['id', 'order_no', 'factory_id', 'party_code', 'buyer']),
            'filters' => [
                'search' => $search,
                'factory_id' => $factoryId,
                'shift' => $shift,
                'qc_status' => $qcFilter,
                'roll_status' => $rollFilter,
                'challan_status' => $challanFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function signQc(Request $request, int $id): RedirectResponse
    {
        $qc = QcInspection::findOrFail($id);

        $validated = $request->validate([
            'side' => ['required', 'string', Rule::in(['fac', 'ven'])],
            'verdict' => ['required', 'string', Rule::in(['ok', 'bad'])],
            'signed_by' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
            'action_taken' => ['nullable', 'string', 'max:100'],
        ]);

        $signPayload = [
            'v' => $validated['verdict'],
            'by' => trim($validated['signed_by']),
            'at' => now()->format('d M, H:i'),
            'note' => trim((string) ($validated['note'] ?? '')),
        ];

        if ($validated['side'] === 'fac') {
            $qc->factory_sign_json = $signPayload;
        } else {
            $qc->vendor_sign_json = $signPayload;
        }

        if (array_key_exists('action_taken', $validated)) {
            $qc->action_taken = $validated['action_taken'];
        }

        $qc->save();

        return back()->with('success', "QC {$qc->qc_no} updated ({$validated['side']} signed as {$validated['verdict']}).");
    }

    public function updateQcAction(Request $request, int $id): RedirectResponse
    {
        $qc = QcInspection::findOrFail($id);

        $validated = $request->validate([
            'action_taken' => ['nullable', 'string', 'max:100'],
        ]);

        $qc->update([
            'action_taken' => $validated['action_taken'] ?? null,
        ]);

        return back()->with('success', "Corrective action saved for {$qc->qc_no}.");
    }

    public function destroyProduction(int $id): RedirectResponse
    {
        $production = Production::findOrFail($id);
        $orderNo = $production->order_no;
        $qty = (float) $production->qty_kg;

        DB::transaction(function () use ($production, $qty): void {
            if ($production->subcontract_order_id) {
                $order = SubcontractOrder::find($production->subcontract_order_id);
                if ($order) {
                    $newDone = max(0.0, round((float) $order->done_kg - $qty, 2));
                    $order->update(['done_kg' => $newDone]);
                }
            }
            $production->delete();
        });

        return back()->with('success', "Production entry deleted for order {$orderNo}.");
    }

    public function storeChallan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string', 'exists:subcontract_orders,order_no'],
            'challan_no' => ['nullable', 'string', 'max:40', Rule::unique('delivery_challans', 'challan_no')],
            'date_label' => ['nullable', 'string', 'max:20'],
            'rolls_text' => ['required', 'string', 'max:2000'],
            'vehicle_no' => ['required', 'string', 'max:80'],
            'driver_name' => ['nullable', 'string', 'max:80'],
            'driver_phone' => ['nullable', 'string', 'max:30'],
            'signed_by' => ['nullable', 'string', 'max:80'],
        ]);

        $order = SubcontractOrder::with('factory:id,code')->where('order_no', $validated['order_no'])->firstOrFail();

        $rolls = collect(preg_split('/[\r\n,]+/', $validated['rolls_text']) ?: [])
            ->map(fn (string $v): string => trim($v))
            ->filter()
            ->values()
            ->all();

        if (empty($rolls)) {
            return back()->with('error', 'Please enter at least one roll number for the challan.');
        }

        $challanNo = trim((string) ($validated['challan_no'] ?? ''));
        if ($challanNo === '') {
            $challanNo = $this->nextChallanNo();
        }

        DB::transaction(function () use ($validated, $order, $rolls, $challanNo, $request): void {
            DeliveryChallan::create([
                'challan_no' => $challanNo,
                'factory_code' => $order->factory?->code ?? 'f1',
                'party_code' => $order->party_code,
                'order_no' => $order->order_no,
                'date_label' => ! empty($validated['date_label']) ? $validated['date_label'] : now()->format('d M'),
                'rolls_json' => $rolls,
                'vehicle_no' => $validated['vehicle_no'],
                'driver_name' => $validated['driver_name'] ?? null,
                'driver_phone' => $validated['driver_phone'] ?? null,
                'factory_sign_json' => [
                    'by' => ! empty($validated['signed_by']) ? $validated['signed_by'] : ($request->user()?->name ?: 'Factory Admin'),
                    'at' => now()->format('d M, H:i'),
                ],
                'vendor_sign_json' => null,
            ]);

            FabricRoll::where('order_no', $order->order_no)
                ->whereIn('roll_no', $rolls)
                ->update(['challan_no' => $challanNo]);

            $existingChallans = $order->challans_json ?? [];
            if (! in_array($challanNo, $existingChallans, true)) {
                $existingChallans[] = $challanNo;
                $order->update(['challans_json' => $existingChallans]);
            }
        });

        return back()->with('success', "Delivery challan {$challanNo} issued for {$order->order_no}.");
    }

    public function signChallan(Request $request, int $id): RedirectResponse
    {
        $challan = DeliveryChallan::findOrFail($id);

        $validated = $request->validate([
            'signed_by' => ['required', 'string', 'max:80'],
            'received_rolls' => ['required', 'integer', 'min:0'],
        ]);

        $challan->update([
            'vendor_sign_json' => [
                'by' => trim($validated['signed_by']),
                'at' => now()->format('d M, H:i'),
                'got' => $validated['received_rolls'],
            ],
        ]);

        return back()->with('success', "Vendor receipt signed on challan {$challan->challan_no}.");
    }

    public function destroyChallan(int $id): RedirectResponse
    {
        $challan = DeliveryChallan::findOrFail($id);
        $challanNo = $challan->challan_no;

        DB::transaction(function () use ($challan, $challanNo): void {
            FabricRoll::where('challan_no', $challanNo)->update(['challan_no' => null]);
            $challan->delete();
        });

        return back()->with('success', "Delivery challan {$challanNo} deleted.");
    }

    private function nextChallanNo(): string
    {
        $maxSeq = DeliveryChallan::query()
            ->pluck('challan_no')
            ->map(function (string $code): int {
                return preg_match('/(?:DC-)?(\d+)/', $code, $m) ? (int) $m[1] : 0;
            })
            ->max() ?? 872;

        $candidate = max(872, $maxSeq) + 1;
        while (DeliveryChallan::where('challan_no', 'DC-'.str_pad((string) $candidate, 4, '0', STR_PAD_LEFT))->exists()) {
            $candidate++;
        }

        return 'DC-'.str_pad((string) $candidate, 4, '0', STR_PAD_LEFT);
    }
}
