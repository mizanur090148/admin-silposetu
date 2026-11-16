import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Bell, Save } from 'lucide-react';
import { FactoryRef, PostType, UserRef } from '@/types';

interface Props {
    factories: FactoryRef[];
    users: UserRef[];
}

export default function Create({ factories, users }: Props) {
    const form = useForm({
        user_id: '',
        factory_id: '',
        post_type: 'work_offer' as PostType,
        title: '',
        fabric_type: '',
        gsm: '',
        dia: '',
        gauge: '',
        quantity_kg: '',
        target_rate_tk: '',
        yarn_count: '',
        location: '',
        delivery_deadline: '',
        description: '',
        status: 'open',
        notify_matches: true,
    });

    const handleFactoryChange = (factoryId: string) => {
        form.setData((prev) => {
            const selected = factories.find((f) => String(f.id) === factoryId);
            return {
                ...prev,
                factory_id: factoryId,
                location: prev.location || selected?.area || '',
            };
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('admin.posts.store'));
    };

    return (
        <AdminLayout title="Create Subcontract Post">
            <Head title="New Subcontract Post" />

            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('admin.posts.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Posts
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-xs"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Post Type *</label>
                            <select
                                value={form.data.post_type}
                                onChange={(e) => form.setData('post_type', e.target.value as PostType)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="work_offer">Work Offer (Need Knitting Capacity)</option>
                                <option value="machine_available">Machine Available (Free Capacity)</option>
                            </select>
                            {form.errors.post_type && <p className="text-rose-500 text-[11px] mt-1">{form.errors.post_type}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Status *</label>
                            <select
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="open">Open</option>
                                <option value="awarded">Awarded</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Post Title *</label>
                            <input
                                type="text"
                                required
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="e.g. Need 18,000 kg Single Jersey 160 GSM urgent subcontract"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                            {form.errors.title && <p className="text-rose-500 text-[11px] mt-1">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Factory (Optional)</label>
                            <select
                                value={form.data.factory_id}
                                onChange={(e) => handleFactoryChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="">None / External Buyer</option>
                                {factories.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.code} — {f.name} ({f.area || 'N/A'})
                                    </option>
                                ))}
                            </select>
                            {form.errors.factory_id && <p className="text-rose-500 text-[11px] mt-1">{form.errors.factory_id}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Posted By User (Defaults to You)</label>
                            <select
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="">Current Admin Account</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.phone}) — {u.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Fabric Type *</label>
                            <input
                                type="text"
                                required
                                value={form.data.fabric_type}
                                onChange={(e) => form.setData('fabric_type', e.target.value)}
                                placeholder="e.g. Single Jersey, Fleece, Rib 1x1, Interlock"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                            {form.errors.fabric_type && <p className="text-rose-500 text-[11px] mt-1">{form.errors.fabric_type}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Yarn Count</label>
                            <input
                                type="text"
                                value={form.data.yarn_count}
                                onChange={(e) => form.setData('yarn_count', e.target.value)}
                                placeholder="e.g. 26s Combed, 30/1 Cotton"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block font-semibold mb-1">GSM</label>
                                <input
                                    type="text"
                                    value={form.data.gsm}
                                    onChange={(e) => form.setData('gsm', e.target.value)}
                                    placeholder="160"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Dia (in)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={form.data.dia}
                                    onChange={(e) => form.setData('dia', e.target.value)}
                                    placeholder="34"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Gauge (GG)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={form.data.gauge}
                                    onChange={(e) => form.setData('gauge', e.target.value)}
                                    placeholder="24"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-semibold mb-1">Quantity (kg) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={form.data.quantity_kg}
                                    onChange={(e) => form.setData('quantity_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.quantity_kg && <p className="text-rose-500 text-[11px] mt-1">{form.errors.quantity_kg}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Target Rate (৳/kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={form.data.target_rate_tk}
                                    onChange={(e) => form.setData('target_rate_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Location / Hub</label>
                            <input
                                type="text"
                                value={form.data.location}
                                onChange={(e) => form.setData('location', e.target.value)}
                                placeholder="e.g. Gazipur, Narayanganj, Ashulia"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Delivery Deadline</label>
                            <input
                                type="date"
                                value={form.data.delivery_deadline}
                                onChange={(e) => form.setData('delivery_deadline', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Description / Special Notes</label>
                            <textarea
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Quality standards, shrinkage expectations, delivery schedule..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>

                    {form.data.post_type === 'work_offer' && (
                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.data.notify_matches}
                                onChange={(e) => form.setData('notify_matches', e.target.checked)}
                                className="mt-0.5"
                            />
                            <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                    <Bell className="w-3.5 h-3.5" /> Email Matching Factories Immediately
                                </p>
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                                    Matches against factories with compatible Dia, Gauge, or Broadcast-Free machines and emails active owners.
                                </p>
                            </div>
                        </label>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <Link
                            href={route('admin.posts.index')}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" /> Publish Post
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
