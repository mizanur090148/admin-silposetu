import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Cpu, Inbox, Pencil, Plus, Radio, Search, Trash2, X } from 'lucide-react';
import { FactoryMachine, FactoryRef, FreeMachineRequest, PaginatedData } from '@/types';
import { formatDeadline } from '@/utils/date';

interface Props {
    requests: PaginatedData<FreeMachineRequest>;
    counts: {
        total: number;
        new: number;
        open: number;
        conf: number;
    };
    factories: FactoryRef[];
    matchingFreeMachines?: FactoryMachine[];
    filters: {
        search: string;
        status: string;
        factory_id: string;
        per_page: number;
    };
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
    new: { label: 'New', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    open: { label: 'Open', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    conf: { label: 'Confirmed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    done: { label: 'Completed', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
};

export default function Index({ requests, counts, factories, matchingFreeMachines = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<FreeMachineRequest | null>(null);

    const form = useForm({
        request_no: '',
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        party_code: '',
        contact_person: '',
        fabrication: '',
        qty_kg: '1000',
        status: 'new',
        machines_needed: 1,
        spec_label: '',
        start_date: '',
        message: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.free-machine-requests.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({
            request_no: '',
            factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
            party_code: '',
            contact_person: '',
            fabrication: '',
            qty_kg: '1000',
            status: 'new',
            machines_needed: 2,
            spec_label: '30" × 24G',
            start_date: '',
            message: '',
        });
        setShowModal(true);
    };

    const openEdit = (req: FreeMachineRequest) => {
        setEditing(req);
        form.clearErrors();
        form.setData({
            request_no: req.request_no,
            factory_id: String(req.factory_id),
            party_code: req.party_code,
            contact_person: req.contact_person,
            fabrication: req.fabrication,
            qty_kg: String(req.qty_kg),
            status: req.status,
            machines_needed: req.machines_needed,
            spec_label: req.spec_label || '',
            start_date: req.start_date ? req.start_date.slice(0, 10) : '',
            message: req.message || '',
        });
        setShowModal(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.free-machine-requests.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.free-machine-requests.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (req: FreeMachineRequest) => {
        if (!confirm(`Delete machine request ${req.request_no}?`)) {
            return;
        }
        router.delete(route('admin.free-machine-requests.destroy', req.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Free Machine Requests">
            <Head title="Free Machine Requests" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Total Requests', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'New', val: counts.new, cls: 'text-blue-600' },
                        { label: 'Open / Negotiating', val: counts.open, cls: 'text-amber-600' },
                        { label: 'Confirmed', val: counts.conf, cls: 'text-emerald-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filters & Add */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({ page: 1 });
                        }}
                        className="flex flex-wrap items-center gap-2 flex-1"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search request no, contact, fabrication, party code..."
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
                            <option value="open">Open</option>
                            <option value="conf">Confirmed</option>
                            <option value="done">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={filters.factory_id}
                            onChange={(e) => applyFilter({ factory_id: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[220px]"
                        >
                            <option value="all">All Target Factories</option>
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

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Request
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Request No &amp; Party</th>
                                    <th className="py-3 px-4">Target Factory</th>
                                    <th className="py-3 px-4">Fabrication &amp; Spec</th>
                                    <th className="py-3 px-4">Volume &amp; Machines</th>
                                    <th className="py-3 px-4">Start Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.data.map((req) => {
                                    const badge = STATUS_STYLE[req.status] || {
                                        label: req.status,
                                        cls: 'bg-slate-100 text-slate-700',
                                    };

                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{req.request_no}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {req.contact_person} ({req.party_code})
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {req.factory ? (
                                                    <Link
                                                        href={route('admin.factories.show', req.factory.id)}
                                                        className="font-semibold text-blue-600 hover:underline"
                                                    >
                                                        {req.factory.code} — {req.factory.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">Factory #{req.factory_id}</span>
                                                )}
                                                {req.factory?.area && <p className="text-[11px] text-slate-500">{req.factory.area}</p>}
                                            </td>
                                            <td className="py-3 px-4 max-w-[240px]">
                                                <p className="font-semibold text-slate-900 dark:text-white">{req.fabrication}</p>
                                                <p className="text-[11px] text-slate-500">{req.spec_label || 'Any spec'}</p>
                                                {req.message && <p className="text-[11px] text-slate-400 truncate mt-0.5">{req.message}</p>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold">{Number(req.qty_kg).toLocaleString()} kg</p>
                                                <p className="text-[11px] text-slate-500">{req.machines_needed} machines needed</p>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                {req.start_date ? formatDeadline(req.start_date) : 'Flexible'}
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
                                                        onClick={() => openEdit(req)}
                                                        title="Edit / Update Status"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(req)}
                                                        title="Delete Request"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {requests.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No free machine requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={requests.links}
                        from={requests.from ?? 0}
                        to={requests.to ?? 0}
                        total={requests.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>

                {/* Live Free / Idle Supply Across Network */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Radio className="w-4 h-4 text-emerald-500" />
                            Available Free &amp; Idle Machines Across Network ({matchingFreeMachines.length})
                        </h3>
                        <Link href={route('admin.factory-machines.index')} className="text-xs font-semibold text-blue-600 hover:underline">
                            Open Machine Manager
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {matchingFreeMachines.map((m) => (
                            <div
                                key={m.id}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-2"
                            >
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">{m.code}</span>
                                        <span className="text-[11px] text-slate-500">({m.spec_label || `${m.dia || '—'}" × ${m.gauge}G`})</span>
                                    </div>
                                    {m.factory && (
                                        <Link href={route('admin.factories.show', m.factory.id)} className="text-[11px] font-semibold text-blue-600 hover:underline block mt-1">
                                            {m.factory.code} — {m.factory.name}
                                        </Link>
                                    )}
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {m.daily_capacity_kg} kg/day {m.rate_label ? `· ${m.rate_label}` : ''}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                        m.broadcast_free
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {m.broadcast_free ? 'Broadcast Live' : 'Idle'}
                                </span>
                            </div>
                        ))}
                        {matchingFreeMachines.length === 0 && (
                            <p className="text-slate-400 col-span-full py-4 text-center">No idle or broadcast-free machines currently listed.</p>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editing ? `Update Request ${editing.request_no}` : 'Create Free Machine Request'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-5 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Target Factory *</label>
                                <select
                                    value={form.data.factory_id}
                                    onChange={(e) => form.setData('factory_id', e.target.value)}
                                    required
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
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="new">New</option>
                                    <option value="open">Open</option>
                                    <option value="conf">Confirmed</option>
                                    <option value="done">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Party / Buyer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.party_code}
                                    onChange={(e) => form.setData('party_code', e.target.value)}
                                    placeholder="abc"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Contact Person *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.contact_person}
                                    onChange={(e) => form.setData('contact_person', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Fabrication *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.fabrication}
                                    onChange={(e) => form.setData('fabrication', e.target.value)}
                                    placeholder="Single Jersey 160 GSM"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Volume (kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0.1}
                                    required
                                    value={form.data.qty_kg}
                                    onChange={(e) => form.setData('qty_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Machines Needed *</label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={form.data.machines_needed}
                                    onChange={(e) => form.setData('machines_needed', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Spec Label</label>
                                <input
                                    type="text"
                                    value={form.data.spec_label}
                                    onChange={(e) => form.setData('spec_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={form.data.start_date}
                                    onChange={(e) => form.setData('start_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Message / Admin Note</label>
                                <textarea
                                    rows={3}
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {editing ? 'Save Changes' : 'Create Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
