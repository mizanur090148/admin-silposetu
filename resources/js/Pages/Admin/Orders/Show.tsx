import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Factory, Receipt, ShieldAlert, Truck } from 'lucide-react';
import { BillSummaryRow, SubcontractOrder } from '@/types';
import { getOrderStatusMeta } from '@/utils/labels';

interface Props {
    order: SubcontractOrder;
    relatedBills: BillSummaryRow[];
}

export default function Show({ order, relatedBills }: Props) {
    const statusMeta = getOrderStatusMeta(order.status);
    const totalKg = Number(order.total_qty_kg || 0);
    const doneKg = Number(order.done_kg || 0);
    const deliveredKg = Number(order.delivered_kg || 0);
    const pct = totalKg > 0 ? Math.min(100, Math.round((doneKg / totalKg) * 100)) : 0;

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

                    <div className="flex items-center gap-2 text-xs">
                        <select
                            value={statusMeta.key}
                            onChange={(e) => router.post(route('admin.orders.status', order.id), { status: e.target.value }, { preserveScroll: true })}
                            className={`px-3 py-1.5 rounded-xl font-bold border-0 cursor-pointer ${statusMeta.badgeClass}`}
                        >
                            <option value="run">Status: Running</option>
                            <option value="wait">Status: Waiting Yarn</option>
                            <option value="done">Status: Completed</option>
                        </select>
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
                            <p className="font-semibold">{order.color || '—'}</p>
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
                                    <th className="py-2.5 px-4">Placement & Fabric</th>
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
                                            <p className="text-[11px] text-slate-500">{l.color || '—'} · {l.knit_type === 'f' ? 'Flat' : 'Circular'}</p>
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-500">
                                            {[l.grey_gsm, l.dia_gauge, l.stitch_length].filter(Boolean).join(' · ') || '—'}
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

                {/* QC Inspections & Delivery Challans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-amber-500" />
                            QC Inspections & Dual Signs ({order.qc_inspections?.length ?? 0})
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(order.qc_inspections || []).map((qc) => (
                                <div key={qc.id} className="p-4 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {qc.qc_no} · Roll {qc.roll_no} ({qc.weight_kg} kg)
                                        </span>
                                        <span className="text-[11px] text-slate-500">{qc.date_label}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300">{qc.issue_description}</p>
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
                                    <div key={ch.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-mono font-bold text-slate-900 dark:text-white">{ch.challan_no}</p>
                                            <p className="text-[11px] text-slate-500">
                                                Vehicle: {ch.vehicle_no} {ch.driver_name ? `· ${ch.driver_name}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right text-[11px]">
                                            <p className="font-semibold">{(ch.rolls_json || []).length} rolls</p>
                                            <p className="text-slate-500">{ch.date_label}</p>
                                        </div>
                                    </div>
                                ))}
                                {(order.delivery_challans?.length ?? 0) === 0 && (
                                    <p className="p-6 text-center text-slate-400">No delivery challans issued yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-500" />
                                Party Invoices ({relatedBills.length})
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
        </AdminLayout>
    );
}
