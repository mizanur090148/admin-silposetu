import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import SearchableSelect from '@/Components/SearchableSelect';
import { ArrowLeft, Save } from 'lucide-react';
import { Factory, UserRef } from '@/types';

interface Props {
    factory: Factory;
    owners: UserRef[];
}

export default function Edit({ factory, owners }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: factory.code,
        name: factory.name,
        area: factory.area || '',
        address: factory.address || '',
        phone: factory.phone || '',
        owner_id: factory.owner_id ? String(factory.owner_id) : '',
        total_machines: factory.total_machines,
        plan_code: factory.plan_code,
        billing_cycle: factory.billing_cycle,
        trial_ends_at: factory.trial_ends_at ? factory.trial_ends_at.slice(0, 10) : '',
        qr_sticker_enabled: factory.qr_sticker_enabled,
        last_update_label: factory.last_update_label,
        yearly_orders_count: factory.yearly_orders_count,
        ontime_delivery_pct: String(factory.ontime_delivery_pct),
        qc_reject_pct: String(factory.qc_reject_pct),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('admin.factories.update', factory.id));
    };

    return (
        <AdminLayout title={`Edit Factory: ${factory.name}`}>
            <Head title={`Edit ${factory.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href={route('admin.factories.show', factory.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Factory Details
                </Link>

                <form
                    onSubmit={submit}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
                >
                    <h2 className="text-base font-bold">Update Factory Profile</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold mb-1">Code *</label>
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
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                            {errors.name && <p className="text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Area</label>
                            <input
                                type="text"
                                value={data.area}
                                onChange={(e) => setData('area', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Phone</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Owner Account</label>
                            <SearchableSelect
                                value={data.owner_id}
                                onChange={(val) => setData('owner_id', val)}
                                placeholder="Unassigned"
                                options={owners.map((u) => ({
                                    value: u.id,
                                    label: u.name,
                                    subLabel: `${u.phone} (${u.role})`,
                                }))}
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block font-semibold mb-1">Address</label>
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
                                {!['s', 'g', 'p', 'e', 'free'].includes(data.plan_code) && (
                                    <option value={data.plan_code}>{data.plan_code}</option>
                                )}
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
                            <label className="block font-semibold mb-1">Yearly Orders Count</label>
                            <input
                                type="number"
                                min={0}
                                value={data.yearly_orders_count}
                                onChange={(e) => setData('yearly_orders_count', Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">On-time Delivery %</label>
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
                            <label className="block font-semibold mb-1">Last Update Label</label>
                            <input
                                type="text"
                                value={data.last_update_label}
                                onChange={(e) => setData('last_update_label', e.target.value)}
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Link
                            href={route('admin.factories.show', factory.id)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {processing ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
