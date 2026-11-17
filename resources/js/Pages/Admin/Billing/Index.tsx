import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import {
    AlertTriangle,
    ArrowDownUp,
    CheckCircle2,
    Eye,
    PackageCheck,
    Pencil,
    Plus,
    Receipt,
    Search,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import {
    BillSummaryRow,
    FactoryExpenseRow,
    FactoryRef,
    PaginatedData,
    StoreIssueLogRow,
    StoreItemRow,
} from '@/types';

interface PartyOption {
    id: number;
    factory_id: number;
    code: string;
    name: string;
    type: string;
}

interface OrderOption {
    id: number;
    order_no: string;
    factory_id: number;
    party_code: string;
    fabric_summary: string;
    delivered_kg: string | number;
    done_kg: string | number;
    rate_tk: string | number;
}

interface Props {
    tab: 'bills' | 'expenses' | 'store';
    bills: PaginatedData<BillSummaryRow>;
    expenses: PaginatedData<FactoryExpenseRow>;
    lowStockItems: StoreItemRow[];
    storeItems: StoreItemRow[];
    storeIssueLogs: StoreIssueLogRow[];
    expenseCategories: string[];
    summary: {
        total_bills: number;
        billed_tk: number;
        collected_tk: number;
        due_tk: number;
        pending_tk: number;
        expenses_tk: number;
        low_stock_count: number;
        total_store_items: number;
        issue_logs_count: number;
    };
    factories: FactoryRef[];
    parties: PartyOption[];
    orders: OrderOption[];
    filters: {
        search: string;
        factory_code: string;
        expense_category: string;
        stock_filter: string;
        per_page: number;
    };
}

export default function Index({
    tab = 'bills',
    bills,
    expenses,
    lowStockItems,
    storeItems,
    storeIssueLogs = [],
    expenseCategories = [],
    summary,
    factories,
    parties = [],
    orders = [],
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBill, setSelectedBill] = useState<BillSummaryRow | null>(null);
    const [showNewBillModal, setShowNewBillModal] = useState(false);
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingExp, setEditingExp] = useState<FactoryExpenseRow | null>(null);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItemRow | null>(null);
    const [movingItem, setMovingItem] = useState<StoreItemRow | null>(null);

    const billForm = useForm({
        bill_no: '',
        factory_code: factories[0]?.code || 'f1',
        party_code: parties[0]?.code || 'abc',
        bill_date: new Date().toISOString().slice(0, 10),
        jv_no: '',
        order_no: orders[0]?.order_no || '',
        fabrication: orders[0]?.fabric_summary || 'Single Jersey',
        qty_kg: String(orders[0]?.delivered_kg || orders[0]?.done_kg || 100),
        rate_tk: String(orders[0]?.rate_tk || 14),
    });

    const paymentForm = useForm({
        amount: '',
        mode: 'ব্যাংক ট্রান্সফার',
        rv_no: '',
        payment_date: new Date().toISOString().slice(0, 10),
        pend: false,
    });

    const expForm = useForm({
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        category: 'electricity',
        title: '',
        amount_tk: '',
        payment_method: 'cash',
        reference_no: '',
        expense_date: new Date().toISOString().slice(0, 10),
        created_by: '',
        notes: '',
    });

    const itemForm = useForm({
        item_code: '',
        name: '',
        category: 'নিডল ও সিংকার',
        unit: 'পিস',
        stock_qty: 0,
        min_qty: 10,
        unit_price: '0',
        rfq_sent: false,
    });

    const movementForm = useForm({
        type: 'out' as 'in' | 'out',
        qty: 1,
        machine_code: '',
        issued_by: '',
        unit_price: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.bills.index'), { tab, ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const submitNewBill = (e: FormEvent) => {
        e.preventDefault();
        billForm.post(route('admin.bills.store'), {
            preserveScroll: true,
            onSuccess: () => setShowNewBillModal(false),
        });
    };

    const submitPayment = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedBill) {
            return;
        }
        paymentForm.post(route('admin.bills.payments.store', selectedBill.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedBill(null);
                paymentForm.reset('amount', 'rv_no');
            },
        });
    };

    const openCreateExp = () => {
        setEditingExp(null);
        expForm.clearErrors();
        expForm.setData({
            factory_id: factories[0]?.id ? String(factories[0].id) : '',
            category: 'electricity',
            title: '',
            amount_tk: '',
            payment_method: 'cash',
            reference_no: '',
            expense_date: new Date().toISOString().slice(0, 10),
            created_by: '',
            notes: '',
        });
        setShowExpModal(true);
    };

    const openEditExp = (exp: FactoryExpenseRow) => {
        setEditingExp(exp);
        expForm.clearErrors();
        expForm.setData({
            factory_id: String(exp.factory_id),
            category: exp.category,
            title: exp.title,
            amount_tk: String(exp.amount_tk),
            payment_method: exp.payment_method,
            reference_no: exp.reference_no || '',
            expense_date: exp.expense_date.slice(0, 10),
            created_by: exp.created_by || '',
            notes: exp.notes || '',
        });
        setShowExpModal(true);
    };

    const submitExp = (e: FormEvent) => {
        e.preventDefault();
        if (editingExp) {
            expForm.put(route('admin.expenses.update', editingExp.id), {
                preserveScroll: true,
                onSuccess: () => setShowExpModal(false),
            });
        } else {
            expForm.post(route('admin.expenses.store'), {
                preserveScroll: true,
                onSuccess: () => setShowExpModal(false),
            });
        }
    };

    const openCreateItem = () => {
        setEditingItem(null);
        itemForm.clearErrors();
        itemForm.setData({
            item_code: '',
            name: '',
            category: 'নিডল ও সিংকার',
            unit: 'পিস',
            stock_qty: 0,
            min_qty: 10,
            unit_price: '0',
            rfq_sent: false,
        });
        setShowStoreModal(true);
    };

    const openEditItem = (item: StoreItemRow) => {
        setEditingItem(item);
        itemForm.clearErrors();
        itemForm.setData({
            item_code: item.item_code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            stock_qty: item.stock_qty,
            min_qty: item.min_qty,
            unit_price: String(item.unit_price),
            rfq_sent: item.rfq_sent,
        });
        setShowStoreModal(true);
    };

    const submitItem = (e: FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            itemForm.put(route('admin.store.items.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => setShowStoreModal(false),
            });
        } else {
            itemForm.post(route('admin.store.items.store'), {
                preserveScroll: true,
                onSuccess: () => setShowStoreModal(false),
            });
        }
    };

    const openMovementModal = (item: StoreItemRow) => {
        setMovingItem(item);
        movementForm.clearErrors();
        movementForm.setData({
            type: 'out',
            qty: 1,
            machine_code: '',
            issued_by: '',
            unit_price: String(item.unit_price),
        });
    };

    const submitMovement = (e: FormEvent) => {
        e.preventDefault();
        if (!movingItem) {
            return;
        }
        movementForm.post(route('admin.store.items.movement', movingItem.id), {
            preserveScroll: true,
            onSuccess: () => setMovingItem(null),
        });
    };

    const tabs = [
        { id: 'bills', label: `Invoices & Receipts (${summary.total_bills})`, icon: Receipt },
        { id: 'expenses', label: `Operating Expenses (৳${Math.round(summary.expenses_tk).toLocaleString()})`, icon: Wallet },
        { id: 'store', label: `Store Inventory (${summary.total_store_items})`, icon: PackageCheck },
    ] as const;

    return (
        <AdminLayout title="Billing, Expenses & Store Alerts">
            <Head title="Billing & Expenses" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    {[
                        { label: 'Total Invoices', val: summary.total_bills, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Total Billed', val: `৳${Math.round(summary.billed_tk).toLocaleString()}`, cls: 'text-blue-600' },
                        { label: 'Collected', val: `৳${Math.round(summary.collected_tk).toLocaleString()}`, cls: 'text-emerald-600' },
                        { label: 'Outstanding Due', val: `৳${Math.round(summary.due_tk).toLocaleString()}`, cls: 'text-rose-600' },
                        { label: 'Factory Expenses', val: `৳${Math.round(summary.expenses_tk).toLocaleString()}`, cls: 'text-amber-600' },
                        { label: 'Low Stock Store', val: summary.low_stock_count, cls: 'text-indigo-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-base font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs & Quick Create */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {tabs.map((item) => {
                            const Icon = item.icon;
                            const active = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => applyFilter({ tab: item.id })}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {tab === 'bills' && (
                        <button
                            type="button"
                            onClick={() => setShowNewBillModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Invoice
                        </button>
                    )}
                    {tab === 'expenses' && (
                        <button
                            type="button"
                            onClick={openCreateExp}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Record Expense
                        </button>
                    )}
                    {tab === 'store' && (
                        <button
                            type="button"
                            onClick={openCreateItem}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Store Item
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({});
                        }}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search bill no, JV, expense title, item code..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        {tab !== 'store' && (
                            <select
                                value={filters.factory_code}
                                onChange={(e) => applyFilter({ factory_code: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[220px]"
                            >
                                <option value="all">All Factories</option>
                                {factories.map((f) => (
                                    <option key={f.id} value={f.code}>
                                        {f.code} — {f.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {tab === 'expenses' && (
                            <select
                                value={filters.expense_category}
                                onChange={(e) => applyFilter({ expense_category: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Categories</option>
                                {expenseCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        )}
                        {tab === 'store' && (
                            <select
                                value={filters.stock_filter}
                                onChange={(e) => applyFilter({ stock_filter: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Store Items</option>
                                <option value="low">Low Stock Alerts Only ({lowStockItems.length})</option>
                            </select>
                        )}
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>
                </div>

                {/* Tab 1: Bills */}
                {tab === 'bills' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-blue-600" />
                            Factory Invoices &amp; Voucher Ledger
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Bill / JV</th>
                                        <th className="py-3 px-4">Factory &amp; Party</th>
                                        <th className="py-3 px-4">Date &amp; Lines</th>
                                        <th className="py-3 px-4">Gross Amount</th>
                                        <th className="py-3 px-4">Collected</th>
                                        <th className="py-3 px-4">Due Balance</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {bills.data.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBill(b)}
                                                    className="font-mono font-bold text-slate-900 dark:text-white hover:text-blue-600"
                                                >
                                                    {b.bill_no}
                                                </button>
                                                <p className="text-[11px] text-slate-500">JV: {b.jv_no}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {b.factory ? (
                                                    <Link href={route('admin.factories.show', b.factory.id)} className="font-semibold text-blue-600 hover:underline">
                                                        {b.factory.code} — {b.factory.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-semibold">{b.factory_code}</span>
                                                )}
                                                <p className="text-[11px] text-slate-500">Party: {b.party_code}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p>{b.bill_date || '—'}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {b.lines_count ?? 0} lines · {b.payments_count ?? 0} receipts
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">৳{b.gross_tk.toLocaleString()}</td>
                                            <td className="py-3 px-4 font-semibold text-emerald-600">
                                                ৳{b.paid_tk.toLocaleString()}
                                                {b.pending_tk > 0 && (
                                                    <span className="block text-[10px] text-amber-600">+৳{b.pending_tk.toLocaleString()} pending</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        b.due_tk > 0
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    }`}
                                                >
                                                    {b.due_tk > 0 ? `৳${b.due_tk.toLocaleString()} Due` : 'Settled'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedBill(b)}
                                                        title="Inspect Lines & Record Payment"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500"
                                                    >
                                                        <Eye className="w-3 h-3" /> Ledger
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete invoice ${b.bill_no}?`)) {
                                                                router.delete(route('admin.bills.destroy', b.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {bills.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-slate-400">
                                                No invoices found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={bills.links}
                            from={bills.from ?? 0}
                            to={bills.to ?? 0}
                            total={bills.total}
                            perPage={filters.per_page}
                            onPerPageChange={(perPage) => applyFilter({ per_page: perPage })}
                        />
                    </div>
                )}

                {/* Tab 2: Expenses */}
                {tab === 'expenses' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Date &amp; Ref</th>
                                        <th className="py-3 px-4">Title &amp; Category</th>
                                        <th className="py-3 px-4">Factory &amp; By</th>
                                        <th className="py-3 px-4">Method</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {expenses.data.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-semibold">{exp.expense_date.slice(0, 10)}</p>
                                                <p className="text-[11px] font-mono text-slate-500">{exp.reference_no || '—'}</p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[280px]">
                                                <p className="font-bold text-slate-900 dark:text-white">{exp.title}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p>{exp.factory ? `${exp.factory.code} — ${exp.factory.name}` : `Factory #${exp.factory_id}`}</p>
                                                <p className="text-[11px] text-slate-500">{exp.created_by || '—'}</p>
                                            </td>
                                            <td className="py-3 px-4 uppercase font-semibold">{exp.payment_method}</td>
                                            <td className="py-3 px-4 font-bold text-rose-600">৳{Number(exp.amount_tk).toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditExp(exp)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete expense "${exp.title}"?`)) {
                                                                router.delete(route('admin.expenses.destroy', exp.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No factory expenses found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={expenses.links}
                            from={expenses.from}
                            to={expenses.to}
                            total={expenses.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}

                {/* Tab 3: Store Inventory & Issue Logs */}
                {tab === 'store' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center justify-between">
                                <span>Store Items ({storeItems.length})</span>
                                <span className="text-xs text-rose-600 font-semibold">{lowStockItems.length} low stock</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                            <th className="py-3 px-4">Code &amp; Item</th>
                                            <th className="py-3 px-4">Stock Level</th>
                                            <th className="py-3 px-4">Unit Price</th>
                                            <th className="py-3 px-4">RFQ</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {storeItems.map((item) => {
                                            const isLow = item.stock_qty <= item.min_qty;
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                                    <td className="py-3 px-4">
                                                        <span className="font-mono font-bold text-blue-600">{item.item_code}</span>
                                                        <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                                                        <p className="text-[11px] text-slate-500">{item.category}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                                isLow
                                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {item.stock_qty} / min {item.min_qty} {item.unit}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold">৳{Number(item.unit_price).toLocaleString()}</td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(route('admin.store.items.toggleRfq', item.id), {}, { preserveScroll: true })}
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                item.rfq_sent
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                            }`}
                                                        >
                                                            {item.rfq_sent ? 'RFQ Sent' : 'No RFQ'}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openMovementModal(item)}
                                                                title="Stock In / Issue Out"
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <ArrowDownUp className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditItem(item)}
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (confirm(`Delete store item ${item.item_code}?`)) {
                                                                        router.delete(route('admin.store.items.destroy', item.id), { preserveScroll: true });
                                                                    }
                                                                }}
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {storeItems.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400">
                                                    No store items match.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Store Issue Logs ({storeIssueLogs.length})
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-[520px] overflow-y-auto">
                                {storeIssueLogs.map((log) => (
                                    <div key={log.id} className="p-3.5 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                <span className="font-mono text-blue-600">{log.item_code}</span> · {log.item?.name || 'Item'}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                MC: {log.machine_code} · By {log.issued_by} · {log.date_label}
                                            </p>
                                        </div>
                                        <span className="font-bold text-rose-600 shrink-0">-{log.qty}</span>
                                    </div>
                                ))}
                                {storeIssueLogs.length === 0 && <p className="p-6 text-center text-slate-400">No store issue logs yet.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bill Detail & Payment Modal */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="font-bold text-sm">
                                    Invoice {selectedBill.bill_no} ({selectedBill.jv_no})
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Factory {selectedBill.factory_code} · Party {selectedBill.party_code} · {selectedBill.bill_date || '—'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setSelectedBill(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 text-xs">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <p className="text-[11px] text-slate-500">Gross</p>
                                    <p className="font-bold text-sm">৳{selectedBill.gross_tk.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                                    <p className="text-[11px] text-slate-500">Cleared Paid</p>
                                    <p className="font-bold text-sm text-emerald-600">৳{selectedBill.paid_tk.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                                    <p className="text-[11px] text-slate-500">Balance Due</p>
                                    <p className="font-bold text-sm text-rose-600">৳{selectedBill.due_tk.toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <p className="font-bold mb-2">Billed Order Lines</p>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                                    {(selectedBill.lines_json || []).map((line, i) => (
                                        <div key={i} className="px-3.5 py-2.5 flex justify-between">
                                            <span>
                                                <span className="font-mono font-bold">{line.o || 'Order'}</span> — {line.fab || 'Fabric'} ({line.kg ?? 0} kg × ৳{line.rate ?? 0})
                                            </span>
                                            <span className="font-bold">
                                                ৳{((line.amount ?? (line.kg ?? 0) * (line.rate ?? 0)) || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="font-bold mb-2">Payment Receipts ({(selectedBill.payments_json || []).length})</p>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                                    {(selectedBill.payments_json || []).map((pay, idx) => (
                                        <div key={idx} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold">
                                                    <span className="font-mono">{pay.rv || `RV-${idx + 1}`}</span> · {pay.mode || 'Cash'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">{pay.d || '—'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-emerald-600">৳{Number(pay.amt ?? pay.amount ?? 0).toLocaleString()}</span>
                                                {pay.pend ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.bills.payments.clear', [selectedBill.id, idx]), {}, {
                                                            preserveScroll: true,
                                                            onSuccess: () => setSelectedBill(null),
                                                        })}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px]"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Clear Pending
                                                    </button>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Cleared</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(selectedBill.payments_json || []).length === 0 && (
                                        <p className="p-4 text-center text-slate-400">No payments recorded yet.</p>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={submitPayment} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                                <p className="font-bold">Record New Payment Receipt</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={1}
                                        required
                                        value={paymentForm.data.amount}
                                        onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                        placeholder="Amount (৳)"
                                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={paymentForm.data.mode}
                                        onChange={(e) => paymentForm.setData('mode', e.target.value)}
                                        placeholder="Payment Mode"
                                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                    />
                                    <input
                                        type="date"
                                        value={paymentForm.data.payment_date}
                                        onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 font-medium">
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.data.pend}
                                            onChange={(e) => paymentForm.setData('pend', e.target.checked)}
                                        />
                                        Mark as Pending Verification (Cheque / Unreconciled)
                                    </label>
                                    <button type="submit" disabled={paymentForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                        Save Receipt
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Bill Modal */}
            {showNewBillModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Create Factory Invoice</h3>
                            <button type="button" onClick={() => setShowNewBillModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitNewBill} className="p-5 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={billForm.data.factory_code}
                                    onChange={(e) => billForm.setData('factory_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.code}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Party Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={billForm.data.party_code}
                                    onChange={(e) => billForm.setData('party_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Order No *</label>
                                <input
                                    type="text"
                                    required
                                    value={billForm.data.order_no}
                                    onChange={(e) => billForm.setData('order_no', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Bill Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={billForm.data.bill_date}
                                    onChange={(e) => billForm.setData('bill_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Fabrication Description *</label>
                                <input
                                    type="text"
                                    required
                                    value={billForm.data.fabrication}
                                    onChange={(e) => billForm.setData('fabrication', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Billed Qty (kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0.1}
                                    required
                                    value={billForm.data.qty_kg}
                                    onChange={(e) => billForm.setData('qty_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rate (৳/kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={billForm.data.rate_tk}
                                    onChange={(e) => billForm.setData('rate_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowNewBillModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={billForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Generate Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {showExpModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">{editingExp ? 'Edit Factory Expense' : 'Record Factory Expense'}</h3>
                            <button type="button" onClick={() => setShowExpModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitExp} className="p-5 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={expForm.data.factory_id}
                                    onChange={(e) => expForm.setData('factory_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Category *</label>
                                <input
                                    type="text"
                                    required
                                    list="exp-categories"
                                    value={expForm.data.category}
                                    onChange={(e) => expForm.setData('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="exp-categories">
                                    <option value="electricity" />
                                    <option value="needle_oil" />
                                    <option value="salary" />
                                    <option value="maintenance" />
                                    <option value="rent" />
                                    <option value="transport" />
                                </datalist>
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Expense Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={expForm.data.title}
                                    onChange={(e) => expForm.setData('title', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Amount (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={1}
                                    required
                                    value={expForm.data.amount_tk}
                                    onChange={(e) => expForm.setData('amount_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Payment Method *</label>
                                <select
                                    value={expForm.data.payment_method}
                                    onChange={(e) => expForm.setData('payment_method', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="bkash">bKash</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Expense Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={expForm.data.expense_date}
                                    onChange={(e) => expForm.setData('expense_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Reference No</label>
                                <input
                                    type="text"
                                    value={expForm.data.reference_no}
                                    onChange={(e) => expForm.setData('reference_no', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowExpModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={expForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    {editingExp ? 'Update Expense' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Store Item Modal */}
            {showStoreModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">{editingItem ? `Edit Item: ${editingItem.item_code}` : 'Add Store Item'}</h3>
                            <button type="button" onClick={() => setShowStoreModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitItem} className="p-5 grid grid-cols-2 gap-3 text-xs">
                            {!editingItem && (
                                <div>
                                    <label className="block font-semibold mb-1">Item Code</label>
                                    <input
                                        type="text"
                                        value={itemForm.data.item_code}
                                        onChange={(e) => itemForm.setData('item_code', e.target.value)}
                                        placeholder="Auto if blank"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                    />
                                </div>
                            )}
                            <div className={editingItem ? 'col-span-2' : ''}>
                                <label className="block font-semibold mb-1">Category *</label>
                                <input
                                    type="text"
                                    required
                                    value={itemForm.data.category}
                                    onChange={(e) => itemForm.setData('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={itemForm.data.name}
                                    onChange={(e) => itemForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Stock Qty *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={itemForm.data.stock_qty}
                                    onChange={(e) => itemForm.setData('stock_qty', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Min Alert Qty *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={itemForm.data.min_qty}
                                    onChange={(e) => itemForm.setData('min_qty', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Unit *</label>
                                <input
                                    type="text"
                                    required
                                    value={itemForm.data.unit}
                                    onChange={(e) => itemForm.setData('unit', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Unit Price (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={itemForm.data.unit_price}
                                    onChange={(e) => itemForm.setData('unit_price', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowStoreModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={itemForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    {editingItem ? 'Update Item' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Movement Modal */}
            {movingItem && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">
                                Stock Movement: {movingItem.item_code} ({movingItem.stock_qty} {movingItem.unit})
                            </h3>
                            <button type="button" onClick={() => setMovingItem(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitMovement} className="p-5 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Action *</label>
                                    <select
                                        value={movementForm.data.type}
                                        onChange={(e) => movementForm.setData('type', e.target.value as 'in' | 'out')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    >
                                        <option value="out">Issue Out (to Machine)</option>
                                        <option value="in">Stock In (Purchase)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={movementForm.data.qty}
                                        onChange={(e) => movementForm.setData('qty', Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            {movementForm.data.type === 'out' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1">Machine Code</label>
                                        <input
                                            type="text"
                                            value={movementForm.data.machine_code}
                                            onChange={(e) => movementForm.setData('machine_code', e.target.value)}
                                            placeholder="M-07"
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Issued By</label>
                                        <input
                                            type="text"
                                            value={movementForm.data.issued_by}
                                            onChange={(e) => movementForm.setData('issued_by', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-semibold mb-1">Updated Unit Price (৳)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={movementForm.data.unit_price}
                                        onChange={(e) => movementForm.setData('unit_price', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setMovingItem(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={movementForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Confirm Movement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
