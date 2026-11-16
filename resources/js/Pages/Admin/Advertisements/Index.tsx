import React, { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Megaphone, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Advertisement, PaginatedData } from '@/types';

interface Props {
    advertisements: PaginatedData<Advertisement>;
    counts: {
        total: number;
        pending: number;
        active: number;
        paused: number;
    };
    filters: {
        search: string;
        status: string;
        placement: string;
        per_page: number;
    };
}

const AD_STATUS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    paused: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function Index({ advertisements, counts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Advertisement | null>(null);

    const form = useForm({
        org_name: '',
        placement: 'banner',
        title: '',
        description: '',
        cta_label: 'Contact Now',
        duration_label: '30 Days',
        contact_phone: '',
        status: 'pending',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.advertisements.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            org_name: '',
            placement: 'banner',
            title: '',
            description: '',
            cta_label: 'Contact Now',
            duration_label: '30 Days',
            contact_phone: '',
            status: 'pending',
        });
        setShowModal(true);
    };

    const openEdit = (ad: Advertisement) => {
        setEditing(ad);
        form.clearErrors();
        form.setData({
            org_name: ad.org_name,
            placement: ad.placement,
            title: ad.title,
            description: ad.description || '',
            cta_label: ad.cta_label,
            duration_label: ad.duration_label,
            contact_phone: ad.contact_phone || '',
            status: ad.status,
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.advertisements.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.advertisements.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const updateStatus = (adId: number, status: string) => {
        router.post(route('admin.advertisements.status', adId), { status }, { preserveScroll: true });
    };

    const handleDelete = (ad: Advertisement) => {
        if (!confirm(`Delete advertisement "${ad.title}"?`)) {
            return;
        }
        router.delete(route('admin.advertisements.destroy', ad.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Sponsored Advertisements">
            <Head title="Advertisements" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Total Ads', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Pending Review', val: counts.pending, cls: 'text-amber-600' },
                        { label: 'Active Campaigns', val: counts.active, cls: 'text-emerald-600' },
                        { label: 'Paused', val: counts.paused, cls: 'text-slate-500' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
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
                                placeholder="Search organization, ad title, description, phone..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => applyFilter({ status: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <input
                            type="text"
                            value={filters.placement === 'all' ? '' : filters.placement}
                            onChange={(e) => applyFilter({ placement: e.target.value || 'all', page: 1 })}
                            placeholder="Filter placement..."
                            list="ad-placements-filter"
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-36"
                        />
                        <datalist id="ad-placements-filter">
                            <option value="banner" />
                            <option value="home" />
                            <option value="directory" />
                            <option value="sidebar" />
                            <option value="feed" />
                        </datalist>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Advertisement
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Campaign & Organization</th>
                                    <th className="py-3 px-4">Placement & Duration</th>
                                    <th className="py-3 px-4">CTA & Contact</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {advertisements.data.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4 max-w-[300px]">
                                            <p className="font-bold text-slate-900 dark:text-white">{ad.title}</p>
                                            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{ad.org_name}</p>
                                            {ad.description && <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{ad.description}</p>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold uppercase">
                                                {ad.placement}
                                            </span>
                                            <p className="text-[11px] text-slate-500 mt-1">{ad.duration_label}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">{ad.cta_label}</p>
                                            <p className="text-[11px] text-slate-500">{ad.contact_phone || '—'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={ad.status}
                                                onChange={(e) => updateStatus(ad.id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border-0 cursor-pointer ${
                                                    AD_STATUS[ad.status] || 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                                <option value="paused">Paused</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(ad)}
                                                    title="Edit Advertisement"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(ad)}
                                                    title="Delete Advertisement"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {advertisements.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No advertisements found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={advertisements.links}
                        from={advertisements.from ?? 0}
                        to={advertisements.to ?? 0}
                        total={advertisements.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editing ? `Edit Ad: ${editing.title}` : 'Add Advertisement'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Ad Title / Headline *</label>
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
                                <label className="block font-semibold mb-1">Organization Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.org_name}
                                    onChange={(e) => form.setData('org_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.org_name && <p className="text-rose-500 text-[11px] mt-1">{form.errors.org_name}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Placement Slot *</label>
                                <input
                                    type="text"
                                    required
                                    list="ad-placements"
                                    value={form.data.placement}
                                    onChange={(e) => form.setData('placement', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="ad-placements">
                                    <option value="banner" />
                                    <option value="home" />
                                    <option value="directory" />
                                    <option value="sidebar" />
                                    <option value="feed" />
                                </datalist>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">CTA Label *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.cta_label}
                                    onChange={(e) => form.setData('cta_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Duration Label *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.duration_label}
                                    onChange={(e) => form.setData('duration_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={form.data.contact_phone}
                                    onChange={(e) => form.setData('contact_phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Description</label>
                                <input
                                    type="text"
                                    maxLength={255}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {editing ? 'Update Ad' : 'Create Ad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
