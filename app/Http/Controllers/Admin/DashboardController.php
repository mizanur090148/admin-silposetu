<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\Employee;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\FactoryExpense;
use App\Models\FactoryMachine;
use App\Models\FreeMachineRequest;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\MessageThread;
use App\Models\Partner;
use App\Models\Production;
use App\Models\QcInspection;
use App\Models\Quotation;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Models\SubcontractPost;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Models\User;
use App\Models\Vendor;
use App\Support\PlanCatalog;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $roleCounts = User::query()
            ->selectRaw('role, COUNT(*) as aggregate')
            ->groupBy('role')
            ->pluck('aggregate', 'role');

        $factoriesWithMachineCounts = Factory::query()
            ->withCount('factoryMachines')
            ->get(['id', 'code', 'plan_code', 'billing_cycle', 'total_machines', 'trial_ends_at']);

        $estimatedMrr = 0.0;
        $expiringTrials = 0;
        $overQuotaFactories = 0;
        $planDistribution = ['s' => 0, 'g' => 0, 'p' => 0, 'e' => 0, 'other' => 0];

        foreach ($factoriesWithMachineCounts as $f) {
            $estimatedMrr += PlanCatalog::monthlyRevenueFor($f);
            $health = PlanCatalog::factoryHealth($f, (int) $f->factory_machines_count);
            if ($health['trial_state'] === 'expiring') {
                $expiringTrials++;
            }
            if ($health['over_quota']) {
                $overQuotaFactories++;
            }

            $planKey = strtolower((string) $f->plan_code);
            if (array_key_exists($planKey, $planDistribution)) {
                $planDistribution[$planKey]++;
            } else {
                $planDistribution['other']++;
            }
        }

        $billedTk = 0.0;
        $collectedTk = 0.0;
        foreach (Bill::all(['lines_json', 'payments_json']) as $bill) {
            $t = PlanCatalog::billTotals($bill);
            $billedTk += $t['gross_tk'];
            $collectedTk += $t['paid_tk'];
        }

        $pendingQcSigns = QcInspection::all(['factory_sign_json', 'vendor_sign_json'])
            ->filter(function (QcInspection $qc): bool {
                $facSigned = ! empty(($qc->factory_sign_json ?? [])['v']);
                $venSigned = ! empty(($qc->vendor_sign_json ?? [])['v']);

                return ! $facSigned || ! $venSigned;
            })
            ->count();

        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'users_by_role' => [
                'fac' => (int) ($roleCounts['fac'] ?? 0),
                'ven' => (int) ($roleCounts['ven'] ?? 0),
                'sup' => (int) ($roleCounts['sup'] ?? 0),
                'par' => (int) ($roleCounts['par'] ?? 0),
                'admin' => (int) ($roleCounts['admin'] ?? 0),
            ],
            'total_factories' => $factoriesWithMachineCounts->count(),
            'qr_enabled_factories' => Factory::where('qr_sticker_enabled', true)->count(),
            'configured_machines' => (int) Factory::sum('total_machines'),
            'estimated_mrr_tk' => round($estimatedMrr, 2),
            'expiring_trials' => $expiringTrials,
            'over_quota_factories' => $overQuotaFactories,
            'plan_distribution' => $planDistribution,
            'total_machines' => FactoryMachine::count(),
            'idle_machines' => FactoryMachine::where('status', 'idle')->count(),
            'running_machines' => FactoryMachine::where('status', 'like', 'run%')->count(),
            'down_machines' => FactoryMachine::where('status', 'down')->count(),
            'broadcast_free_machines' => FactoryMachine::where('broadcast_free', true)->count(),
            'total_daily_capacity_kg' => (int) FactoryMachine::sum('daily_capacity_kg'),
            'total_posts' => SubcontractPost::count(),
            'open_posts' => SubcontractPost::where('status', 'open')->count(),
            'work_offer_posts' => SubcontractPost::where('post_type', 'work_offer')->count(),
            'machine_available_posts' => SubcontractPost::where('post_type', 'machine_available')->count(),
            'total_quotations' => Quotation::count(),
            'pending_quotations' => Quotation::where('status', 'pending')->count(),
            'total_machine_requests' => FreeMachineRequest::count(),
            'new_machine_requests' => FreeMachineRequest::where('status', 'new')->count(),
            'total_suppliers' => Supplier::count(),
            'verified_suppliers' => Supplier::where('is_verified', true)->count(),
            'total_rfqs' => SupplierRfq::count(),
            'new_rfqs' => SupplierRfq::where('status', 'new')->count(),
            'total_vendors' => Vendor::count(),
            'verified_vendors' => Vendor::where('is_verified', true)->count(),
            'total_partners' => Partner::count(),
            'total_partner_commission_tk' => (float) Partner::sum('total_commission_tk'),
            'total_ads' => Advertisement::count(),
            'pending_ads' => Advertisement::where('status', 'pending')->count(),
            'active_ads' => Advertisement::where('status', 'active')->count(),
            'total_jobs' => JobListing::count(),
            'total_job_applications' => JobApplication::count(),
            'active_orders' => SubcontractOrder::whereIn('status', ['run', 'running'])->count(),
            'total_orders' => SubcontractOrder::count(),
            'total_knitted_kg' => (float) Production::sum('qty_kg'),
            'total_rolls' => FabricRoll::count(),
            'total_qc_inspections' => QcInspection::count(),
            'pending_qc_signs' => $pendingQcSigns,
            'total_challans' => DeliveryChallan::count(),
            'total_employees' => Employee::count(),
            'present_attendances' => FactoryAttendance::whereIn('status', ['present', 'overtime'])->count(),
            'low_stock_items' => StoreItem::whereColumn('stock_qty', '<=', 'min_qty')->count(),
            'unread_threads' => MessageThread::where('unread_count', '>', 0)->count(),
            'total_billed_tk' => round($billedTk, 2),
            'total_collected_tk' => round($collectedTk, 2),
            'total_expenses_tk' => (float) FactoryExpense::sum('amount_tk'),
        ];

        $recentFactories = Factory::query()
            ->with('owner:id,name,phone')
            ->withCount(['factoryMachines', 'users', 'subcontractOrders'])
            ->latest('id')
            ->take(5)
            ->get();

        $recentPosts = SubcontractPost::query()
            ->with(['factory:id,code,name', 'user:id,name'])
            ->withCount('quotations')
            ->latest('id')
            ->take(5)
            ->get();

        $recentMachineRequests = FreeMachineRequest::query()
            ->with('factory:id,code,name')
            ->latest('id')
            ->take(5)
            ->get();

        $recentRfqs = SupplierRfq::query()
            ->with('factory:id,code,name')
            ->latest('id')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentFactories' => $recentFactories,
            'recentPosts' => $recentPosts,
            'recentMachineRequests' => $recentMachineRequests,
            'recentRfqs' => $recentRfqs,
        ]);
    }
}
