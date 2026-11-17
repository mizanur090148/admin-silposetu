import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import {
    CheckCircle2,
    ClipboardCheck,
    Layers,
    PackageCheck,
    Plus,
    Search,
    ShieldAlert,
    Trash2,
    Truck,
    X,
} from 'lucide-react';
import {
    DeliveryChallan,
    FabricRollRow,
    FactoryRef,
    PaginatedData,
    ProductionLog,
    QcInspection,
} from '@/types';

interface OrderOption {
    id: number;
    order_no: string;
    factory_id: number;
    party_code: string;
    buyer: string | null;
}

interface Props {
    tab: 'production' | 'rolls' | 'qc' | 'challans';
    productions: PaginatedData<ProductionLog>;
    rolls: PaginatedData<FabricRollRow>;
    qcInspections: QcInspection[];
    challans: PaginatedData<DeliveryChallan>;
    summary: {
        total_productions: number;
        total_knitted_kg: number;
        total_rolls: number;
        ready_rolls: number;
        total_qc: number;
        pending_qc_signs: number;
        total_challans: number;
        unsigned_challans: number;
    };
    factories: FactoryRef[];
    orders: OrderOption[];
    filters: {
        search: string;
        factory_id: string;
        shift: string;
        qc_status: string;
        roll_status: string;
        challan_status: string;
        per_page: number;
    };
}

function formatFaults(faults: Record<string, unknown> | unknown[] | null): string {
    if (!faults) {
        return '';
    }
    if (Array.isArray(faults)) {
        return faults.map(String).join(', ');
    }
    return Object.entries(faults)
        .map(([k, v]) => `${k} ×${v}`)
        .join(', ');
}

export default function Index({
    tab,
    productions,
    rolls,
    qcInspections,
    challans,
    summary,
    factories,
    orders,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [signingQc, setSigningQc] = useState<QcInspection | null>(null);
    const [signingChallan, setSigningChallan] = useState<DeliveryChallan | null>(null);
    const [showNewChallan, setShowNewChallan] = useState(false);

    const qcForm = useForm({
        side: 'fac' as 'fac' | 'ven',
        verdict: 'ok' as 'ok' | 'bad',
        signed_by: '',
        note: '',
        action_taken: '',
    });

    const challanSignForm = useForm({
        signed_by: '',
        received_rolls: 0,
    });

    const newChallanForm = useForm({
        order_no: orders[0]?.order_no || '',
        challan_no: '',
        date_label: '',
        rolls_text: '',
        vehicle_no: '',
        driver_name: '',
        driver_phone: '',
        signed_by: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(
            route('admin.floor-erp.index'),
            { tab, ...filters, search, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    const openQcModal = (qc: QcInspection) => {
        setSigningQc(qc);
        qcForm.clearErrors();
        const preferVendor = Boolean(qc.factory_sign_json?.v) && !qc.vendor_sign_json?.v;
        qcForm.setData({
            side: preferVendor ? 'ven' : 'fac',
            verdict: 'ok',
            signed_by: '',
            note: '',
            action_taken: qc.action_taken || '',
        });
    };

    const submitQcSign = (e: FormEvent) => {
        e.preventDefault();
        if (!signingQc) {
            return;
        }
        qcForm.post(route('admin.floor-erp.qc.sign', signingQc.id), {
            preserveScroll: true,
            onSuccess: () => setSigningQc(null),
        });
    };

    const openChallanSignModal = (ch: DeliveryChallan) => {
        setSigningChallan(ch);
        challanSignForm.clearErrors();
        challanSignForm.setData({
            signed_by: ch.vendor_sign_json?.by || '',
            received_rolls: ch.vendor_sign_json?.got ?? (ch.rolls_json?.length || 0),
        });
    };

    const submitChallanSign = (e: FormEvent) => {
        e.preventDefault();
        if (!signingChallan) {
            return;
        }
        challanSignForm.post(route('admin.floor-erp.challans.sign', signingChallan.id), {
            preserveScroll: true,
            onSuccess: () => setSigningChallan(null),
        });
    };

    const submitNewChallan = (e: FormEvent) => {
        e.preventDefault();
        newChallanForm.post(route('admin.floor-erp.challans.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewChallan(false);
                newChallanForm.reset('challan_no', 'rolls_text', 'vehicle_no', 'driver_name', 'driver_phone');
            },
        });
    };

    const tabs = [
        { id: 'production', label: `Production Logs (${summary.total_productions})`, icon: Layers },
        { id: 'rolls', label: `Fabric Rolls (${summary.total_rolls})`, icon: PackageCheck },
        { id: 'qc', label: `QC Inspections (${summary.total_qc})`, icon: ClipboardCheck },
        { id: 'challans', label: `Delivery Challans (${summary.total_challans})`, icon: Truck },
    ] as const;

    return (
        <AdminLayout title="Floor Production, Rolls, QC & Challans">
            <Head title="Floor Production & QC" />

            <div className="space-y-6">
                {/* Summary KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    {[
                        { label: 'Total Knitted', val: `${Math.round(summary.total_knitted_kg).toLocaleString()} kg`, cls: 'text-blue-600' },
                        { label: 'Shift Entries', val: summary.total_productions, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Fabric Rolls', val: summary.total_rolls, cls: 'text-indigo-600' },
                        { label: 'Ready Unchallaned', val: summary.ready_rolls, cls: 'text-emerald-600' },
                        { label: 'Pending QC Signs', val: summary.pending_qc_signs, cls: 'text-amber-600' },
                        { label: 'Unsigned Challans', val: summary.unsigned_challans, cls: 'text-rose-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-lg font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Bar */}
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

                    {tab === 'challans' && (
                        <button
                            type="button"
                            onClick={() => setShowNewChallan(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Issue Delivery Challan
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
                        <div className="relative flex-1 min-w-[210px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order no, roll no, machine, operator, vehicle..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <select
                            value={filters.factory_id}
                            onChange={(e) => applyFilter({ factory_id: e.target.value })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[210px]"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.code} — {f.name}
                                </option>
                            ))}
                        </select>

                        {(tab === 'production' || tab === 'rolls') && (
                            <select
                                value={filters.shift}
                                onChange={(e) => applyFilter({ shift: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Shifts</option>
                                <option value="A">Shift A</option>
                                <option value="B">Shift B</option>
                                <option value="C">Shift C</option>
                            </select>
                        )}

                        {tab === 'rolls' && (
                            <select
                                value={filters.roll_status}
                                onChange={(e) => applyFilter({ roll_status: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Rolls</option>
                                <option value="ready">Ready / Unchallaned</option>
                                <option value="dispatched">Dispatched on Challan</option>
                            </select>
                        )}

                        {tab === 'qc' && (
                            <select
                                value={filters.qc_status}
                                onChange={(e) => applyFilter({ qc_status: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All QC Logs</option>
                                <option value="pending">Pending Dual Sign</option>
                                <option value="signed">Dual Signed</option>
                            </select>
                        )}

                        {tab === 'challans' && (
                            <select
                                value={filters.challan_status}
                                onChange={(e) => applyFilter({ challan_status: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Challans</option>
                                <option value="unsigned">Awaiting Vendor Receipt</option>
                                <option value="signed">Vendor Signed</option>
                            </select>
                        )}

                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Filter
                        </button>
                    </form>
                </div>

                {/* Production Tab */}
                {tab === 'production' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Date &amp; Shift</th>
                                        <th className="py-3 px-4">Order &amp; Factory</th>
                                        <th className="py-3 px-4">Machine &amp; Operator</th>
                                        <th className="py-3 px-4">Output &amp; Rolls</th>
                                        <th className="py-3 px-4">Yarn Lot &amp; Fault</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {productions.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{p.date_label}</p>
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                                                    Shift {p.shift}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {p.order ? (
                                                    <Link href={route('admin.orders.show', p.order.id)} className="font-mono font-bold text-blue-600 hover:underline">
                                                        {p.order_no}
                                                    </Link>
                                                ) : (
                                                    <span className="font-mono font-bold">{p.order_no}</span>
                                                )}
                                                <p className="text-[11px] text-slate-500">
                                                    {p.order?.factory ? `${p.order.factory.code} — ${p.order.factory.name}` : p.order?.party_code || '—'}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                                    {p.machine_code}
                                                </span>
                                                <p className="text-[11px] text-slate-500 mt-1">{p.operator_name || '—'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-emerald-600">{Number(p.qty_kg).toLocaleString()} kg</p>
                                                <p className="text-[11px] text-slate-500">{p.rolls_count} rolls</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-mono text-[11px]">{p.yarn_lot || '—'}</p>
                                                {p.fault_code && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[10px] font-semibold">
                                                        {p.fault_code}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(`Delete production entry #${p.id} (${p.qty_kg} kg)?`)) {
                                                            router.delete(route('admin.floor-erp.productions.destroy', p.id), { preserveScroll: true });
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {productions.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No production logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={productions.links}
                            from={productions.from}
                            to={productions.to}
                            total={productions.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}

                {/* Fabric Rolls Tab */}
                {tab === 'rolls' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Roll No &amp; JC Seq</th>
                                        <th className="py-3 px-4">Order</th>
                                        <th className="py-3 px-4">Machine &amp; Operator</th>
                                        <th className="py-3 px-4">Weight &amp; Yarn Lot</th>
                                        <th className="py-3 px-4">Faults</th>
                                        <th className="py-3 px-4">Challan Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rolls.data.map((r) => {
                                        const faultsStr = formatFaults(r.faults_json);
                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                                <td className="py-3 px-4">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{r.roll_no}</span>
                                                    <p className="text-[11px] text-slate-500">JC #{r.jc_seq} · {r.date_label} ({r.shift})</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {r.order ? (
                                                        <Link href={route('admin.orders.show', r.order.id)} className="font-mono font-bold text-blue-600 hover:underline">
                                                            {r.order_no}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-mono font-bold">{r.order_no}</span>
                                                    )}
                                                    <p className="text-[11px] text-slate-500">{r.order?.buyer || r.order?.party_code || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-mono font-semibold">{r.machine_code}</span>
                                                    <p className="text-[11px] text-slate-500">{r.operator_name || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold">{r.weight_kg} kg</p>
                                                    <p className="text-[11px] text-slate-500 font-mono">{r.yarn_lot || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {faultsStr ? (
                                                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[10px] font-bold">
                                                            {faultsStr}
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-600 font-semibold text-[11px]">Clean</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {r.challan_no ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-mono font-bold text-[11px]">
                                                            Dispatched: {r.challan_no}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-[11px]">
                                                            Ready in Stock
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {rolls.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No fabric rolls found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={rolls.links}
                            from={rolls.from}
                            to={rolls.to}
                            total={rolls.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}

                {/* QC Inspections Tab */}
                {tab === 'qc' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">QC No &amp; Order</th>
                                        <th className="py-3 px-4">Roll &amp; Machine</th>
                                        <th className="py-3 px-4">Defect / Issue</th>
                                        <th className="py-3 px-4">Dual Signatures</th>
                                        <th className="py-3 px-4">Action Taken</th>
                                        <th className="py-3 px-4 text-right">Arbitrate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {qcInspections.map((qc) => (
                                        <tr key={qc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{qc.qc_no}</span>
                                                <p className="text-[11px] text-slate-500">{qc.date_label}</p>
                                                {qc.order ? (
                                                    <Link href={route('admin.orders.show', qc.order.id)} className="text-[11px] font-mono text-blue-600 hover:underline">
                                                        {qc.order_no}
                                                    </Link>
                                                ) : (
                                                    <p className="text-[11px] font-mono">{qc.order_no}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold">{qc.roll_no}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {qc.machine_code || '—'} · {qc.weight_kg} kg
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[240px]">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{qc.issue_description}</p>
                                                <p className="text-[11px] text-slate-500">Source: {qc.source}</p>
                                            </td>
                                            <td className="py-3 px-4 space-y-1">
                                                <div
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold mr-1 ${
                                                        qc.factory_sign_json?.v
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {qc.factory_sign_json?.v ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                                    Fac: {qc.factory_sign_json?.v || 'Pending'}
                                                </div>
                                                <div
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                        qc.vendor_sign_json?.v
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {qc.vendor_sign_json?.v ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                                    Ven: {qc.vendor_sign_json?.v || 'Pending'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 max-w-[180px] text-slate-600 dark:text-slate-300">
                                                {qc.action_taken || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openQcModal(qc)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500"
                                                >
                                                    Sign / Action
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {qcInspections.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No QC inspection records match filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Delivery Challans Tab */}
                {tab === 'challans' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Challan &amp; Date</th>
                                        <th className="py-3 px-4">Factory, Party &amp; Order</th>
                                        <th className="py-3 px-4">Rolls &amp; Transport</th>
                                        <th className="py-3 px-4">Dual Receipts</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {challans.data.map((ch) => (
                                        <tr key={ch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.challan_no}</span>
                                                <p className="text-[11px] text-slate-500">{ch.date_label}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {ch.order ? (
                                                    <Link href={route('admin.orders.show', ch.order.id)} className="font-mono font-bold text-blue-600 hover:underline">
                                                        {ch.order_no}
                                                    </Link>
                                                ) : (
                                                    <span className="font-mono font-bold">{ch.order_no}</span>
                                                )}
                                                <p className="text-[11px] text-slate-500">
                                                    {ch.factory ? `${ch.factory.code} — ${ch.factory.name}` : ch.factory_code} · Party: {ch.party_code}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[260px]">
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {(ch.rolls_json || []).map((r, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                                                            {String(r)}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    {ch.vehicle_no} {ch.driver_name ? `· ${ch.driver_name}` : ''} {ch.driver_phone ? `(${ch.driver_phone})` : ''}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 space-y-1">
                                                <p className="text-[11px]">
                                                    <span className="font-semibold">Factory:</span>{' '}
                                                    {ch.factory_sign_json?.by ? `${ch.factory_sign_json.by} (${ch.factory_sign_json.at || ''})` : 'Unsigned'}
                                                </p>
                                                <p className="text-[11px]">
                                                    <span className="font-semibold">Vendor:</span>{' '}
                                                    {ch.vendor_sign_json?.by
                                                        ? `${ch.vendor_sign_json.by} (${ch.vendor_sign_json.got ?? 0} rolls · ${ch.vendor_sign_json.at || ''})`
                                                        : 'Pending receipt'}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openChallanSignModal(ch)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500"
                                                    >
                                                        Sign Receipt
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete challan ${ch.challan_no}?`)) {
                                                                router.delete(route('admin.floor-erp.challans.destroy', ch.id), { preserveScroll: true });
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
                                    {challans.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-slate-400">
                                                No delivery challans found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={challans.links}
                            from={challans.from}
                            to={challans.to}
                            total={challans.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}
            </div>

            {/* QC Sign / Action Modal */}
            {signingQc && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Arbitrate QC: {signingQc.qc_no}</h3>
                            <button type="button" onClick={() => setSigningQc(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitQcSign} className="p-5 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Signing Side *</label>
                                    <select
                                        value={qcForm.data.side}
                                        onChange={(e) => qcForm.setData('side', e.target.value as 'fac' | 'ven')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    >
                                        <option value="fac">Factory Sign</option>
                                        <option value="ven">Vendor Sign</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Verdict *</label>
                                    <select
                                        value={qcForm.data.verdict}
                                        onChange={(e) => qcForm.setData('verdict', e.target.value as 'ok' | 'bad')}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    >
                                        <option value="ok">OK / Accepted</option>
                                        <option value="bad">Bad / Reject</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Signed By *</label>
                                <input
                                    type="text"
                                    required
                                    value={qcForm.data.signed_by}
                                    onChange={(e) => qcForm.setData('signed_by', e.target.value)}
                                    placeholder="e.g. QC Lead / Kamrul Hasan"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Signature Note</label>
                                <input
                                    type="text"
                                    value={qcForm.data.note}
                                    onChange={(e) => qcForm.setData('note', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Corrective Action Taken</label>
                                <input
                                    type="text"
                                    value={qcForm.data.action_taken}
                                    onChange={(e) => qcForm.setData('action_taken', e.target.value)}
                                    placeholder="e.g. Feeder needle replaced / roll deducted"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setSigningQc(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={qcForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Save Signature
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Challan Receipt Sign Modal */}
            {signingChallan && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Sign Vendor Receipt: {signingChallan.challan_no}</h3>
                            <button type="button" onClick={() => setSigningChallan(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitChallanSign} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Vendor Receiver Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={challanSignForm.data.signed_by}
                                    onChange={(e) => challanSignForm.setData('signed_by', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rolls Received Count *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={challanSignForm.data.received_rolls}
                                    onChange={(e) => challanSignForm.setData('received_rolls', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setSigningChallan(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={challanSignForm.processing} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
                                    Confirm Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Delivery Challan Modal */}
            {showNewChallan && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Issue Delivery Challan</h3>
                            <button type="button" onClick={() => setShowNewChallan(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitNewChallan} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Subcontract Order *</label>
                                <select
                                    value={newChallanForm.data.order_no}
                                    onChange={(e) => newChallanForm.setData('order_no', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {orders.map((o) => (
                                        <option key={o.id} value={o.order_no}>
                                            {o.order_no} ({o.buyer || o.party_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Vehicle No *</label>
                                <input
                                    type="text"
                                    required
                                    value={newChallanForm.data.vehicle_no}
                                    onChange={(e) => newChallanForm.setData('vehicle_no', e.target.value)}
                                    placeholder="Dhaka Metro-14-2256"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Date Label</label>
                                <input
                                    type="text"
                                    value={newChallanForm.data.date_label}
                                    onChange={(e) => newChallanForm.setData('date_label', e.target.value)}
                                    placeholder="e.g. 17 Nov"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Driver Name</label>
                                <input
                                    type="text"
                                    value={newChallanForm.data.driver_name}
                                    onChange={(e) => newChallanForm.setData('driver_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Driver Phone</label>
                                <input
                                    type="text"
                                    value={newChallanForm.data.driver_phone}
                                    onChange={(e) => newChallanForm.setData('driver_phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Rolls (comma or newline separated) *</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={newChallanForm.data.rolls_text}
                                    onChange={(e) => newChallanForm.setData('rolls_text', e.target.value)}
                                    placeholder="M-03/001, M-03/002"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowNewChallan(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={newChallanForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Create Challan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
