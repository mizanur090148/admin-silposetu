import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import SearchableSelect from '@/Components/SearchableSelect';
import { ArrowLeft, Plus, Trash2, Save, Cpu } from 'lucide-react';
import { UserRef } from '@/types';

interface Props {
    owners: UserRef[];
    suggestedCode: string;
}

interface InlineMachineForm {
    code: string;
    knit_type: 'c' | 'f';
    dia: string;
    gauge: string;
    spec_label: string;
    brand: string;
    status: string;
    daily_capacity_kg: string;
    rate_label: string;
    supported_fabrics: string;
    broadcast_free: boolean;
}

export default function Create({ owners, suggestedCode }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        code: string;
        name: string;
        area: string;
        address: string;
        phone: string;
        owner_id: string;
        total_machines: number;
        plan_code: string;
        billing_cycle: 'm' | 'y';
        trial_ends_at: string;
        qr_sticker_enabled: boolean;
        yearly_orders_count: number;
        ontime_delivery_pct: string;
        qc_reject_pct: string;
        machines: InlineMachineForm[];
    }>({
        code: suggestedCode,
        name: '',
        area: '',
        address: '',
        phone: '',
        owner_id: '',
        total_machines: 24,
        plan_code: 'g',
        billing_cycle: 'm',
        trial_ends_at: '',
        qr_sticker_enabled: true,
        yearly_orders_count: 14,
        ontime_delivery_pct: '93.00',
        qc_reject_pct: '0.60',
        machines: [],
    });

    const addMachineRow = () => {
        const idx = data.machines.length + 1;
        setData('machines', [
            ...data.machines,
            {
                code: `M-${String(idx).padStart(2, '0')}`,
                knit_type: 'c',
                dia: '30',
                gauge: '24',
                spec_label: '30" × 24G',
                brand: 'Pailung',
                status: 'idle',
                daily_capacity_kg: '190',
                rate_label: '৳১৩–১৫ / kg',
                supported_fabrics: 'Single Jersey, 1×1 Rib',
                broadcast_free: false,
            },
        ]);
    };

    const removeMachineRow = (index: number) => {
        setData(
            'machines',
            data.machines.filter((_, idx) => idx !== index)
        );
    };

    const updateMachineRow = (index: number, field: keyof InlineMachineForm, value: string | boolean) => {
        const updated = [...data.machines];
        updated[index] = { ...updated[index], [field]: value };
        setData('machines', updated);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.factories.store'));
    };

    return (
        <AdminLayout title="Create Factory">
            <Head title="Create Factory" />

            <div className="max-w-5xl mx-auto space-y-6">
                <Link
                    href={route('admin.factories.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Factories
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Factory Profile & Subscription</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Factory Code *</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                />
                                {errors.code && <p className="text-rose-500 mt-1">{errors.code}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Factory Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. রহমান নিটিং ইন্ডাস্ট্রিজ"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {errors.name && <p className="text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Area / Industrial Zone</label>
                                <input
                                    type="text"
                                    value={data.area}
                                    onChange={(e) => setData('area', e.target.value)}
                                    placeholder="কোনাবাড়ি, গাজীপুর"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="01711000001"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Owner Account (Optional)</label>
                                <SearchableSelect
                                    value={data.owner_id}
                                    onChange={(val) => setData('owner_id', val)}
                                    placeholder="Select owner user..."
                                    options={owners.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                        subLabel: `${u.phone} (${u.role})`,
                                    }))}
                                />
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block font-semibold mb-1">Full Address</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Total Machines *</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.total_machines}
                                    onChange={(e) => setData('total_machines', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Subscription Plan *</label>
                                <select
                                    value={data.plan_code}
                                    onChange={(e) => setData('plan_code', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="s">Starter (s · up to 10 MCs · ৳1,000/mo)</option>
                                    <option value="g">Growth (g · up to 25 MCs · ৳1,500/mo)</option>
                                    <option value="p">Pro (p · up to 60 MCs · ৳2,500/mo)</option>
                                    <option value="e">Enterprise (e · Unlimited MCs · ৳4,000/mo)</option>
                                    <option value="free">Free (free · 5 MCs)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Billing Cycle *</label>
                                <select
                                    value={data.billing_cycle}
                                    onChange={(e) => setData('billing_cycle', e.target.value as 'm' | 'y')}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="m">Monthly (m)</option>
                                    <option value="y">Yearly (y)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Yearly Orders</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={data.yearly_orders_count}
                                    onChange={(e) => setData('yearly_orders_count', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">On-Time Delivery %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    value={data.ontime_delivery_pct}
                                    onChange={(e) => setData('ontime_delivery_pct', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">QC Reject %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    value={data.qc_reject_pct}
                                    onChange={(e) => setData('qc_reject_pct', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Trial Ends At</label>
                                <input
                                    type="date"
                                    value={data.trial_ends_at}
                                    onChange={(e) => setData('trial_ends_at', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="flex items-center pt-5">
                                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.qr_sticker_enabled}
                                        onChange={(e) => setData('qr_sticker_enabled', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600"
                                    />
                                    QR Sticker Enabled
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Optional Initial Machines */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-blue-500" /> Initial Factory Machines
                                </h2>
                                <p className="text-xs text-slate-500">Add individual machines into `factory_machines` for this factory.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addMachineRow}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Machine Row
                            </button>
                        </div>

                        {data.machines.length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No initial machines added. You can add machines later from Factory Details or Factory Machines.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.machines.map((row, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs items-end"
                                    >
                                        <div>
                                            <label className="block font-medium mb-1">Code *</label>
                                            <input
                                                type="text"
                                                value={row.code}
                                                onChange={(e) => updateMachineRow(idx, 'code', e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Knit Type</label>
                                            <select
                                                value={row.knit_type}
                                                onChange={(e) => updateMachineRow(idx, 'knit_type', e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                            >
                                                <option value="c">Circular (c)</option>
                                                <option value="f">Flat (f)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Dia / Gauge</label>
                                            <div className="flex gap-1">
                                                <input
                                                    type="number"
                                                    value={row.dia}
                                                    onChange={(e) => updateMachineRow(idx, 'dia', e.target.value)}
                                                    placeholder="30"
                                                    className="w-1/2 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                                />
                                                <input
                                                    type="number"
                                                    value={row.gauge}
                                                    onChange={(e) => updateMachineRow(idx, 'gauge', e.target.value)}
                                                    placeholder="24"
                                                    className="w-1/2 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Brand</label>
                                            <input
                                                type="text"
                                                value={row.brand}
                                                onChange={(e) => updateMachineRow(idx, 'brand', e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Capacity (kg)</label>
                                            <input
                                                type="number"
                                                value={row.daily_capacity_kg}
                                                onChange={(e) => updateMachineRow(idx, 'daily_capacity_kg', e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="flex items-center gap-1.5 text-[11px] font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={row.broadcast_free}
                                                    onChange={(e) => updateMachineRow(idx, 'broadcast_free', e.target.checked)}
                                                />
                                                Free Broadcast
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeMachineRow(idx)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Create Factory'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
