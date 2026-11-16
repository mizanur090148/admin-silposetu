import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Pencil,
    QrCode,
    Trash2,
    Plus,
    Cpu,
    Radio,
    Users,
    ClipboardList,
    X,
} from 'lucide-react';
import {
    BillSummaryRow,
    Factory,
    FactoryExpenseRow,
    FactoryHealth,
    FactoryMachine,
    PlanMeta,
    SubcontractOrderSummary,
} from '@/types';
import { ROLE_META, getOrderStatusMeta, getTrialStatus, parseMachineStatus } from '@/utils/labels';

interface PartySummaryRow {
    id: number;
    code: string;
    name: string;
    type: string;
    phone: string | null;
    default_rate_tk: string | number;
    is_active: boolean;
}

interface EmployeeSummaryRow {
    id: number;
    employee_type: string;
    name: string;
    designation: string | null;
    shift: string;
    machine_assigned: string | null;
    daily_wage: string | number;
    status: string;
}

interface Props {
    factory: Factory;
    erpOverview: {
        active_orders: number;
        total_orders: number;
        parties_count: number;
        employees_count: number;
        qc_count: number;
        challans_count: number;
        billed_tk: number;
        paid_tk: number;
        expenses_tk: number;
        plan_meta: PlanMeta;
        health: FactoryHealth;
        recent_orders: SubcontractOrderSummary[];
        recent_bills: BillSummaryRow[];
        recent_expenses: FactoryExpenseRow[];
        parties: PartySummaryRow[];
        employees: EmployeeSummaryRow[];
    };
}

export default function Show({ factory, erpOverview }: Props) {
    const [showAddMachine, setShowAddMachine] = useState(false);

    const machineForm = useForm({
        factory_id: String(factory.id),
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

    const handleAddMachine = (e: FormEvent) => {
        e.preventDefault();
        machineForm.post(route('admin.factory-machines.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddMachine(false);
                machineForm.reset('code', 'spec_label', 'current_order_no', 'note');
            },
        });
    };

    const handleDeleteFactory = () => {
        if (confirm(`Delete factory "${factory.name}" (${factory.code})?`)) {
            router.delete(route('admin.factories.destroy', factory.id));
        }
    };

    const machines = factory.factory_machines || [];

    return (
        <AdminLayout title={`Factory: ${factory.name}`}>
            <Head title={factory.name} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.factories.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Factories
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.post(route('admin.factories.toggleQr', factory.id), {}, { preserveScroll: true })}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                                factory.qr_sticker_enabled
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <QrCode className="w-3.5 h-3.5" /> {factory.qr_sticker_enabled ? 'QR Enabled' : 'QR Disabled'}
                        </button>
                        <Link
                            href={route('admin.factories.edit', factory.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Edit Factory
                        </Link>
                        <button
                            type="button"
                            onClick={handleDeleteFactory}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>

                {/* Top Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold">
                                    {factory.code}
                                </span>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{factory.name}</h2>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {factory.area || 'No area'} · {factory.address || 'No street address'} · Phone: {factory.phone || 'N/A'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Owner: <span className="font-semibold text-slate-800 dark:text-slate-200">{factory.owner?.name || 'Unassigned'}</span>
                                {factory.owner?.phone && ` (${factory.owner.phone})`} · Last update label: {factory.last_update_label}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <p className="text-slate-500">Plan & Trial</p>
                                <p className="text-sm font-bold mt-0.5">
                                    {erpOverview.plan_meta.name} ({factory.billing_cycle})
                                </p>
                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${getTrialStatus(factory.trial_ends_at).cls}`}>
                                    {getTrialStatus(factory.trial_ends_at).label}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <p className="text-slate-500">On-Time</p>
                                <p className="text-sm font-bold text-emerald-600 mt-0.5">{factory.ontime_delivery_pct}%</p>
                                <button
                                    type="button"
                                    onClick={() => router.post(route('admin.factories.extendTrial', factory.id), { days: 30 }, { preserveScroll: true })}
                                    className="mt-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold hover:bg-blue-200"
                                >
                                    +30d Trial
                                </button>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <p className="text-slate-500">QC Reject</p>
                                <p className="text-sm font-bold text-amber-600 mt-0.5">{factory.qc_reject_pct}%</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{erpOverview.qc_count} inspections</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <p className="text-slate-500">Billing / Exp.</p>
                                <p className="text-sm font-bold mt-0.5">৳{Math.round(erpOverview.billed_tk).toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Paid ৳{Math.round(erpOverview.paid_tk).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ERP Overview Strip */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30">
                            <Cpu className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-slate-500">Machines Tracked</p>
                                <p className="font-bold">{machines.length} / {factory.total_machines}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30">
                            <ClipboardList className="w-4 h-4 text-indigo-600" />
                            <div>
                                <p className="text-slate-500">Subcontract Orders</p>
                                <p className="font-bold">{erpOverview.active_orders} running / {erpOverview.total_orders} total</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <div>
                                <p className="text-slate-500">Employees / Parties</p>
                                <p className="font-bold">{erpOverview.employees_count} staff · {erpOverview.parties_count} parties</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30">
                            <Users className="w-4 h-4 text-amber-600" />
                            <div>
                                <p className="text-slate-500">Portal Users</p>
                                <p className="font-bold">{factory.users?.length ?? 0} linked accounts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Factory Machines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold">Factory Machines ({machines.length})</h3>
                            <p className="text-[11px] text-slate-500">Individual machine specs, current orders, and free capacity broadcasts.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddMachine(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Machine
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-2.5 px-4">Code & Type</th>
                                    <th className="py-2.5 px-4">Spec / Brand</th>
                                    <th className="py-2.5 px-4">Status / Order</th>
                                    <th className="py-2.5 px-4">Capacity & Rate</th>
                                    <th className="py-2.5 px-4">Broadcast</th>
                                    <th className="py-2.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {machines.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No machines added for this factory yet.
                                        </td>
                                    </tr>
                                ) : (
                                    machines.map((m: FactoryMachine) => {
                                        const st = parseMachineStatus(m.status);
                                        return (
                                            <tr key={m.id}>
                                                <td className="py-3 px-4 font-semibold">
                                                    <span className="font-mono">{m.code}</span>
                                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                                        {m.knit_type === 'f' ? 'Flat' : 'Circular'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium">{m.spec_label || `${m.dia || '—'}" × ${m.gauge}G`}</p>
                                                    <p className="text-[11px] text-slate-500">{m.brand || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badgeClass}`}>
                                                        {st.label}
                                                    </span>
                                                    {m.current_order_no && <p className="text-[10px] text-slate-500 mt-0.5">Order: {m.current_order_no}</p>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p>{m.daily_capacity_kg} kg/day</p>
                                                    <p className="text-[11px] text-slate-500">{m.rate_label || '—'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('admin.factory-machines.toggleBroadcast', m.id), {}, { preserveScroll: true })}
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                            m.broadcast_free
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <Radio className="w-3 h-3" /> {m.broadcast_free ? 'Live' : 'Off'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete machine ${m.code}?`)) {
                                                                router.delete(route('admin.factory-machines.destroy', m.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Linked Users & Recent ERP Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
                            Linked Users ({factory.users?.length ?? 0})
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(factory.users || []).length === 0 ? (
                                <p className="p-5 text-slate-500 text-center">No users linked via `factory_id`.</p>
                            ) : (
                                factory.users?.map((u) => {
                                    const meta = ROLE_META[u.role] || { label: u.role, badgeClass: 'bg-slate-100 text-slate-700' };
                                    return (
                                        <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {u.name} {u.is_owner && <span className="text-[10px] text-amber-600 font-bold ml-1">(Owner)</span>}
                                                </p>
                                                <p className="text-slate-500">{u.phone} {u.designation ? `· ${u.designation}` : ''}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${meta.badgeClass}`}>
                                                {meta.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
                            Recent ERP Orders ({erpOverview.total_orders})
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {erpOverview.recent_orders.length === 0 ? (
                                <p className="p-5 text-slate-500 text-center">No subcontract orders recorded.</p>
                            ) : (
                                erpOverview.recent_orders.map((ord) => {
                                    const ordStatus = getOrderStatusMeta(ord.status);
                                    return (
                                    <Link
                                        key={ord.id}
                                        href={route('admin.orders.show', ord.id)}
                                        className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {ord.order_no} {ord.buyer ? `· ${ord.buyer}` : ''}
                                            </p>
                                            <p className="text-slate-500 truncate max-w-xs">{ord.fabric_summary}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {Number(ord.done_kg).toLocaleString()} / {Number(ord.total_qty_kg).toLocaleString()} kg
                                            </p>
                                            <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${ordStatus.badgeClass}`}>
                                                {ordStatus.label}
                                            </span>
                                        </div>
                                    </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* KnitKhata Floor Telemetry: Bills, Expenses, Parties & Staff */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-semibold">
                            <span>Bills & Expenses</span>
                            <span className="text-xs font-normal text-slate-500">
                                Challans: {erpOverview.challans_count} · Exp: ৳{Math.round(erpOverview.expenses_tk).toLocaleString()}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {erpOverview.recent_bills.length === 0 ? (
                                <p className="p-5 text-slate-500 text-center">No invoices generated yet.</p>
                            ) : (
                                erpOverview.recent_bills.map((bill) => (
                                    <div key={bill.id} className="px-5 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {bill.bill_no} ({bill.jv_no})
                                            </p>
                                            <p className="text-slate-500">
                                                Party: {bill.party_code} · {bill.bill_date || '—'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">৳{bill.gross_tk.toLocaleString()}</p>
                                            <p className="text-[11px] text-emerald-600">Paid ৳{bill.paid_tk.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-semibold">
                            <span>Parties ({erpOverview.parties_count}) & Floor Team ({erpOverview.employees_count})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 text-xs">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {erpOverview.parties.length === 0 ? (
                                    <p className="p-4 text-slate-500 text-center">No parties</p>
                                ) : (
                                    erpOverview.parties.slice(0, 5).map((p) => (
                                        <div key={p.id} className="px-4 py-2.5 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">{p.name}</p>
                                                <p className="text-[11px] text-slate-500">{p.code} · {p.type}</p>
                                            </div>
                                            <span className="font-mono text-[11px]">৳{Number(p.default_rate_tk)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {erpOverview.employees.length === 0 ? (
                                    <p className="p-4 text-slate-500 text-center">No employees</p>
                                ) : (
                                    erpOverview.employees.slice(0, 5).map((emp) => (
                                        <div key={emp.id} className="px-4 py-2.5 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">{emp.name}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {emp.employee_type} · Shift {emp.shift} {emp.machine_assigned ? `(${emp.machine_assigned})` : ''}
                                                </p>
                                            </div>
                                            <span className="text-[11px] font-semibold">৳{Number(emp.daily_wage)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Machine Modal */}
            {showAddMachine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold">Add Machine to {factory.name}</h3>
                            <button onClick={() => setShowAddMachine(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddMachine} className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Machine Code *</label>
                                <input
                                    type="text"
                                    value={machineForm.data.code}
                                    onChange={(e) => machineForm.setData('code', e.target.value)}
                                    required
                                    placeholder="M-25"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {machineForm.errors.code && <p className="text-rose-500 mt-1">{machineForm.errors.code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Knit Type *</label>
                                <select
                                    value={machineForm.data.knit_type}
                                    onChange={(e) => machineForm.setData('knit_type', e.target.value as 'c' | 'f')}
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
                                    value={machineForm.data.dia}
                                    onChange={(e) => machineForm.setData('dia', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Gauge *</label>
                                <input
                                    type="number"
                                    value={machineForm.data.gauge}
                                    onChange={(e) => machineForm.setData('gauge', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Brand</label>
                                <input
                                    type="text"
                                    value={machineForm.data.brand}
                                    onChange={(e) => machineForm.setData('brand', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <input
                                    type="text"
                                    value={machineForm.data.status}
                                    onChange={(e) => machineForm.setData('status', e.target.value)}
                                    placeholder="idle / down / run:SC-..."
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Daily Capacity (kg) *</label>
                                <input
                                    type="number"
                                    value={machineForm.data.daily_capacity_kg}
                                    onChange={(e) => machineForm.setData('daily_capacity_kg', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rate Label</label>
                                <input
                                    type="text"
                                    value={machineForm.data.rate_label}
                                    onChange={(e) => machineForm.setData('rate_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Supported Fabrics (comma separated)</label>
                                <input
                                    type="text"
                                    value={machineForm.data.supported_fabrics}
                                    onChange={(e) => machineForm.setData('supported_fabrics', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="modal_broadcast"
                                    checked={machineForm.data.broadcast_free}
                                    onChange={(e) => machineForm.setData('broadcast_free', e.target.checked)}
                                />
                                <label htmlFor="modal_broadcast" className="font-semibold">Broadcast as Free Machine</label>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddMachine(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={machineForm.processing}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    Save Machine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
