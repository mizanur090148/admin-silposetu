import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { AlertTriangle, Receipt, Search, Wallet } from 'lucide-react';
import { BillSummaryRow, FactoryExpenseRow, FactoryRef, PaginatedData, StoreItemRow } from '@/types';

interface Props {
    bills: PaginatedData<BillSummaryRow>;
    expenses: FactoryExpenseRow[];
    lowStockItems: StoreItemRow[];
    summary: {
        total_bills: number;
        billed_tk: number;
        collected_tk: number;
        due_tk: number;
        pending_tk: number;
        expenses_tk: number;
        low_stock_count: number;
    };
    factories: FactoryRef[];
    filters: {
        search: string;
        factory_code: string;
        per_page: number;
    };
}

export default function Index({ bills, expenses, lowStockItems, summary, factories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.bills.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

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

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({ page: 1 });
                        }}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search bill no, JV no, party code, factory code..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.factory_code}
                            onChange={(e) => applyFilter({ factory_code: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[220px]"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.code}>
                                    {f.code} — {f.name}
                                </option>
                            ))}
                        </select>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>
                </div>

                {/* Bills Table */}
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {bills.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <p className="font-mono font-bold text-slate-900 dark:text-white">{b.bill_no}</p>
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
                                                {b.lines_count ?? 0} order lines · {b.payments_count ?? 0} receipts
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 font-semibold">৳{b.gross_tk.toLocaleString()}</td>
                                        <td className="py-3 px-4 font-semibold text-emerald-600">
                                            ৳{b.paid_tk.toLocaleString()}
                                            {b.pending_tk > 0 && (
                                                <span className="block text-[10px] text-amber-600">
                                                    +৳{b.pending_tk.toLocaleString()} pending
                                                </span>
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
                                    </tr>
                                ))}

                                {bills.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
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
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Expenses */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-amber-500" />
                            Recent Factory Operating Expenses
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {expenses.map((exp) => (
                                <div key={exp.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{exp.title}</p>
                                        <p className="text-[11px] text-slate-500">
                                            {exp.category} · {exp.factory?.name || `Factory #${exp.factory_id}`} · {exp.expense_date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-rose-600">৳{Number(exp.amount_tk).toLocaleString()}</p>
                                        <p className="text-[11px] uppercase text-slate-400">{exp.payment_method}</p>
                                    </div>
                                </div>
                            ))}
                            {expenses.length === 0 && <p className="p-6 text-center text-slate-400">No factory expenses recorded.</p>}
                        </div>
                    </div>

                    {/* Low Stock Store Items */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Low Stock Store Alerts ({lowStockItems.length})
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {item.item_code} · {item.name}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {item.category} · ৳{Number(item.unit_price).toLocaleString()} / {item.unit}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold text-[11px]">
                                            {item.stock_qty} / min {item.min_qty} {item.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {lowStockItems.length === 0 && (
                                <p className="p-6 text-center text-slate-400">All store inventory items are above minimum thresholds.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
