import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { FileQuestion, Pencil, Search, Trash2, X } from 'lucide-react';
import { PaginatedData, SupplierRfq } from '@/types';
import { SUPPLIER_CATEGORY_LABELS } from '@/utils/labels';

interface Props {
    rfqs: PaginatedData<SupplierRfq>;
    counts: {
        total: number;
        new: number;
        quoted: number;
        won: number;
        lost: number;
    };
    factoryCodes: string[];
    filters: {
        search: string;
        status: string;
        factory_code: string;
        per_page: number;
    };
}

const RFQ_STATUS: Record<string, { label: string; cls: string }> = {
    new: { label: 'New', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    quoted: { label: 'Quoted', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    won: { label: 'Won', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    lost: { label: 'Lost', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
};

export default function Index({ rfqs, counts, factoryCodes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [editing, setEditing] = useState<SupplierRfq | null>(null);

    const form = useForm({
        status: 'new',
        quoted_price: '',
        delivery_days: '',
        note: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.supplier-rfqs.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openEdit = (rfq: SupplierRfq) => {
        setEditing(rfq);
        form.clearErrors();
        form.setData({
            status: rfq.status,
            quoted_price: rfq.quoted_price || '',
            delivery_days: rfq.delivery_days || '',
            note: rfq.note || '',
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editing) {
            return;
        }
        form.put(route('admin.supplier-rfqs.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (rfq: SupplierRfq) => {
        if (!confirm(`Delete RFQ ${rfq.rfq_no}?`)) {
            return;
        }
        router.delete(route('admin.supplier-rfqs.destroy', rfq.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Supplier RFQs">
            <Head title="Supplier RFQs" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {[
                        { label: 'Total RFQs', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'New', val: counts.new, cls: 'text-blue-600' },
                        { label: 'Quoted', val: counts.quoted, cls: 'text-amber-600' },
                        { label: 'Won', val: counts.won, cls: 'text-emerald-600' },
                        { label: 'Lost', val: counts.lost, cls: 'text-rose-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.cls}`}>{c.val}</p>
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
                                placeholder="Search RFQ no, item name, factory code, area..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => applyFilter({ status: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="quoted">Quoted</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>
                        <select
                            value={filters.factory_code}
                            onChange={(e) => applyFilter({ factory_code: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Factories</option>
                            {factoryCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
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
                                    <th className="py-3 px-4">RFQ & Factory</th>
                                    <th className="py-3 px-4">Item & Qty</th>
                                    <th className="py-3 px-4">Location & Contact</th>
                                    <th className="py-3 px-4">Quote Response</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rfqs.data.map((rfq) => {
                                    const badge = RFQ_STATUS[rfq.status] || {
                                        label: rfq.status,
                                        cls: 'bg-slate-100 text-slate-700',
                                    };

                                    return (
                                        <tr key={rfq.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{rfq.rfq_no}</p>
                                                {rfq.factory ? (
                                                    <Link
                                                        href={route('admin.factories.show', rfq.factory.id)}
                                                        className="text-[11px] text-blue-600 hover:underline"
                                                    >
                                                        {rfq.factory.code} — {rfq.factory.name}
                                                    </Link>
                                                ) : (
                                                    <p className="text-[11px] text-slate-500">Factory: {rfq.factory_code}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 max-w-[260px]">
                                                <p className="font-semibold text-slate-900 dark:text-white">{rfq.item_name}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    Qty: {rfq.qty_label} • Need by: {rfq.need_by_label}
                                                </p>
                                                {rfq.category && (
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                                        {SUPPLIER_CATEGORY_LABELS[rfq.category] || rfq.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p>{rfq.area || '—'}</p>
                                                <p className="text-[11px] text-slate-500">{rfq.phone || '—'}</p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[220px]">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {rfq.quoted_price || 'No quote yet'}
                                                </p>
                                                {rfq.delivery_days && <p className="text-[11px] text-slate-500">ETA: {rfq.delivery_days}</p>}
                                                {rfq.note && <p className="text-[11px] text-slate-400 truncate">{rfq.note}</p>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(rfq)}
                                                        title="Update RFQ Quote & Status"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(rfq)}
                                                        title="Delete RFQ"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {rfqs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No supplier RFQs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={rfqs.links}
                        from={rfqs.from ?? 0}
                        to={rfqs.to ?? 0}
                        total={rfqs.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                Update RFQ {editing.rfq_no}
                            </h3>
                            <button type="button" onClick={() => setEditing(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="p-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="new">New</option>
                                    <option value="quoted">Quoted</option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Quoted Price</label>
                                    <input
                                        type="text"
                                        value={form.data.quoted_price}
                                        onChange={(e) => form.setData('quoted_price', e.target.value)}
                                        placeholder="e.g. ৳42,500"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Delivery Days</label>
                                    <input
                                        type="text"
                                        value={form.data.delivery_days}
                                        onChange={(e) => form.setData('delivery_days', e.target.value)}
                                        placeholder="e.g. 3-5 days"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Admin / Quote Note</label>
                                <textarea
                                    rows={3}
                                    value={form.data.note}
                                    onChange={(e) => form.setData('note', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    Save RFQ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
