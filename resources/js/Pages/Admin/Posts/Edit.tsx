import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { FactoryRef, PostType, SubcontractPost, UserRef } from '@/types';

interface Props {
    post: SubcontractPost;
    factories: FactoryRef[];
    users: UserRef[];
}

export default function Edit({ post, factories, users }: Props) {
    const form = useForm({
        user_id: post.user_id ? String(post.user_id) : '',
        factory_id: post.factory_id ? String(post.factory_id) : '',
        post_type: post.post_type as PostType,
        title: post.title,
        fabric_type: post.fabric_type,
        gsm: post.gsm || '',
        dia: post.dia ? String(post.dia) : '',
        gauge: post.gauge ? String(post.gauge) : '',
        quantity_kg: String(post.quantity_kg),
        target_rate_tk: post.target_rate_tk !== null ? String(post.target_rate_tk) : '',
        yarn_count: post.yarn_count || '',
        location: post.location || '',
        delivery_deadline: post.delivery_deadline ? post.delivery_deadline.slice(0, 10) : '',
        description: post.description || '',
        status: post.status,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(route('admin.posts.update', post.id));
    };

    return (
        <AdminLayout title={`Edit Post: ${post.title}`}>
            <Head title={`Edit ${post.title}`} />

            <div className="max-w-4xl space-y-6">
                <Link
                    href={route('admin.posts.show', post.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Post Details
                </Link>

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
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                            {form.errors.title && <p className="text-rose-500 text-[11px] mt-1">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Factory (Optional)</label>
                            <select
                                value={form.data.factory_id}
                                onChange={(e) => form.setData('factory_id', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="">None / External Buyer</option>
                                {factories.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.code} — {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Posted By User</label>
                            <select
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="">Unchanged</option>
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
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Yarn Count</label>
                            <input
                                type="text"
                                value={form.data.yarn_count}
                                onChange={(e) => form.setData('yarn_count', e.target.value)}
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
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
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
                                <label className="block font-semibold mb-1">Gauge</label>
                                <input
                                    type="number"
                                    value={form.data.gauge}
                                    onChange={(e) => form.setData('gauge', e.target.value)}
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
                                    required
                                    value={form.data.quantity_kg}
                                    onChange={(e) => form.setData('quantity_kg', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Target Rate (৳/kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
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
                            <label className="block font-semibold mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <Link href={route('admin.posts.show', post.id)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" /> Update Post
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
