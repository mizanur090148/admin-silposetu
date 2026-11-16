import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { ClipboardList, Eye, Search } from 'lucide-react';
import { FactoryRef, PaginatedData, SubcontractOrder } from '@/types';
import { getOrderStatusMeta } from '@/utils/labels';

interface Props {
    orders: PaginatedData<SubcontractOrder>;
    summary: {
        total: number;
        running: number;
        waiting: number;
        completed: number;
        total_qty_kg: number;
        done_kg: number;
        delivered_kg: number;
    };
    factories: FactoryRef[];
    filters: {
        search: string;
        status: string;
        factory_id: string;
        per_page: number;
    };
}

export default function Index({ orders, summary, factories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.orders.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (orderId: number, status: string) => {
        router.post(route('admin.orders.status', orderId), { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Subcontract Orders & Floor ERP">
            <Head title="Subcontract Orders" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    {[
                        { label: 'Total Orders', val: summary.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Running', val: summary.running, cls: 'text-blue-600' },
                        { label: 'Waiting Yarn', val: summary.waiting, cls: 'text-amber-600' },
                        { label: 'Completed', val: summary.completed, cls: 'text-emerald-600' },
                        { label: 'Total Order Qty', val: `${Math.round(summary.total_qty_kg).toLocaleString()} kg`, cls: 'text-indigo-600' },
                        { label: 'Knitted / Deliv.', val: `${Math.round(summary.done_kg).toLocaleString()} / ${Math.round(summary.delivered_kg).toLocaleString()} kg`, cls: 'text-teal-600' },
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
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order no, buyer, fabric, party, factory..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => applyFilter({ status: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="run">Running</option>
                            <option value="wait">Waiting Yarn</option>
                            <option value="done">Completed</option>
                        </select>
                        <select
                            value={filters.factory_id}
                            onChange={(e) => applyFilter({ factory_id: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[220px]"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.code} — {f.name}
                                </option>
                            ))}
                        </select>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Order No & Buyer</th>
                                    <th className="py-3 px-4">Factory & Party</th>
                                    <th className="py-3 px-4">Fabrication & Rate</th>
                                    <th className="py-3 px-4">Knitting Progress</th>
                                    <th className="py-3 px-4">ERP Activity</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Inspect</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.data.map((order) => {
                                    const totalKg = Number(order.total_qty_kg || 0);
                                    const doneKg = Number(order.done_kg || 0);
                                    const pct = totalKg > 0 ? Math.min(100, Math.round((doneKg / totalKg) * 100)) : 0;
                                    const statusMeta = getOrderStatusMeta(order.status);

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
                                                    className="font-mono font-bold text-slate-900 dark:text-white hover:text-blue-600"
                                                >
                                                    {order.order_no}
                                                </Link>
                                                <p className="text-[11px] text-slate-500">{order.buyer || 'Direct Buyer'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.factory ? (
                                                    <Link
                                                        href={route('admin.factories.show', order.factory.id)}
                                                        className="font-semibold text-blue-600 hover:underline block"
                                                    >
                                                        {order.factory.code} — {order.factory.name}
                                                    </Link>
                                                ) : (
                                                    <span>Factory #{order.factory_id}</span>
                                                )}
                                                <p className="text-[11px] text-slate-500">
                                                    Party: {order.party?.name || order.party_code}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[230px]">
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{order.fabric_summary}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {[order.gsm, order.dia_gauge, `৳${order.rate_tk}/kg`].filter(Boolean).join(' · ')}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 min-w-[160px]">
                                                <div className="flex justify-between text-[11px] font-semibold mb-1">
                                                    <span>
                                                        {doneKg.toLocaleString()} / {totalKg.toLocaleString()} kg
                                                    </span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-[11px] text-slate-500">
                                                <p>{order.lines_count ?? 0} lines · {order.productions_count ?? 0} prod logs</p>
                                                <p>{order.qc_inspections_count ?? 0} QC · {order.delivery_challans_count ?? 0} challans</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={statusMeta.key}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border-0 cursor-pointer ${statusMeta.badgeClass}`}
                                                >
                                                    <option value="run">Running</option>
                                                    <option value="wait">Waiting Yarn</option>
                                                    <option value="done">Completed</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
                                                    className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Inspect Order Details"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No subcontract orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={orders.links}
                        from={orders.from ?? 0}
                        to={orders.to ?? 0}
                        total={orders.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
