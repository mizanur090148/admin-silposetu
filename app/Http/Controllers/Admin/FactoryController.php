<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\Employee;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\FactoryExpense;
use App\Models\FactoryMachine;
use App\Models\Party;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use App\Models\User;
use App\Support\PlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class FactoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $planCode = $request->input('plan_code', 'all');
        $billingCycle = $request->input('billing_cycle', 'all');
        $qrFilter = $request->input('qr_sticker', 'all');
        $healthFilter = (string) $request->input('health', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $healthIds = null;
        if (in_array($healthFilter, ['expiring', 'expired', 'over_quota'], true)) {
            $healthIds = Factory::query()
                ->withCount('factoryMachines')
                ->get(['id', 'plan_code', 'total_machines', 'trial_ends_at'])
                ->filter(function (Factory $f) use ($healthFilter): bool {
                    $health = PlanCatalog::factoryHealth($f, (int) $f->factory_machines_count);
                    if ($healthFilter === 'over_quota') {
                        return $health['over_quota'];
                    }

                    return $health['trial_state'] === $healthFilter;
                })
                ->pluck('id')
                ->all();
        }

        $query = Factory::query()
            ->with('owner:id,name,phone,email')
            ->withCount(['factoryMachines', 'users', 'freeMachineRequests', 'subcontractPosts', 'subcontractOrders'])
            ->when($healthIds !== null, function ($q) use ($healthIds): void {
                $q->whereIn('id', $healthIds ?: [-1]);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhereHas('owner', function ($uq) use ($search): void {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($planCode !== 'all', function ($q) use ($planCode): void {
                $q->where('plan_code', $planCode);
            })
            ->when($billingCycle !== 'all', function ($q) use ($billingCycle): void {
                $q->where('billing_cycle', $billingCycle);
            })
            ->when($qrFilter !== 'all', function ($q) use ($qrFilter): void {
                $q->where('qr_sticker_enabled', $qrFilter === '1');
            });

        $factories = $query->latest('id')->paginate($perPage)->withQueryString();

        $summary = [
            'total_factories' => Factory::count(),
            'total_configured_machines' => (int) Factory::sum('total_machines'),
            'tracked_machines' => FactoryMachine::count(),
            'qr_enabled' => Factory::where('qr_sticker_enabled', true)->count(),
        ];

        return Inertia::render('Admin/Factories/Index', [
            'factories' => $factories,
            'summary' => $summary,
            'plans' => Factory::query()->whereNotNull('plan_code')->distinct()->orderBy('plan_code')->pluck('plan_code'),
            'filters' => [
                'search' => $search,
                'plan_code' => $planCode,
                'billing_cycle' => $billingCycle,
                'qr_sticker' => $qrFilter,
                'health' => $healthFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        $owners = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'role', 'organization_name']);

        return Inertia::render('Admin/Factories/Create', [
            'owners' => $owners,
            'suggestedCode' => $this->nextFactoryCode(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:30', Rule::unique('factories', 'code')],
            'name' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'total_machines' => ['required', 'integer', 'min:0'],
            'plan_code' => ['required', 'string', 'max:10'],
            'trial_ends_at' => ['nullable', 'date'],
            'owner_id' => ['nullable', 'integer', 'exists:users,id'],
            'billing_cycle' => ['required', 'string', Rule::in(['m', 'y'])],
            'qr_sticker_enabled' => ['boolean'],
            'last_update_label' => ['nullable', 'string', 'max:255'],
            'yearly_orders_count' => ['nullable', 'integer', 'min:0'],
            'ontime_delivery_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'qc_reject_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'machines' => ['nullable', 'array'],
            'machines.*.code' => ['required_with:machines', 'string', 'max:20', 'distinct'],
            'machines.*.knit_type' => ['required_with:machines', 'string', Rule::in(['c', 'f'])],
            'machines.*.dia' => ['nullable', 'integer', 'min:1', 'max:120'],
            'machines.*.gauge' => ['required_with:machines', 'integer', 'min:1', 'max:60'],
            'machines.*.spec_label' => ['nullable', 'string', 'max:40'],
            'machines.*.brand' => ['nullable', 'string', 'max:255'],
            'machines.*.status' => ['nullable', 'string', 'max:50'],
            'machines.*.broadcast_free' => ['boolean'],
            'machines.*.daily_capacity_kg' => ['nullable', 'integer', 'min:1'],
            'machines.*.rate_label' => ['nullable', 'string', 'max:255'],
            'machines.*.supported_fabrics' => ['nullable', 'string', 'max:500'],
        ]);

        $factory = DB::transaction(function () use ($validated, $request): Factory {
            $code = trim((string) ($validated['code'] ?? ''));
            if ($code === '') {
                $code = $this->nextFactoryCode();
            }

            $factory = Factory::create([
                'code' => $code,
                'name' => $validated['name'],
                'area' => $validated['area'] ?? null,
                'address' => $validated['address'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'total_machines' => $validated['total_machines'],
                'plan_code' => $validated['plan_code'],
                'trial_ends_at' => $validated['trial_ends_at'] ?? null,
                'owner_id' => $validated['owner_id'] ?? null,
                'billing_cycle' => $validated['billing_cycle'],
                'qr_sticker_enabled' => $request->boolean('qr_sticker_enabled', true),
                'last_update_label' => ! empty($validated['last_update_label']) ? $validated['last_update_label'] : 'আজ ২:০০',
                'yearly_orders_count' => $validated['yearly_orders_count'] ?? 14,
                'ontime_delivery_pct' => $validated['ontime_delivery_pct'] ?? 93.00,
                'qc_reject_pct' => $validated['qc_reject_pct'] ?? 0.60,
            ]);

            if (! empty($validated['owner_id'])) {
                User::where('id', $validated['owner_id'])->whereNull('factory_id')->update(['factory_id' => $factory->id]);
            }

            foreach ($validated['machines'] ?? [] as $row) {
                $knitType = $row['knit_type'] ?? 'c';
                $dia = $row['dia'] ?? null;
                $gauge = (int) ($row['gauge'] ?? 24);
                $specLabel = trim((string) ($row['spec_label'] ?? ''));
                if ($specLabel === '') {
                    $specLabel = $knitType === 'f' ? "ফ্ল্যাট · {$gauge}G" : ($dia ? "{$dia}\" × {$gauge}G" : "{$gauge}G");
                }

                $supported = collect(explode(',', (string) ($row['supported_fabrics'] ?? '')))
                    ->map(fn (string $v): string => trim($v))
                    ->filter()
                    ->values()
                    ->all();

                $factory->factoryMachines()->create([
                    'code' => trim((string) $row['code']),
                    'knit_type' => $knitType,
                    'dia' => $dia,
                    'gauge' => $gauge,
                    'spec_label' => $specLabel,
                    'brand' => $row['brand'] ?? null,
                    'status' => ! empty($row['status']) ? $row['status'] : 'idle',
                    'broadcast_free' => (bool) ($row['broadcast_free'] ?? false),
                    'daily_capacity_kg' => $row['daily_capacity_kg'] ?? 190,
                    'rate_label' => $row['rate_label'] ?? null,
                    'supported_fabrics_json' => ! empty($supported) ? $supported : null,
                ]);
            }

            return $factory;
        });

        return redirect()->route('admin.factories.show', $factory->id)
            ->with('success', "Factory \"{$factory->name}\" ({$factory->code}) created successfully.");
    }

    public function show(int $id): Response
    {
        $factory = Factory::query()
            ->with([
                'owner:id,name,phone,email,role',
                'users:id,factory_id,name,phone,email,role,designation,is_owner,is_active,subscription_plan',
                'factoryMachines' => fn ($q) => $q->orderBy('code'),
                'freeMachineRequests' => fn ($q) => $q->latest('id')->limit(10),
                'subcontractPosts' => fn ($q) => $q->withCount('quotations')->latest('id')->limit(10),
                'vendors:id,factory_id,code,name,type,phone,is_verified',
            ])
            ->withCount(['factoryMachines', 'users', 'subcontractOrders', 'parties', 'employees'])
            ->findOrFail($id);

        $orderNos = SubcontractOrder::where('factory_id', $factory->id)->pluck('order_no');
        $bills = Bill::where('factory_code', $factory->code)->latest('id')->get();
        $billedTk = 0.0;
        $paidTk = 0.0;
        $recentBills = $bills->take(5)->map(function (Bill $bill): array {
            $t = PlanCatalog::billTotals($bill);

            return [
                'id' => $bill->id,
                'bill_no' => $bill->bill_no,
                'party_code' => $bill->party_code,
                'jv_no' => $bill->jv_no,
                'bill_date' => $bill->bill_date?->format('Y-m-d'),
                ...$t,
            ];
        })->values();

        foreach ($bills as $b) {
            $t = PlanCatalog::billTotals($b);
            $billedTk += $t['gross_tk'];
            $paidTk += $t['paid_tk'];
        }

        $health = PlanCatalog::factoryHealth($factory, (int) $factory->factory_machines_count);
        $planMeta = PlanCatalog::get($factory->plan_code);

        $erpOverview = [
            'active_orders' => SubcontractOrder::where('factory_id', $factory->id)->whereIn('status', ['run', 'running'])->count(),
            'total_orders' => SubcontractOrder::where('factory_id', $factory->id)->count(),
            'parties_count' => Party::where('factory_id', $factory->id)->count(),
            'employees_count' => Employee::where('factory_id', $factory->id)->count(),
            'attendances_count' => FactoryAttendance::where('factory_id', $factory->id)->count(),
            'qc_count' => QcInspection::whereIn('order_no', $orderNos)->count(),
            'challans_count' => DeliveryChallan::where('factory_code', $factory->code)->count(),
            'billed_tk' => round($billedTk, 2),
            'paid_tk' => round($paidTk, 2),
            'expenses_tk' => (float) FactoryExpense::where('factory_id', $factory->id)->sum('amount_tk'),
            'plan_meta' => $planMeta,
            'health' => $health,
            'recent_orders' => SubcontractOrder::where('factory_id', $factory->id)
                ->latest('id')
                ->take(8)
                ->get(['id', 'order_no', 'buyer', 'party_code', 'fabric_summary', 'total_qty_kg', 'done_kg', 'delivered_kg', 'rate_tk', 'status']),
            'recent_bills' => $recentBills,
            'recent_expenses' => FactoryExpense::where('factory_id', $factory->id)
                ->latest('expense_date')
                ->take(5)
                ->get(['id', 'category', 'title', 'amount_tk', 'payment_method', 'expense_date']),
            'parties' => Party::where('factory_id', $factory->id)
                ->orderBy('name')
                ->take(10)
                ->get(['id', 'code', 'name', 'type', 'phone', 'default_rate_tk', 'is_active']),
            'employees' => Employee::where('factory_id', $factory->id)
                ->orderBy('name')
                ->take(12)
                ->get(['id', 'employee_type', 'name', 'designation', 'shift', 'machine_assigned', 'daily_wage', 'status']),
        ];

        return Inertia::render('Admin/Factories/Show', [
            'factory' => $factory,
            'erpOverview' => $erpOverview,
        ]);
    }

    public function edit(int $id): Response
    {
        $factory = Factory::query()
            ->with(['owner:id,name,phone', 'factoryMachines' => fn ($q) => $q->orderBy('code')])
            ->findOrFail($id);

        $owners = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'role', 'organization_name']);

        return Inertia::render('Admin/Factories/Edit', [
            'factory' => $factory,
            'owners' => $owners,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $factory = Factory::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', Rule::unique('factories', 'code')->ignore($factory->id)],
            'name' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'total_machines' => ['required', 'integer', 'min:0'],
            'plan_code' => ['required', 'string', 'max:10'],
            'trial_ends_at' => ['nullable', 'date'],
            'owner_id' => ['nullable', 'integer', 'exists:users,id'],
            'billing_cycle' => ['required', 'string', Rule::in(['m', 'y'])],
            'qr_sticker_enabled' => ['boolean'],
            'last_update_label' => ['nullable', 'string', 'max:255'],
            'yearly_orders_count' => ['nullable', 'integer', 'min:0'],
            'ontime_delivery_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'qc_reject_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $factory->update([
            'code' => trim($validated['code']),
            'name' => $validated['name'],
            'area' => $validated['area'] ?? null,
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'total_machines' => $validated['total_machines'],
            'plan_code' => $validated['plan_code'],
            'trial_ends_at' => $validated['trial_ends_at'] ?? null,
            'owner_id' => $validated['owner_id'] ?? null,
            'billing_cycle' => $validated['billing_cycle'],
            'qr_sticker_enabled' => $request->boolean('qr_sticker_enabled'),
            'last_update_label' => ! empty($validated['last_update_label']) ? $validated['last_update_label'] : $factory->last_update_label,
            'yearly_orders_count' => $validated['yearly_orders_count'] ?? $factory->yearly_orders_count,
            'ontime_delivery_pct' => $validated['ontime_delivery_pct'] ?? $factory->ontime_delivery_pct,
            'qc_reject_pct' => $validated['qc_reject_pct'] ?? $factory->qc_reject_pct,
        ]);

        return redirect()->route('admin.factories.show', $factory->id)
            ->with('success', "Factory \"{$factory->name}\" updated successfully.");
    }

    public function toggleQrSticker(int $id): RedirectResponse
    {
        $factory = Factory::findOrFail($id);
        $factory->update(['qr_sticker_enabled' => ! $factory->qr_sticker_enabled]);

        $state = $factory->qr_sticker_enabled ? 'enabled' : 'disabled';

        return back()->with('success', "QR sticker feature {$state} for \"{$factory->name}\".");
    }

    public function extendTrial(Request $request, int $id): RedirectResponse
    {
        $factory = Factory::findOrFail($id);

        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $base = $factory->trial_ends_at && Carbon::parse($factory->trial_ends_at)->isFuture()
            ? Carbon::parse($factory->trial_ends_at)
            : now();

        $factory->update([
            'trial_ends_at' => $base->copy()->addDays($days),
        ]);

        return back()->with('success', "Extended trial for \"{$factory->name}\" by {$days} days.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $factory = Factory::findOrFail($id);
        $name = $factory->name;

        DB::transaction(function () use ($factory): void {
            User::where('factory_id', $factory->id)->update(['factory_id' => null]);
            $factory->delete();
        });

        return redirect()->route('admin.factories.index')
            ->with('success', "Factory \"{$name}\" and its factory-owned records deleted.");
    }

    public function importView(): Response
    {
        return Inertia::render('Admin/Factories/Import', [
            'existingPlans' => Factory::query()->whereNotNull('plan_code')->distinct()->pluck('plan_code'),
        ]);
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['code', 'name', 'area', 'address', 'phone', 'total_machines', 'plan_code', 'billing_cycle', 'qr_sticker_enabled']);
            fputcsv($handle, ['f99', 'Padma Knitwear Ltd', 'কোনাবাড়ি, গাজীপুর', 'Plot 14, BSCIC Industrial Area', '01711009988', '28', 'g', 'm', '1']);
            fclose($handle);
        }, 'factories-import-template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function importStore(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'skip_duplicates' => ['boolean'],
        ]);

        $skipDuplicates = $request->boolean('skip_duplicates', true);
        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if ($handle === false) {
            return back()->with('error', 'Unable to open uploaded CSV file.');
        }

        $header = fgetcsv($handle);
        if (! is_array($header)) {
            fclose($handle);

            return back()->with('error', 'CSV file is empty or invalid.');
        }

        $header = array_map(fn ($col): string => strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', (string) $col))), $header);

        $created = 0;
        $skipped = 0;
        $failed = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if (count(array_filter($row, fn ($v): bool => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $assoc = [];
            foreach ($header as $idx => $key) {
                $assoc[$key] = trim((string) ($row[$idx] ?? ''));
            }

            $name = $assoc['name'] ?? '';
            if ($name === '') {
                $failed++;
                $errors[] = "Row {$line}: Factory name is required.";

                continue;
            }

            $code = ($assoc['code'] ?? '') !== '' ? $assoc['code'] : $this->nextFactoryCode();
            if (Factory::where('code', $code)->exists()) {
                if ($skipDuplicates) {
                    $skipped++;

                    continue;
                }

                $failed++;
                $errors[] = "Row {$line}: Duplicate factory code \"{$code}\".";

                continue;
            }

            try {
                Factory::create([
                    'code' => $code,
                    'name' => $name,
                    'area' => ($assoc['area'] ?? '') !== '' ? $assoc['area'] : null,
                    'address' => ($assoc['address'] ?? '') !== '' ? $assoc['address'] : null,
                    'phone' => ($assoc['phone'] ?? '') !== '' ? $assoc['phone'] : null,
                    'total_machines' => max(0, (int) (($assoc['total_machines'] ?? '') !== '' ? $assoc['total_machines'] : 24)),
                    'plan_code' => ($assoc['plan_code'] ?? '') !== '' ? $assoc['plan_code'] : 'g',
                    'billing_cycle' => in_array($assoc['billing_cycle'] ?? '', ['m', 'y'], true) ? $assoc['billing_cycle'] : 'm',
                    'qr_sticker_enabled' => ($assoc['qr_sticker_enabled'] ?? '1') !== '0',
                ]);
                $created++;
            } catch (Throwable $e) {
                $failed++;
                $errors[] = "Row {$line}: {$e->getMessage()}";
            }
        }

        fclose($handle);

        return back()
            ->with('success', "Import finished: {$created} created, {$skipped} skipped, {$failed} failed.")
            ->with('importReport', [
                'created' => $created,
                'skipped' => $skipped,
                'failed' => $failed,
                'errors' => array_slice($errors, 0, 20),
            ]);
    }

    private function nextFactoryCode(): string
    {
        $maxNum = Factory::query()
            ->pluck('code')
            ->map(function (string $code): int {
                return preg_match('/^f(\d+)$/i', $code, $m) ? (int) $m[1] : 0;
            })
            ->max() ?? 0;

        $candidateNum = $maxNum + 1;
        while (Factory::where('code', "f{$candidateNum}")->exists()) {
            $candidateNum++;
        }

        return "f{$candidateNum}";
    }
}
