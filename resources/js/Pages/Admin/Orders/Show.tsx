import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    Factory,
    Layers,
    PackageCheck,
    Pencil,
    Plus,
    Receipt,
    ShieldAlert,
    Trash2,
    Truck,
    X,
} from 'lucide-react';
import { BillSummaryRow, DeliveryChallan, QcInspection, SubcontractOrder } from '@/types';
import { getOrderStatusMeta } from '@/utils/labels';

interface MachineOption {
    id: number;
    code: string;
    spec_label: string | null;
    status: string;
}

interface OperatorOption {
    id: number;
    name: string;
    employee_type: string;
    shift: string;
    machine_assigned: string | null;
}

interface Props {
    order: SubcontractOrder;
    relatedBills: BillSummaryRow[];
    factoryMachines?: MachineOption[];
    operators?: OperatorOption[];
}

export default function Show({ order, relatedBills, factoryMachines = [], operators = [] }: Props) {
    const statusMeta = getOrderStatusMeta(order.status);
    const totalKg = Number(order.total_qty_kg || 0);
    const doneKg = Number(order.done_kg || 0);
    const deliveredKg = Number(order.delivered_kg || 0);
    const pct = totalKg > 0 ? Math.min(100, Math.round((doneKg / totalKg) * 100)) : 0;

    const [showProdModal, setShowProdModal] = useState(false);
    const [showYarnInModal, setShowYarnInModal] = useState(false);
    const [showYarnReturnModal, setShowYarnReturnModal] = useState(false);
    const [signingQc, setSigningQc] = useState<QcInspection | null>(null);
    const [signingChallan, setSigningChallan] = useState<DeliveryChallan | null>(null);

    const prodForm = useForm({
        placement_index: 0,
        date_label: '',
        shift: 'A',
        machine_code: order.machines_json?.[0] || factoryMachines[0]?.code || 'M-01',
        operator_name: operators[0]?.name || '',
        qty_kg: '',
        rolls_count: 1,
        yarn_lot: '',
        fault_code: '',
        generate_rolls: true,
    });

    const yarnInForm = useForm({
        count: order.yarn_summary || '30/1 Combed Cotton',
        spinner: '',
        lot: '',
        bags: 0,
        kg: '',
    });

    const yarnReturnForm = useForm({
        lot: '',
        kg: '',
        date_label: '',
    });

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

    const submitProd = (e: FormEvent) => {
        e.preventDefault();
        prodForm.post(route('admin.orders.productions.store', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowProdModal(false);
                prodForm.reset('qty_kg', 'fault_code');
            },
        });
    };

    const submitYarnIn = (e: FormEvent) => {
        e.preventDefault();
        yarnInForm.post(route('admin.orders.yarn.store', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowYarnInModal(false);
                yarnInForm.reset('lot', 'kg');
            },
        });
    };

    const submitYarnReturn = (e: FormEvent) => {
        e.preventDefault();
        yarnReturnForm.post(route('admin.orders.yarnReturn.store', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowYarnReturnModal(false);
                yarnReturnForm.reset('lot', 'kg');
            },
        });
    };

    const submitQc = (e: FormEvent) => {
        e.preventDefault();
        if (!signingQc) {
            return;
        }
        qcForm.post(route('admin.floor-erp.qc.sign', signingQc.id), {
            preserveScroll: true,
            onSuccess: () => setSigningQc(null),
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

    const productions = order.productions || [];
    const fabricRolls = order.fabric_rolls || [];
    const yarnIn = order.yarn_in_json || [];
    const yarnReturns = order.yarn_returns_json || [];

    return (
        <AdminLayout title={`Order: ${order.order_no}`}>
            <Head title={order.order_no} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.orders.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => setShowProdModal(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Log Production
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowYarnInModal(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" /> Yarn Inward
                        </button>
                        <select
                            value={statusMeta.key}
                            onChange={(e) => router.post(route('admin.orders.status', order.id), { status: e.target.value }, { preserveScroll: true })}
                            className={`px-3 py-1.5 rounded-xl font-bold border-0 cursor-pointer ${statusMeta.badgeClass}`}
                        >
                            <option value="run">Status: Running</option>
                            <option value="wait">Status: Waiting Yarn</option>
                            <option value="done">Status: Completed</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(`Delete subcontract order ${order.order_no}?`)) {
                                    router.delete(route('admin.orders.destroy', order.id));
                                }
                            }}
                            className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                            title="Delete Order"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Order Overview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{order.order_no}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusMeta.badgeClass}`}>
                                    {statusMeta.label}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{order.fabric_summary}</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Buyer: <span className="font-semibold text-slate-700 dark:text-slate-200">{order.buyer || '—'}</span> · Party:{' '}
                                <span className="font-semibold">{order.party?.name || order.party_code}</span>
                                {order.order_date && ` · Ordered: ${order.order_date}`}
                                {order.delivery_due_date && ` · Due: ${order.delivery_due_date}`}
                            </p>
                            {order.factory && (
                                <Link
                                    href={route('admin.factories.show', order.factory.id)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-1"
                                >
                                    <Factory className="w-3.5 h-3.5" /> {order.factory.code} — {order.factory.name}
                                </Link>
                            )}
                        </div>

                        <div className="text-right text-xs">
                            <p className="text-slate-500">Order Progress ({pct}%)</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {doneKg.toLocaleString()} / {totalKg.toLocaleString()} kg
                            </p>
                            <p className="text-slate-500 mt-0.5">
                                Delivered: {deliveredKg.toLocaleString()} kg · Rate: ৳{order.rate_tk}/kg
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[11px] text-slate-500">GSM / Stitch</p>
                            <p className="font-semibold">{order.gsm || '—'} {order.stitch_length ? `· ${order.stitch_length}` : ''}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Dia / Gauge</p>
                            <p className="font-semibold">{order.dia_gauge || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Color / Yarn</p>
                            <p className="font-semibold">{order.color || '—'} {order.yarn_summary ? `· ${order.yarn_summary}` : ''}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Assigned Machines</p>
                            <p className="font-semibold font-mono">{(order.machines_json || []).join(', ') || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Order Lines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
                        Fabrication Placements / Lines ({order.lines?.length ?? 0})
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-2.5 px-4">Placement &amp; Fabric</th>
                                    <th className="py-2.5 px-4">Specs</th>
                                    <th className="py-2.5 px-4">Ordered</th>
                                    <th className="py-2.5 px-4">Knitted</th>
                                    <th className="py-2.5 px-4">Delivered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(order.lines || []).map((l) => (
                                    <tr key={l.id}>
                                        <td className="py-2.5 px-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{l.placement}: {l.fabrication}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {l.color || '—'} · {l.knit_type === 'f' ? 'Flat' : 'Circular'}
                                                {l.flat_design ? ` · ${l.flat_design}` : ''}
                                            </p>
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-500">
                                            {[l.grey_gsm, l.dia_gauge, l.stitch_length, l.flat_size].filter(Boolean).join(' · ') || '—'}
                                        </td>
                                        <td className="py-2.5 px-4 font-semibold">{Number(l.qty).toLocaleString()} {l.unit}</td>
                                        <td className="py-2.5 px-4">{Number(l.done_qty).toLocaleString()} {l.unit}</td>
                                        <td className="py-2.5 px-4">{Number(l.delivered_qty).toLocaleString()} {l.unit}</td>
                                    </tr>
                                ))}
                                {(order.lines?.length ?? 0) === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-400">No line breakdown recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Production & Fabric Rolls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                Shift Production Logs ({productions.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowProdModal(true)}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                                + Log Entry
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-96 overflow-y-auto">
                            {productions.map((p) => (
                                <div key={p.id} className="p-4 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {p.date_label} · Shift {p.shift} · <span className="font-mono">{p.machine_code}</span>
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Op: {p.operator_name || '—'} · Lot: {p.yarn_lot || '—'}
                                            {p.fault_code ? ` · Fault: ${p.fault_code}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-emerald-600">{Number(p.qty_kg).toLocaleString()} kg</p>
                                        <p className="text-[11px] text-slate-500">{p.rolls_count} rolls</p>
                                    </div>
                                </div>
                            ))}
                            {productions.length === 0 && <p className="p-6 text-center text-slate-400">No shift production logs yet.</p>}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <PackageCheck className="w-4 h-4 text-indigo-600" />
                                Fabric Rolls / Job Cards ({fabricRolls.length})
                            </span>
                            <Link href={route('admin.floor-erp.index', { tab: 'rolls', search: order.order_no })} className="text-xs font-semibold text-blue-600 hover:underline">
                                View All →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-96 overflow-y-auto">
                            {fabricRolls.map((r) => (
                                <div key={r.id} className="p-4 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                                            {r.roll_no} (JC #{r.jc_seq})
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {r.date_label} · Shift {r.shift} · Op: {r.operator_name || '—'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold">{r.weight_kg} kg</p>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                r.challan_no
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            }`}
                                        >
                                            {r.challan_no ? r.challan_no : 'In Stock'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {fabricRolls.length === 0 && <p className="p-6 text-center text-slate-400">No fabric rolls generated yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Yarn Inward & Returns */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-sm">Yarn Ledger ({yarnIn.length} inward · {yarnReturns.length} returns)</h3>
                        <div className="flex gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setShowYarnInModal(true)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-semibold"
                            >
                                + Receive Yarn
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowYarnReturnModal(true)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                            >
                                + Return Yarn Challan
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold">Yarn Received Inward</div>
                            {yarnIn.map((y, idx) => (
                                <div key={idx} className="px-4 py-2.5 flex justify-between">
                                    <div>
                                        <p className="font-semibold">{String(y.count || '—')} · Lot {String(y.lot || '—')}</p>
                                        <p className="text-[11px] text-slate-500">{String(y.spinner || '—')} · {String(y.bags ?? 0)} bags</p>
                                    </div>
                                    <span className="font-bold text-emerald-600">{Number(y.kg || 0).toLocaleString()} kg</span>
                                </div>
                            ))}
                            {yarnIn.length === 0 && <p className="p-4 text-slate-400 text-center">No yarn inward recorded.</p>}
                        </div>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold">Yarn Return Challans</div>
                            {yarnReturns.map((yr, idx) => (
                                <div key={idx} className="px-4 py-2.5 flex justify-between">
                                    <div>
                                        <p className="font-mono font-bold">{String(yr.challan_no || 'YRC')}</p>
                                        <p className="text-[11px] text-slate-500">Lot {String(yr.lot || '—')} · {String(yr.d || yr.date || '')}</p>
                                    </div>
                                    <span className="font-bold text-amber-600">{Number(yr.kg || 0).toLocaleString()} kg</span>
                                </div>
                            ))}
                            {yarnReturns.length === 0 && <p className="p-4 text-slate-400 text-center">No yarn returns recorded.</p>}
                        </div>
                    </div>
                </div>

                {/* QC Inspections & Delivery Challans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-amber-500" />
                            QC Inspections &amp; Dual Signs ({order.qc_inspections?.length ?? 0})
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(order.qc_inspections || []).map((qc) => (
                                <div key={qc.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {qc.qc_no} · Roll {qc.roll_no} ({qc.weight_kg} kg)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSigningQc(qc);
                                                qcForm.setData({
                                                    side: qc.factory_sign_json?.v && !qc.vendor_sign_json?.v ? 'ven' : 'fac',
                                                    verdict: 'ok',
                                                    signed_by: '',
                                                    note: '',
                                                    action_taken: qc.action_taken || '',
                                                });
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-semibold"
                                        >
                                            <Pencil className="w-3 h-3" /> Sign / Action
                                        </button>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300">{qc.issue_description}</p>
                                    {qc.action_taken && <p className="text-[11px] text-blue-600">Action: {qc.action_taken}</p>}
                                    <div className="flex flex-wrap gap-2 text-[11px]">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                                                qc.factory_sign_json?.v
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                            }`}
                                        >
                                            {qc.factory_sign_json?.v ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                            Factory: {qc.factory_sign_json?.v || 'Unsigned'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold ${
                                                qc.vendor_sign_json?.v
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                            }`}
                                        >
                                            {qc.vendor_sign_json?.v ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                            Vendor: {qc.vendor_sign_json?.v || 'Unsigned'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(order.qc_inspections?.length ?? 0) === 0 && (
                                <p className="p-6 text-center text-slate-400">No QC inspections recorded for this order.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-500" />
                                Delivery Challans ({order.delivery_challans?.length ?? 0})
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {(order.delivery_challans || []).map((ch) => (
                                    <div key={ch.id} className="p-4 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-mono font-bold text-slate-900 dark:text-white">{ch.challan_no}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    Vehicle: {ch.vehicle_no} {ch.driver_name ? `· ${ch.driver_name}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[11px]">{(ch.rolls_json || []).length} rolls</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSigningChallan(ch);
                                                        challanSignForm.setData({
                                                            signed_by: ch.vendor_sign_json?.by || '',
                                                            received_rolls: ch.vendor_sign_json?.got ?? (ch.rolls_json?.length || 0),
                                                        });
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold"
                                                >
                                                    Sign Receipt
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Fac: {ch.factory_sign_json?.by || 'Unsigned'} · Ven: {ch.vendor_sign_json?.by ? `${ch.vendor_sign_json.by} (${ch.vendor_sign_json.got ?? 0} rolls)` : 'Pending'}
                                        </p>
                                    </div>
                                ))}
                                {(order.delivery_challans?.length ?? 0) === 0 && (
                                    <p className="p-6 text-center text-slate-400">No delivery challans issued yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-emerald-500" />
                                    Party Invoices ({relatedBills.length})
                                </span>
                                <Link href={route('admin.bills.index', { factory_code: order.factory?.code || 'all' })} className="text-xs font-semibold text-blue-600 hover:underline">
                                    Billing Hub →
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {relatedBills.map((b) => (
                                    <div key={b.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-mono font-bold text-slate-900 dark:text-white">{b.bill_no}</p>
                                            <p className="text-[11px] text-slate-500">JV: {b.jv_no} · {b.bill_date || '—'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">৳{b.gross_tk.toLocaleString()}</p>
                                            <p className="text-[11px] text-emerald-600">Paid ৳{b.paid_tk.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {relatedBills.length === 0 && (
                                    <p className="p-6 text-center text-slate-400">No bills linked to this party yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Shift Production Modal */}
            {showProdModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Log Production: {order.order_no}</h3>
                            <button type="button" onClick={() => setShowProdModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitProd} className="p-5 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Placement Line *</label>
                                <select
                                    value={prodForm.data.placement_index}
                                    onChange={(e) => prodForm.setData('placement_index', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {(order.lines || []).length > 0 ? (
                                        (order.lines || []).map((l) => (
                                            <option key={l.id} value={l.line_index}>
                                                {l.placement} — {l.fabrication}
                                            </option>
                                        ))
                                    ) : (
                                        <option value={0}>Body</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Machine Code *</label>
                                <input
                                    type="text"
                                    required
                                    list="order-machines"
                                    value={prodForm.data.machine_code}
                                    onChange={(e) => prodForm.setData('machine_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                />
                                <datalist id="order-machines">
                                    {factoryMachines.map((m) => (
                                        <option key={m.id} value={m.code} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Shift *</label>
                                <select
                                    value={prodForm.data.shift}
                                    onChange={(e) => prodForm.setData('shift', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="A">Shift A</option>
                                    <option value="B">Shift B</option>
                                    <option value="C">Shift C</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Operator</label>
                                <input
                                    type="text"
                                    list="order-operators"
                                    value={prodForm.data.operator_name}
                                    onChange={(e) => prodForm.setData('operator_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="order-operators">
                                    {operators.map((op) => (
                                        <option key={op.id} value={op.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Knitted Weight (kg) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0.1}
                                    required
                                    value={prodForm.data.qty_kg}
                                    onChange={(e) => prodForm.setData('qty_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rolls Count *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={prodForm.data.rolls_count}
                                    onChange={(e) => prodForm.setData('rolls_count', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Yarn Lot</label>
                                <input
                                    type="text"
                                    value={prodForm.data.yarn_lot}
                                    onChange={(e) => prodForm.setData('yarn_lot', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Fault Code (if any)</label>
                                <input
                                    type="text"
                                    value={prodForm.data.fault_code}
                                    onChange={(e) => prodForm.setData('fault_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={prodForm.data.generate_rolls}
                                        onChange={(e) => prodForm.setData('generate_rolls', e.target.checked)}
                                    />
                                    Auto-generate corresponding Fabric Roll records
                                </label>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowProdModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={prodForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Yarn Inward Modal */}
            {showYarnInModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Receive Yarn Inward</h3>
                            <button type="button" onClick={() => setShowYarnInModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitYarnIn} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Yarn Count *</label>
                                <input
                                    type="text"
                                    required
                                    value={yarnInForm.data.count}
                                    onChange={(e) => yarnInForm.setData('count', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Spinner Mill</label>
                                <input
                                    type="text"
                                    value={yarnInForm.data.spinner}
                                    onChange={(e) => yarnInForm.setData('spinner', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Lot *</label>
                                    <input
                                        type="text"
                                        required
                                        value={yarnInForm.data.lot}
                                        onChange={(e) => yarnInForm.setData('lot', e.target.value)}
                                        className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Bags</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={yarnInForm.data.bags}
                                        onChange={(e) => yarnInForm.setData('bags', Number(e.target.value))}
                                        className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Weight (kg) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min={0.1}
                                        required
                                        value={yarnInForm.data.kg}
                                        onChange={(e) => yarnInForm.setData('kg', e.target.value)}
                                        className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowYarnInModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={yarnInForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Save Inward
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Yarn Return Modal */}
            {showYarnReturnModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Issue Yarn Return Challan</h3>
                            <button type="button" onClick={() => setShowYarnReturnModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitYarnReturn} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Lot No *</label>
                                <input
                                    type="text"
                                    required
                                    value={yarnReturnForm.data.lot}
                                    onChange={(e) => yarnReturnForm.setData('lot', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Return Weight (kg) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0.1}
                                    required
                                    value={yarnReturnForm.data.kg}
                                    onChange={(e) => yarnReturnForm.setData('kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowYarnReturnModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={yarnReturnForm.processing} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold">
                                    Issue YRC
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QC Modal */}
            {signingQc && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Arbitrate QC: {signingQc.qc_no}</h3>
                            <button type="button" onClick={() => setSigningQc(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitQc} className="p-5 space-y-3 text-xs">
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
                                        <option value="ok">OK / Pass</option>
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
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Action Taken</label>
                                <input
                                    type="text"
                                    value={qcForm.data.action_taken}
                                    onChange={(e) => qcForm.setData('action_taken', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setSigningQc(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={qcForm.processing} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Challan Sign Modal */}
            {signingChallan && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Vendor Receipt: {signingChallan.challan_no}</h3>
                            <button type="button" onClick={() => setSigningChallan(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitChallanSign} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Receiver Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={challanSignForm.data.signed_by}
                                    onChange={(e) => challanSignForm.setData('signed_by', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Rolls Received *</label>
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
                                    Save Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
