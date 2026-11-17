import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { CheckCheck, Eye, MessageSquareText, Plus, Search, Trash2, X } from 'lucide-react';
import { FactoryRef, MessageThreadRow, PaginatedData } from '@/types';

interface OrderRef {
    id: number;
    order_no: string;
    factory_id: number;
    party_code: string;
    buyer: string | null;
}

interface Props {
    threads: PaginatedData<MessageThreadRow>;
    summary: {
        total: number;
        unread_threads: number;
        total_unread_messages: number;
    };
    factories: FactoryRef[];
    orders: OrderRef[];
    filters: {
        search: string;
        factory_code: string;
        unread_only: string;
        per_page: number;
    };
}

export default function Index({ threads, summary, factories, orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createForm = useForm({
        thread_code: '',
        factory_code: factories[0]?.code || '',
        party_code: '',
        order_no: '',
        title: '',
        message: '',
    });

    const handleOrderPreset = (orderNo: string) => {
        const matchedOrder = orders.find((o) => o.order_no === orderNo);
        if (!matchedOrder) {
            createForm.setData('order_no', '');
            return;
        }
        const matchedFactory = factories.find((f) => f.id === matchedOrder.factory_id);
        createForm.setData((prev) => ({
            ...prev,
            order_no: matchedOrder.order_no,
            factory_code: matchedFactory?.code || prev.factory_code,
            party_code: matchedOrder.party_code || prev.party_code,
            title: prev.title || `Order ${matchedOrder.order_no}${matchedOrder.buyer ? ` (${matchedOrder.buyer})` : ''}`,
        }));
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.threads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.threads.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Order Chat & Support Threads">
            <Head title="Order Threads" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    {[
                        { label: 'Total Threads', val: summary.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Unread Threads', val: summary.unread_threads, cls: 'text-amber-600' },
                        { label: 'Unread Messages', val: summary.total_unread_messages, cls: 'text-blue-600' },
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
                                placeholder="Search thread code, title, order no, party..."
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
                        <select
                            value={filters.unread_only}
                            onChange={(e) => applyFilter({ unread_only: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Threads</option>
                            <option value="1">Unread Only</option>
                        </select>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white ml-auto"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Thread
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Thread &amp; Title</th>
                                    <th className="py-3 px-4">Factory &amp; Order</th>
                                    <th className="py-3 px-4">Last Message</th>
                                    <th className="py-3 px-4">Unread</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {threads.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-[11px] font-bold text-blue-600">{t.thread_code}</span>
                                            <Link
                                                href={route('admin.threads.show', t.id)}
                                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block"
                                            >
                                                {t.title}
                                            </Link>
                                            <p className="text-[11px] text-slate-500">{t.messages_count ?? 0} messages</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">
                                                {t.factory ? `${t.factory.code} — ${t.factory.name}` : t.factory_code}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Party: {t.party_code} {t.order_no ? `· Order: ${t.order_no}` : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[280px]">
                                            {t.last_message ? (
                                                <div>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                                                        {t.last_message.n || t.last_message.s} ({t.last_message.t || '—'})
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {t.last_message.txt || (t.last_message.voice ? '[Voice note]' : '[Attachment]')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Empty thread</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {t.unread_count > 0 ? (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold text-[11px]">
                                                    {t.unread_count} unread
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400">Read</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {t.unread_count > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.threads.read', t.id), {}, { preserveScroll: true })}
                                                        title="Mark as Read"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600"
                                                    >
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('admin.threads.show', t.id)}
                                                    title="Open Conversation"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(`Delete thread ${t.thread_code}?`)) {
                                                            router.delete(route('admin.threads.destroy', t.id), { preserveScroll: true });
                                                        }
                                                    }}
                                                    title="Delete Thread"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {threads.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <MessageSquareText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No order threads found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={threads.links}
                        from={threads.from ?? 0}
                        to={threads.to ?? 0}
                        total={threads.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form
                        onSubmit={submitCreate}
                        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-xs shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Start New Order / Support Thread</h3>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Link to Existing Order (Optional Preset)</label>
                                <select
                                    value={createForm.data.order_no}
                                    onChange={(e) => handleOrderPreset(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">General Thread (no linked order)</option>
                                    {orders.map((o) => (
                                        <option key={o.id} value={o.order_no}>
                                            {o.order_no} — {o.party_code}
                                            {o.buyer ? ` (${o.buyer})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={createForm.data.factory_code}
                                    onChange={(e) => createForm.setData('factory_code', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">Select Factory...</option>
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.code}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                                {createForm.errors.factory_code && <p className="text-rose-500 mt-1">{createForm.errors.factory_code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Party / Buyer Code *</label>
                                <input
                                    type="text"
                                    value={createForm.data.party_code}
                                    onChange={(e) => createForm.setData('party_code', e.target.value)}
                                    placeholder="e.g. PTY-01 or ADMIN"
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {createForm.errors.party_code && <p className="text-rose-500 mt-1">{createForm.errors.party_code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Thread Code (Optional)</label>
                                <input
                                    type="text"
                                    value={createForm.data.thread_code}
                                    onChange={(e) => createForm.setData('thread_code', e.target.value)}
                                    placeholder="Auto-generated (TH-...)"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {createForm.errors.thread_code && <p className="text-rose-500 mt-1">{createForm.errors.thread_code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Thread Title *</label>
                                <input
                                    type="text"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. GSM & Roll Check Follow-up"
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {createForm.errors.title && <p className="text-rose-500 mt-1">{createForm.errors.title}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Initial Message *</label>
                                <textarea
                                    rows={3}
                                    value={createForm.data.message}
                                    onChange={(e) => createForm.setData('message', e.target.value)}
                                    placeholder="Write the opening message..."
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {createForm.errors.message && <p className="text-rose-500 mt-1">{createForm.errors.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                            >
                                Create Thread
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
