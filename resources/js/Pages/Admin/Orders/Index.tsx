import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { ClipboardList, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FactoryRef, PaginatedData, SubcontractOrder } from '@/types';
import { getOrderStatusMeta } from '@/utils/labels';

interface PartyOption {
    id: number;
    factory_id: number;
    code: string;
    name: string;
    type: string;
    default_rate_tk: string | number;
}

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
    parties: PartyOption[];
    filters: {
        search: string;
        status: string;
        factory_id: string;
        party_code: string;
        per_page: number;
    };
}

export default function Index({ orders, summary, factories, parties, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<SubcontractOrder | null>(null);

    const form = useForm({
        order_no: '',
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        party_code: parties[0]?.code || '',
        buyer: '',
        fabric_summary: '',
        gsm: '160 GSM',
        finish_gsm: '',
        stitch_length: '',
        grey_dia: '',
        dia_gauge: '30" × 24G',
        color: '',
        yarn_summary: '30/1 Combed Cotton',
        total_qty_kg: '1000',
        done_kg: '0',
        delivered_kg: '0',
        daily_rate_kg: '300',
        rate_tk: '14',
        status: 'run',
        order_date: new Date().toISOString().slice(0, 10),
        delivery_due_date: '',
        machines: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.orders.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (orderId: number, status: string) => {
        router.post(route('admin.orders.status', orderId), { status }, { preserveScroll: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({
            order_no: '',
            factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
            party_code: parties[0]?.code || 'abc',
            buyer: '',
            fabric_summary: '',
            gsm: '160 GSM',
            finish_gsm: '',
            stitch_length: '',
            grey_dia: '',
            dia_gauge: '30" × 24G',
            color: '',
            yarn_summary: '30/1 Combed Cotton',
            total_qty_kg: '1000',
            done_kg: '0',
            delivered_kg: '0',
            daily_rate_kg: '300',
            rate_tk: '14',
            status: 'run',
            order_date: new Date().toISOString().slice(0, 10),
            delivery_due_date: '',
            machines: '',
        });
        setShowModal(true);
    };

    const openEdit = (order: SubcontractOrder) => {
        setEditing(order);
        form.clearErrors();
        form.setData({
            order_no: order.order_no,
            factory_id: String(order.factory_id),
            party_code: order.party_code,
            buyer: order.buyer || '',
            fabric_summary: order.fabric_summary,
            gsm: order.gsm || '',
            finish_gsm: order.finish_gsm || '',
            stitch_length: order.stitch_length || '',
            grey_dia: order.grey_dia || '',
            dia_gauge: order.dia_gauge || '',
            color: order.color || '',
            yarn_summary: order.yarn_summary || '',
            total_qty_kg: String(order.total_qty_kg),
            done_kg: String(order.done_kg),
            delivered_kg: String(order.delivered_kg),
            daily_rate_kg: String(order.daily_rate_kg),
            rate_tk: String(order.rate_tk),
            status: getOrderStatusMeta(order.status).key,
            order_date: order.order_date ? order.order_date.slice(0, 10) : '',
            delivery_due_date: order.delivery_due_date ? order.delivery_due_date.slice(0, 10) : '',
            machines: (order.machines_json || []).join(', '),
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.orders.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.orders.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (order: SubcontractOrder) => {
        if (!confirm(`Delete subcontract order ${order.order_no}?`)) {
            return;
        }
        router.delete(route('admin.orders.destroy', order.id), { preserveScroll: true });
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

                {/* Filters & Action */}
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
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[200px]"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.code} — {f.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.party_code}
                            onChange={(e) => applyFilter({ party_code: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[180px]"
                        >
                            <option value="all">All Parties</option>
                            {parties.map((p) => (
                                <option key={p.id} value={p.code}>
                                    {p.code} — {p.name}
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
                        <Plus className="w-3.5 h-3.5" /> New Order
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Order No &amp; Buyer</th>
                                    <th className="py-3 px-4">Factory &amp; Party</th>
                                    <th className="py-3 px-4">Fabrication &amp; Rate</th>
                                    <th className="py-3 px-4">Knitting Progress</th>
                                    <th className="py-3 px-4">ERP Telemetry</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
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
                                                <p className="text-[11px] text-slate-500">Party: {order.party?.name || order.party_code}</p>
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
                                                <p>
                                                    {order.lines_count ?? 0} lines · {order.productions_count ?? 0} prod · {order.fabric_rolls_count ?? 0} rolls
                                                </p>
                                                <p>
                                                    {order.qc_inspections_count ?? 0} QC · {order.delivery_challans_count ?? 0} challans
                                                </p>
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
                                                <div className="inline-flex items-center gap-1">
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Inspect Order"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(order)}
                                                        title="Edit Order"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(order)}
                                                        title="Delete Order"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-rose-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">{editing ? `Edit Order: ${editing.order_no}` : 'Create Subcontract Order'}</h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {!editing && (
                                <div>
                                    <label className="block font-semibold mb-1">Order No</label>
                                    <input
                                        type="text"
                                        value={form.data.order_no}
                                        onChange={(e) => form.setData('order_no', e.target.value)}
                                        placeholder="Auto SC-YYMM-XXX if blank"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                    />
                                    {form.errors.order_no && <p className="text-rose-500 mt-1">{form.errors.order_no}</p>}
                                </div>
                            )}
                            {!editing && (
                                <div>
                                    <label className="block font-semibold mb-1">Factory *</label>
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
                            )}
                            <div>
                                <label className="block font-semibold mb-1">Party Code *</label>
                                <input
                                    type="text"
                                    required
                                    list="order-party-codes"
                                    value={form.data.party_code}
                                    onChange={(e) => form.setData('party_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="order-party-codes">
                                    {parties.map((p) => (
                                        <option key={p.id} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Buyer</label>
                                <input
                                    type="text"
                                    value={form.data.buyer}
                                    onChange={(e) => form.setData('buyer', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Fabrication Summary *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.fabric_summary}
                                    onChange={(e) => form.setData('fabric_summary', e.target.value)}
                                    placeholder="Single Jersey 160 GSM + 1x1 Rib"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Total Qty (kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0.1}
                                    required
                                    value={form.data.total_qty_kg}
                                    onChange={(e) => form.setData('total_qty_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Knitting Rate (৳/kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={form.data.rate_tk}
                                    onChange={(e) => form.setData('rate_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            {editing && (
                                <>
                                    <div>
                                        <label className="block font-semibold mb-1">Knitted (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={form.data.done_kg}
                                            onChange={(e) => form.setData('done_kg', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Delivered (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={form.data.delivered_kg}
                                            onChange={(e) => form.setData('delivered_kg', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block font-semibold mb-1">GSM / Dia-Gauge</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.data.gsm}
                                        onChange={(e) => form.setData('gsm', e.target.value)}
                                        placeholder="160"
                                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                    <input
                                        type="text"
                                        value={form.data.dia_gauge}
                                        onChange={(e) => form.setData('dia_gauge', e.target.value)}
                                        placeholder='30" × 24G'
                                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Color &amp; Yarn</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.data.color}
                                        onChange={(e) => form.setData('color', e.target.value)}
                                        placeholder="Black"
                                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                    <input
                                        type="text"
                                        value={form.data.yarn_summary}
                                        onChange={(e) => form.setData('yarn_summary', e.target.value)}
                                        placeholder="30/1 Combed"
                                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Assigned Machines (comma separated)</label>
                                <input
                                    type="text"
                                    value={form.data.machines}
                                    onChange={(e) => form.setData('machines', e.target.value)}
                                    placeholder="M-01, M-02"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="run">Running</option>
                                    <option value="wait">Waiting Yarn</option>
                                    <option value="done">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Order Date</label>
                                <input
                                    type="date"
                                    value={form.data.order_date}
                                    onChange={(e) => form.setData('order_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Delivery Due Date</label>
                                <input
                                    type="date"
                                    value={form.data.delivery_due_date}
                                    onChange={(e) => form.setData('delivery_due_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={form.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    {editing ? 'Update Order' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
