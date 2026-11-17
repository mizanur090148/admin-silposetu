<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Factory;
use App\Models\FactoryExpense;
use App\Models\Party;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Support\PlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = (string) $request->input('tab', 'bills');
        if (! in_array($tab, ['bills', 'expenses', 'store'], true)) {
            $tab = 'bills';
        }

        $search = trim((string) $request->input('search', ''));
        $factoryCode = (string) $request->input('factory_code', 'all');
        $expenseCategory = (string) $request->input('expense_category', 'all');
        $stockFilter = (string) $request->input('stock_filter', 'all');
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

        $bills = $billQuery->latest('id')->paginate($perPage, ['*'], 'bill_page')->withQueryString();
        $bills->through(function (Bill $bill): array {
            $totals = PlanCatalog::billTotals($bill);

            return [
                'id' => $bill->id,
                'bill_no' => $bill->bill_no,
                'factory_code' => $bill->factory_code,
                'party_code' => $bill->party_code,
                'bill_date' => $bill->bill_date?->format('Y-m-d'),
                'jv_no' => $bill->jv_no,
                'lines_json' => $bill->lines_json ?? [],
                'payments_json' => $bill->payments_json ?? [],
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
            ->when($expenseCategory !== 'all', function ($q) use ($expenseCategory): void {
                $q->where('category', $expenseCategory);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('reference_no', 'like', "%{$search}%")
                        ->orWhere('created_by', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('expense_date')
            ->latest('id')
            ->paginate($perPage, ['*'], 'exp_page')
            ->withQueryString();

        $lowStockItems = StoreItem::query()
            ->whereColumn('stock_qty', '<=', 'min_qty')
            ->orderBy('stock_qty')
            ->get();

        $storeItems = StoreItem::query()
            ->when($stockFilter === 'low', function ($q): void {
                $q->whereColumn('stock_qty', '<=', 'min_qty');
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('item_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->orderBy('id')
            ->get();

        $storeIssueLogs = StoreIssueLog::query()
            ->with('item:id,item_code,name,unit')
            ->latest('id')
            ->limit(30)
            ->get();

        return Inertia::render('Admin/Billing/Index', [
            'tab' => $tab,
            'bills' => $bills,
            'expenses' => $expenses,
            'lowStockItems' => $lowStockItems,
            'storeItems' => $storeItems,
            'storeIssueLogs' => $storeIssueLogs,
            'expenseCategories' => FactoryExpense::query()->distinct()->orderBy('category')->pluck('category'),
            'summary' => [
                'total_bills' => $allBills->count(),
                'billed_tk' => round($billedTk, 2),
                'collected_tk' => round($collectedTk, 2),
                'due_tk' => max(0.0, round($billedTk - $collectedTk, 2)),
                'pending_tk' => round($pendingTk, 2),
                'expenses_tk' => (float) FactoryExpense::sum('amount_tk'),
                'low_stock_count' => $lowStockItems->count(),
                'total_store_items' => StoreItem::count(),
                'issue_logs_count' => StoreIssueLog::count(),
            ],
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'parties' => Party::orderBy('name')->get(['id', 'factory_id', 'code', 'name', 'type']),
            'orders' => SubcontractOrder::orderByDesc('id')->get(['id', 'order_no', 'factory_id', 'party_code', 'fabric_summary', 'delivered_kg', 'done_kg', 'rate_tk']),
            'filters' => [
                'search' => $search,
                'factory_code' => $factoryCode,
                'expense_category' => $expenseCategory,
                'stock_filter' => $stockFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function storeBill(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bill_no' => ['nullable', 'string', 'max:40', Rule::unique('bills', 'bill_no')],
            'factory_code' => ['required', 'string', 'exists:factories,code'],
            'party_code' => ['required', 'string', 'max:40'],
            'bill_date' => ['required', 'date'],
            'jv_no' => ['nullable', 'string', 'max:40'],
            'order_no' => ['required', 'string', 'max:100'],
            'fabrication' => ['required', 'string', 'max:255'],
            'qty_kg' => ['required', 'numeric', 'min:0.1'],
            'rate_tk' => ['required', 'numeric', 'min:0'],
        ]);

        $count = Bill::count() + 1;
        $billNo = trim((string) ($validated['bill_no'] ?? ''));
        if ($billNo === '') {
            $billNo = 'BL-'.now()->format('ym').'-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
            while (Bill::where('bill_no', $billNo)->exists()) {
                $count++;
                $billNo = 'BL-'.now()->format('ym').'-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
            }
        }

        $jvNo = trim((string) ($validated['jv_no'] ?? ''));
        if ($jvNo === '') {
            $jvNo = 'JV-'.str_pad((string) ($count + 926), 4, '0', STR_PAD_LEFT);
        }

        Bill::create([
            'bill_no' => $billNo,
            'factory_code' => $validated['factory_code'],
            'party_code' => trim($validated['party_code']),
            'bill_date' => $validated['bill_date'],
            'jv_no' => $jvNo,
            'lines_json' => [
                [
                    'o' => trim($validated['order_no']),
                    'fab' => trim($validated['fabrication']),
                    'kg' => (float) $validated['qty_kg'],
                    'rate' => (float) $validated['rate_tk'],
                ],
            ],
            'payments_json' => [],
        ]);

        return back()->with('success', "Invoice {$billNo} created.");
    }

    public function recordPayment(Request $request, int $id): RedirectResponse
    {
        $bill = Bill::findOrFail($id);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'mode' => ['required', 'string', 'max:100'],
            'rv_no' => ['nullable', 'string', 'max:40'],
            'payment_date' => ['nullable', 'date'],
            'pend' => ['boolean'],
        ]);

        $payments = $bill->payments_json ?? [];
        $rvNo = trim((string) ($validated['rv_no'] ?? ''));
        if ($rvNo === '') {
            $rvNo = 'RV-'.str_pad((string) (count($payments) + 931), 4, '0', STR_PAD_LEFT);
        }

        $payments[] = [
            'd' => ! empty($validated['payment_date']) ? $validated['payment_date'] : now()->toDateString(),
            'rv' => $rvNo,
            'amt' => (float) $validated['amount'],
            'mode' => trim($validated['mode']),
            'pend' => $request->boolean('pend'),
        ];

        $bill->update(['payments_json' => $payments]);

        return back()->with('success', "Receipt {$rvNo} (৳{$validated['amount']}) recorded on {$bill->bill_no}.");
    }

    public function clearPendingPayment(int $id, int $index): RedirectResponse
    {
        $bill = Bill::findOrFail($id);
        $payments = $bill->payments_json ?? [];

        if (! isset($payments[$index]) || ! is_array($payments[$index])) {
            return back()->with('error', 'Payment entry not found.');
        }

        $payments[$index]['pend'] = false;
        $bill->update(['payments_json' => $payments]);

        return back()->with('success', "Receipt cleared on {$bill->bill_no}.");
    }

    public function destroyBill(int $id): RedirectResponse
    {
        $bill = Bill::findOrFail($id);
        $no = $bill->bill_no;
        $bill->delete();

        return back()->with('success', "Invoice {$no} deleted.");
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'category' => ['required', 'string', 'max:40'],
            'title' => ['required', 'string', 'max:255'],
            'amount_tk' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'max:30'],
            'reference_no' => ['nullable', 'string', 'max:40'],
            'expense_date' => ['required', 'date'],
            'created_by' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        FactoryExpense::create([
            'factory_id' => $validated['factory_id'],
            'category' => trim($validated['category']),
            'title' => trim($validated['title']),
            'amount_tk' => (float) $validated['amount_tk'],
            'payment_method' => trim($validated['payment_method']),
            'reference_no' => ! empty($validated['reference_no']) ? trim($validated['reference_no']) : ('EX-'.now()->format('His')),
            'expense_date' => $validated['expense_date'],
            'created_by' => ! empty($validated['created_by']) ? trim($validated['created_by']) : ($request->user()?->name ?: 'Admin'),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', "Expense \"{$validated['title']}\" recorded.");
    }

    public function updateExpense(Request $request, int $id): RedirectResponse
    {
        $expense = FactoryExpense::findOrFail($id);

        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'category' => ['required', 'string', 'max:40'],
            'title' => ['required', 'string', 'max:255'],
            'amount_tk' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'max:30'],
            'reference_no' => ['nullable', 'string', 'max:40'],
            'expense_date' => ['required', 'date'],
            'created_by' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $expense->update($validated);

        return back()->with('success', "Expense \"{$expense->title}\" updated.");
    }

    public function destroyExpense(int $id): RedirectResponse
    {
        $expense = FactoryExpense::findOrFail($id);
        $title = $expense->title;
        $expense->delete();

        return back()->with('success', "Expense \"{$title}\" deleted.");
    }

    public function storeItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'item_code' => ['nullable', 'string', 'max:20', Rule::unique('store_items', 'item_code')],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:60'],
            'unit' => ['required', 'string', 'max:20'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'min_qty' => ['required', 'integer', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'rfq_sent' => ['boolean'],
        ]);

        $code = trim((string) ($validated['item_code'] ?? ''));
        if ($code === '') {
            $seq = StoreItem::count() + 1;
            $code = 'ST-'.str_pad((string) $seq, 2, '0', STR_PAD_LEFT);
            while (StoreItem::where('item_code', $code)->exists()) {
                $seq++;
                $code = 'ST-'.str_pad((string) $seq, 2, '0', STR_PAD_LEFT);
            }
        }

        StoreItem::create([
            'item_code' => $code,
            'name' => trim($validated['name']),
            'category' => trim($validated['category']),
            'unit' => trim($validated['unit']),
            'stock_qty' => $validated['stock_qty'],
            'min_qty' => $validated['min_qty'],
            'unit_price' => $validated['unit_price'],
            'rfq_sent' => $request->boolean('rfq_sent'),
        ]);

        return back()->with('success', "Store item {$code} added.");
    }

    public function updateItem(Request $request, int $id): RedirectResponse
    {
        $item = StoreItem::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:60'],
            'unit' => ['required', 'string', 'max:20'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'min_qty' => ['required', 'integer', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'rfq_sent' => ['boolean'],
        ]);

        $item->update([
            ...$validated,
            'rfq_sent' => $request->boolean('rfq_sent'),
        ]);

        return back()->with('success', "Store item {$item->item_code} updated.");
    }

    public function toggleItemRfq(int $id): RedirectResponse
    {
        $item = StoreItem::findOrFail($id);
        $item->update(['rfq_sent' => ! $item->rfq_sent]);

        return back()->with('success', "RFQ flag toggled for {$item->item_code}.");
    }

    public function recordStockMovement(Request $request, int $id): RedirectResponse
    {
        $item = StoreItem::findOrFail($id);

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['in', 'out'])],
            'qty' => ['required', 'integer', 'min:1'],
            'machine_code' => ['nullable', 'string', 'max:30'],
            'issued_by' => ['nullable', 'string', 'max:60'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $qty = (int) $validated['qty'];

        if ($validated['type'] === 'out' && $qty > $item->stock_qty) {
            return back()->with('error', "Insufficient stock for {$item->item_code} (available: {$item->stock_qty} {$item->unit}).");
        }

        DB::transaction(function () use ($item, $validated, $qty, $request): void {
            if ($validated['type'] === 'out') {
                $item->decrement('stock_qty', $qty);
                StoreIssueLog::create([
                    'item_code' => $item->item_code,
                    'date_label' => now()->format('d M'),
                    'machine_code' => ! empty($validated['machine_code']) ? trim($validated['machine_code']) : 'সব মেশিন',
                    'qty' => $qty,
                    'issued_by' => ! empty($validated['issued_by']) ? trim($validated['issued_by']) : ($request->user()?->name ?: 'Admin'),
                ]);
            } else {
                $item->increment('stock_qty', $qty);
                if (isset($validated['unit_price'])) {
                    $item->update(['unit_price' => (float) $validated['unit_price']]);
                }
            }
        });

        return back()->with('success', "Stock movement ({$validated['type']} {$qty}) recorded for {$item->item_code}.");
    }

    public function destroyItem(int $id): RedirectResponse
    {
        $item = StoreItem::findOrFail($id);
        $code = $item->item_code;
        $item->delete();

        return back()->with('success', "Store item {$code} deleted.");
    }
}
