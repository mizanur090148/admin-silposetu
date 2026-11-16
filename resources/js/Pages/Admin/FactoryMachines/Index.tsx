import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Cpu, Search, Plus, Pencil, Trash2, Radio, Upload, Download, X } from 'lucide-react';
import { FactoryMachine, FactoryRef, PaginatedData } from '@/types';
import { parseMachineStatus } from '@/utils/labels';

interface Props {
    machines: PaginatedData<FactoryMachine>;
    stats: {
        total: number;
        idle: number;
        running: number;
        down: number;
        broadcast_free: number;
        total_capacity_kg: number;
    };
    factories: FactoryRef[];
    filters: {
        search: string;
        factory_id: string;
        knit_type: string;
        status_type: string;
        broadcast_free: string;
        per_page: number;
    };
}

export default function Index({ machines, stats, factories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [editing, setEditing] = useState<FactoryMachine | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const form = useForm({
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        code: '',
        knit_type: 'c' as 'c' | 'f',
        dia: '30',
        gauge: '24',
        spec_label: '',
        brand: 'Pailung',
        status: 'idle',
        current_order_no: '',
        broadcast_free: false,
        free_from: '',
        daily_capacity_kg: '190',
        rate_label: '৳১৩–১৫ / kg',
        supported_fabrics: 'Single Jersey, 1×1 Rib',
        note: '',
    });

    const importForm = useForm<{ file: File | null }>({ file: null });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(
            route('admin.factory-machines.index'),
            { ...filters, search, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    const openCreate = () => {
        setEditing(null);
        form.setData({
            factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
            code: '',
            knit_type: 'c',
            dia: '30',
            gauge: '24',
            spec_label: '',
            brand: 'Pailung',
            status: 'idle',
            current_order_no: '',
            broadcast_free: false,
            free_from: '',
            daily_capacity_kg: '190',
            rate_label: '৳১৩–১৫ / kg',
            supported_fabrics: 'Single Jersey, 1×1 Rib',
            note: '',
        });
        setShowModal(true);
    };

    const openEdit = (m: FactoryMachine) => {
        setEditing(m);
        form.setData({
            factory_id: String(m.factory_id),
            code: m.code,
            knit_type: m.knit_type,
            dia: m.dia ? String(m.dia) : '',
            gauge: String(m.gauge),
            spec_label: m.spec_label || '',
            brand: m.brand || '',
            status: m.status,
            current_order_no: m.current_order_no || '',
            broadcast_free: m.broadcast_free,
            free_from: m.free_from || '',
            daily_capacity_kg: String(m.daily_capacity_kg),
            rate_label: m.rate_label || '',
            supported_fabrics: (m.supported_fabrics_json || []).join(', '),
            note: m.note || '',
        });
        setShowModal(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.factory-machines.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.factory-machines.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const submitImport = (e: FormEvent) => {
        e.preventDefault();
        importForm.post(route('admin.factory-machines.import'), {
            forceFormData: true,
            onSuccess: () => {
                setShowImport(false);
                importForm.reset();
            },
        });
    };

    return (
        <AdminLayout title="Factory Machines">
            <Head title="Factory Machines" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Total Machines</p>
                        <p className="text-xl font-bold mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Running</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">{stats.running}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Idle Free</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">{stats.idle}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Down / Maint.</p>
                        <p className="text-xl font-bold text-rose-600 mt-1">{stats.down}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Broadcast Free</p>
                        <p className="text-xl font-bold text-amber-600 mt-1">{stats.broadcast_free}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[11px] text-slate-500">Daily Capacity</p>
                        <p className="text-xl font-bold mt-1">{stats.total_capacity_kg.toLocaleString()} kg</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
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
                                placeholder="Search code, brand, spec, order or factory..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <select
                            value={filters.factory_id}
                            onChange={(e) => applyFilter({ factory_id: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.code} · {f.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.knit_type}
                            onChange={(e) => applyFilter({ knit_type: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Knit Types</option>
                            <option value="c">Circular (c)</option>
                            <option value="f">Flat (f)</option>
                        </select>

                        <select
                            value={filters.status_type}
                            onChange={(e) => applyFilter({ status_type: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="idle">Idle</option>
                            <option value="run">Running</option>
                            <option value="down">Down</option>
                        </select>

                        <select
                            value={filters.broadcast_free}
                            onChange={(e) => applyFilter({ broadcast_free: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">Broadcast: Any</option>
                            <option value="1">Free Broadcast On</option>
                            <option value="0">Broadcast Off</option>
                        </select>

                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Apply
                        </button>
                    </form>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={route('admin.factory-machines.template')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                            <Download className="w-3.5 h-3.5" /> CSV
                        </a>
                        <button
                            type="button"
                            onClick={() => setShowImport(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                            <Upload className="w-3.5 h-3.5" /> Import
                        </button>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Machine
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Factory & Code</th>
                                    <th className="py-3 px-4">Type & Spec</th>
                                    <th className="py-3 px-4">Status / Order</th>
                                    <th className="py-3 px-4">Capacity & Rate</th>
                                    <th className="py-3 px-4">Supported Fabrics</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {machines.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No factory machines found.
                                        </td>
                                    </tr>
                                ) : (
                                    machines.data.map((m) => {
                                        const st = parseMachineStatus(m.status);
                                        return (
                                            <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold">
                                                            {m.code}
                                                        </span>
                                                        {m.factory && (
                                                            <Link
                                                                href={route('admin.factories.show', m.factory.id)}
                                                                className="font-semibold hover:text-blue-600"
                                                            >
                                                                {m.factory.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                    {m.brand && <p className="text-[11px] text-slate-500 mt-0.5">Brand: {m.brand}</p>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium">{m.spec_label || `${m.dia || '—'}" × ${m.gauge}G`}</p>
                                                    <p className="text-[11px] text-slate-500">{m.knit_type === 'f' ? 'Flat (f)' : 'Circular (c)'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badgeClass}`}>
                                                        {st.label}
                                                    </span>
                                                    {m.current_order_no && <p className="text-[11px] text-slate-500 mt-0.5">{m.current_order_no}</p>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold">{m.daily_capacity_kg} kg/day</p>
                                                    <p className="text-[11px] text-slate-500">{m.rate_label || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {(m.supported_fabrics_json || []).map((fab, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                                                {fab}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.factory-machines.toggleBroadcast', m.id), {}, { preserveScroll: true })}
                                                        className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                            m.broadcast_free
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <Radio className="w-3 h-3" /> {m.broadcast_free ? 'Broadcast Free' : 'Broadcast Off'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(m)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm(`Delete machine ${m.code}?`)) {
                                                                    router.delete(route('admin.factory-machines.destroy', m.id), { preserveScroll: true });
                                                                }
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={machines.links}
                        from={machines.from}
                        to={machines.to}
                        total={machines.total}
                        perPage={filters.per_page}
                        onPerPageChange={(n) => applyFilter({ per_page: n, page: 1 })}
                        itemName="machines"
                    />
                </div>
            </div>

            {/* Create/Edit Machine Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold">{editing ? `Edit Machine ${editing.code}` : 'Add Factory Machine'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={form.data.factory_id}
                                    onChange={(e) => form.setData('factory_id', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} · {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Machine Code *</label>
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.code && <p className="text-rose-500 mt-1">{form.errors.code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Knit Type *</label>
                                <select
                                    value={form.data.knit_type}
                                    onChange={(e) => form.setData('knit_type', e.target.value as 'c' | 'f')}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="c">Circular (c)</option>
                                    <option value="f">Flat (f)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Dia</label>
                                <input
                                    type="number"
                                    value={form.data.dia}
                                    onChange={(e) => form.setData('dia', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Gauge *</label>
                                <input
                                    type="number"
                                    value={form.data.gauge}
                                    onChange={(e) => form.setData('gauge', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Spec Label</label>
                                <input
                                    type="text"
                                    value={form.data.spec_label}
                                    onChange={(e) => form.setData('spec_label', e.target.value)}
                                    placeholder='Auto e.g. 30" × 24G'
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Brand</label>
                                <input
                                    type="text"
                                    value={form.data.brand}
                                    onChange={(e) => form.setData('brand', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <input
                                    type="text"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    required
                                    placeholder="idle / down / run:SC-..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Current Order No</label>
                                <input
                                    type="text"
                                    value={form.data.current_order_no}
                                    onChange={(e) => form.setData('current_order_no', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Daily Capacity (kg) *</label>
                                <input
                                    type="number"
                                    value={form.data.daily_capacity_kg}
                                    onChange={(e) => form.setData('daily_capacity_kg', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rate Label</label>
                                <input
                                    type="text"
                                    value={form.data.rate_label}
                                    onChange={(e) => form.setData('rate_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Free From Date</label>
                                <input
                                    type="date"
                                    value={form.data.free_from}
                                    onChange={(e) => form.setData('free_from', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex items-center pt-5">
                                <label className="flex items-center gap-2 font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={form.data.broadcast_free}
                                        onChange={(e) => form.setData('broadcast_free', e.target.checked)}
                                    />
                                    Broadcast Free
                                </label>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Supported Fabrics (comma separated)</label>
                                <input
                                    type="text"
                                    value={form.data.supported_fabrics}
                                    onChange={(e) => form.setData('supported_fabrics', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Note</label>
                                <input
                                    type="text"
                                    value={form.data.note}
                                    onChange={(e) => form.setData('note', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {editing ? 'Update Machine' : 'Create Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold">Import Factory Machines CSV</h3>
                            <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-500">
                            Headers: <code className="font-mono">factory_code,code,knit_type,dia,gauge,spec_label,brand,status,daily_capacity_kg,rate_label,supported_fabrics,broadcast_free</code>
                        </p>
                        <form onSubmit={submitImport} className="space-y-4">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) => importForm.setData('file', e.target.files?.[0] ?? null)}
                                required
                                className="block w-full"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowImport(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={importForm.processing || !importForm.data.file}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                                >
                                    Upload & Import
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
