import React, { useState, FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import {
    Building2,
    Search,
    Plus,
    Upload,
    Eye,
    Pencil,
    Trash2,
    QrCode,
    Cpu,
    Users,
    ClipboardList,
} from 'lucide-react';
import { Factory, PaginatedData } from '@/types';
import { getPlanMeta, getTrialStatus } from '@/utils/labels';

interface Props {
    factories: PaginatedData<Factory>;
    summary: {
        total_factories: number;
        total_configured_machines: number;
        tracked_machines: number;
        qr_enabled: number;
    };
    plans: string[];
    filters: {
        search: string;
        plan_code: string;
        billing_cycle: string;
        qr_sticker: string;
        per_page: number;
    };
}

export default function Index({ factories, summary, plans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(
            route('admin.factories.index'),
            {
                ...filters,
                search,
                ...overrides,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        applyFilter({ page: 1 });
    };

    const handleDelete = (factory: Factory) => {
        if (confirm(`Delete factory "${factory.name}" (${factory.code})? All linked machines and factory-owned records will be deleted.`)) {
            router.delete(route('admin.factories.destroy', factory.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Factories">
            <Head title="Factories" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">Total Factories</p>
                        <p className="mt-1 text-2xl font-bold">{summary.total_factories}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">Declared Capacity (MCs)</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.total_configured_machines}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">Tracked Factory Machines</p>
                        <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.tracked_machines}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">QR Stickers Enabled</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.qr_enabled}</p>
                    </div>
                </div>

                {/* Filter & Actions Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search code, name, area, phone or owner..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={filters.plan_code}
                            onChange={(e) => applyFilter({ plan_code: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Plans</option>
                            {plans.map((p) => (
                                <option key={p} value={p}>
                                    Plan: {p.toUpperCase()}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.billing_cycle}
                            onChange={(e) => applyFilter({ billing_cycle: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Cycles</option>
                            <option value="m">Monthly (m)</option>
                            <option value="y">Yearly (y)</option>
                        </select>

                        <select
                            value={filters.qr_sticker}
                            onChange={(e) => applyFilter({ qr_sticker: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">QR: Any</option>
                            <option value="1">QR Enabled</option>
                            <option value="0">QR Disabled</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800"
                        >
                            Filter
                        </button>
                    </form>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={route('admin.factories.import')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <Upload className="w-3.5 h-3.5" /> Bulk CSV
                        </Link>
                        <Link
                            href={route('admin.factories.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Factory
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Code & Factory</th>
                                    <th className="py-3 px-4">Area & Phone</th>
                                    <th className="py-3 px-4">Plan & Cycle</th>
                                    <th className="py-3 px-4">Machines & ERP</th>
                                    <th className="py-3 px-4">Performance KPIs</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {factories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No factories match the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    factories.data.map((factory) => {
                                        const plan = getPlanMeta(factory.plan_code);
                                        const trial = getTrialStatus(factory.trial_ends_at);
                                        const usedMachines = Math.max(factory.factory_machines_count ?? 0, factory.total_machines);
                                        const overQuota = plan.maxMachines !== null && usedMachines > plan.maxMachines;

                                        return (
                                        <tr key={factory.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {factory.code}
                                                    </span>
                                                    <div>
                                                        <Link
                                                            href={route('admin.factories.show', factory.id)}
                                                            className="font-semibold text-sm text-slate-900 dark:text-white hover:text-blue-600"
                                                        >
                                                            {factory.name}
                                                        </Link>
                                                        <p className="text-[11px] text-slate-500">
                                                            Owner: {factory.owner ? factory.owner.name : 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{factory.area || '—'}</p>
                                                <p className="text-[11px] text-slate-500">{factory.phone || 'No phone'}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${plan.badgeClass}`}>
                                                        {plan.name} ({factory.plan_code})
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${trial.cls}`}>
                                                        {trial.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.factories.toggleQr', factory.id), {}, { preserveScroll: true })}
                                                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                            factory.qr_sticker_enabled
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <QrCode className="w-3 h-3" /> {factory.qr_sticker_enabled ? 'QR On' : 'QR Off'}
                                                    </button>
                                                    <span className="text-[10px] text-slate-400">
                                                        {factory.billing_cycle === 'y' ? 'Yearly' : 'Monthly'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-2 text-[11px]">
                                                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                                                        <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                                                        {factory.factory_machines_count ?? 0} / {factory.total_machines} MCs
                                                    </span>
                                                    {overQuota && (
                                                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[10px] font-bold">
                                                            Over Quota ({plan.maxMachines})
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 text-slate-500">
                                                        <Users className="w-3.5 h-3.5" /> {factory.users_count ?? 0}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-slate-500">
                                                        <ClipboardList className="w-3.5 h-3.5" /> {factory.subcontract_orders_count ?? 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-[11px]">
                                                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    On-time: {factory.ontime_delivery_pct}%
                                                </p>
                                                <p className="text-slate-500">
                                                    QC Reject: {factory.qc_reject_pct}% · {factory.yearly_orders_count} ord/yr
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <Link
                                                        href={route('admin.factories.show', factory.id)}
                                                        title="View"
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.factories.edit', factory.id)}
                                                        title="Edit"
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(factory)}
                                                        title="Delete"
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
                        links={factories.links}
                        from={factories.from}
                        to={factories.to}
                        total={factories.total}
                        perPage={filters.per_page}
                        onPerPageChange={(n) => applyFilter({ per_page: n, page: 1 })}
                        itemName="factories"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
