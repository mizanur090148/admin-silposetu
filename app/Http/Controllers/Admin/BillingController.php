<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Factory;
use App\Models\FactoryExpense;
use App\Models\StoreItem;
use App\Support\PlanCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $factoryCode = $request->input('factory_code', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $billQuery = Bill::query()
            ->with('factory:id,code,name,area')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('bill_no', 'like', "%{$search}%")
                        ->orWhere('jv_no', 'like', "%{$search}%")
                        ->orWhere('party_code', 'like', "%{$search}%")
                        ->orWhere('factory_code', 'like', "%{$search}%");
                });
            })
            ->when($factoryCode !== 'all', function ($q) use ($factoryCode): void {
                $q->where('factory_code', $factoryCode);
            });

        $bills = $billQuery->latest('id')->paginate($perPage)->withQueryString();
        $bills->through(function (Bill $bill): array {
            $totals = PlanCatalog::billTotals($bill);

            return [
                'id' => $bill->id,
                'bill_no' => $bill->bill_no,
                'factory_code' => $bill->factory_code,
                'party_code' => $bill->party_code,
                'bill_date' => $bill->bill_date?->format('Y-m-d'),
                'jv_no' => $bill->jv_no,
                'lines_count' => count($bill->lines_json ?? []),
                'payments_count' => count($bill->payments_json ?? []),
                'factory' => $bill->factory,
                ...$totals,
            ];
        });

        $allBills = Bill::all(['lines_json', 'payments_json']);
        $billedTk = 0.0;
        $collectedTk = 0.0;
        $pendingTk = 0.0;
        foreach ($allBills as $b) {
            $t = PlanCatalog::billTotals($b);
            $billedTk += $t['gross_tk'];
            $collectedTk += $t['paid_tk'];
            $pendingTk += $t['pending_tk'];
        }

        $expenses = FactoryExpense::query()
            ->with('factory:id,code,name')
            ->when($factoryCode !== 'all', function ($q) use ($factoryCode): void {
                $q->whereHas('factory', fn ($fq) => $fq->where('code', $factoryCode));
            })
            ->latest('expense_date')
            ->limit(15)
            ->get();

        $lowStockItems = StoreItem::query()
            ->whereColumn('stock_qty', '<=', 'min_qty')
            ->orderBy('stock_qty')
            ->limit(12)
            ->get();

        return Inertia::render('Admin/Billing/Index', [
            'bills' => $bills,
            'expenses' => $expenses,
            'lowStockItems' => $lowStockItems,
            'summary' => [
                'total_bills' => $allBills->count(),
                'billed_tk' => round($billedTk, 2),
                'collected_tk' => round($collectedTk, 2),
                'due_tk' => max(0.0, round($billedTk - $collectedTk, 2)),
                'pending_tk' => round($pendingTk, 2),
                'expenses_tk' => (float) FactoryExpense::sum('amount_tk'),
                'low_stock_count' => StoreItem::whereColumn('stock_qty', '<=', 'min_qty')->count(),
            ],
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'factory_code' => $factoryCode,
                'per_page' => $perPage,
            ],
        ]);
    }
}
