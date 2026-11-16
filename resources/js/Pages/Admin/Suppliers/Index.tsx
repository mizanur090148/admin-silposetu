import React, { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Award, CheckCircle2, PackageSearch, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { PaginatedData, Supplier, UserRef } from '@/types';
import { SUPPLIER_CATEGORY_LABELS } from '@/utils/labels';

interface Props {
    suppliers: PaginatedData<Supplier>;
    counts: {
        total: number;
        verified: number;
        sponsored: number;
    };
    users: UserRef[];
    filters: {
        search: string;
        category: string;
        is_verified: string;
        is_sponsored: string;
        per_page: number;
    };
}

export default function Index({ suppliers, counts, users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);

    const form = useForm({
        user_id: '',
        name: '',
        category: 'mc',
        also_categories: '',
        area: '',
        rating: '4.6',
        reviews_count: '20',
        description: '',
        is_sponsored: false,
        is_verified: true,
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.suppliers.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: '',
            name: '',
            category: 'mc',
            also_categories: '',
            area: '',
            rating: '4.6',
            reviews_count: '20',
            description: '',
            is_sponsored: false,
            is_verified: true,
        });
        setShowModal(true);
    };

    const openEdit = (s: Supplier) => {
        setEditing(s);
        form.clearErrors();
        form.setData({
            user_id: s.user_id ? String(s.user_id) : '',
            name: s.name,
            category: s.category,
            also_categories: Array.isArray(s.also_categories_json) ? s.also_categories_json.join(', ') : '',
            area: s.area,
            rating: String(s.rating ?? 0),
            reviews_count: String(s.reviews_count ?? 0),
            description: s.description,
            is_sponsored: s.is_sponsored,
            is_verified: s.is_verified,
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.suppliers.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.suppliers.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (s: Supplier) => {
        if (!confirm(`Delete supplier "${s.name}"? Linked users will have supplier_id cleared.`)) {
            return;
        }
        router.delete(route('admin.suppliers.destroy', s.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Machinery & Parts Suppliers">
            <Head title="Suppliers" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    {[
                        { label: 'Total Suppliers', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Verified', val: counts.verified, cls: 'text-emerald-600' },
                        { label: 'Sponsored', val: counts.sponsored, cls: 'text-amber-600' },
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
                                placeholder="Search supplier name, area, description..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.category}
                            onChange={(e) => applyFilter({ category: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Categories</option>
                            {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v} ({k})
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.is_verified}
                            onChange={(e) => applyFilter({ is_verified: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">Any Verification</option>
                            <option value="1">Verified</option>
                            <option value="0">Unverified</option>
                        </select>
                        <select
                            value={filters.is_sponsored}
                            onChange={(e) => applyFilter({ is_sponsored: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Tiers</option>
                            <option value="1">Sponsored</option>
                            <option value="0">Standard</option>
                        </select>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Supplier
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Supplier & Area</th>
                                    <th className="py-3 px-4">Categories</th>
                                    <th className="py-3 px-4">Linked User</th>
                                    <th className="py-3 px-4">Rating</th>
                                    <th className="py-3 px-4">Badges</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {suppliers.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4 max-w-[280px]">
                                            <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                                            <p className="text-[11px] text-slate-500">{s.area}</p>
                                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.description}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                {SUPPLIER_CATEGORY_LABELS[s.category] || s.category}
                                            </span>
                                            {s.also_categories_json && s.also_categories_json.length > 0 && (
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    + {s.also_categories_json.join(', ')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {s.user ? (
                                                <div>
                                                    <p className="font-semibold">{s.user.name}</p>
                                                    <p className="text-[11px] text-slate-500">{s.user.phone}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Directory Only</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1 font-semibold">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                {s.rating}
                                            </span>
                                            <span className="text-[11px] text-slate-400 ml-1">({s.reviews_count})</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(route('admin.suppliers.toggleVerified', s.id), {}, { preserveScroll: true })}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        s.is_verified
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {s.is_verified ? 'Verified' : 'Unverified'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(route('admin.suppliers.toggleSponsored', s.id), {}, { preserveScroll: true })}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        s.is_sponsored
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <Award className="w-3 h-3" />
                                                    {s.is_sponsored ? 'Sponsored' : 'Standard'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(s)}
                                                    title="Edit Supplier"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(s)}
                                                    title="Delete Supplier"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {suppliers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <PackageSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No suppliers found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={suppliers.links}
                        from={suppliers.from ?? 0}
                        to={suppliers.to ?? 0}
                        total={suppliers.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editing ? `Edit Supplier: ${editing.name}` : 'Add Supplier'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Supplier Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.name && <p className="text-rose-500 text-[11px] mt-1">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Primary Category *</label>
                                <select
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v} ({k})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Area *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.area}
                                    onChange={(e) => form.setData('area', e.target.value)}
                                    placeholder="e.g. Narayanganj, Gazipur"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.area && <p className="text-rose-500 text-[11px] mt-1">{form.errors.area}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Additional Categories (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.data.also_categories}
                                    onChange={(e) => form.setData('also_categories', e.target.value)}
                                    placeholder="e.g. spare, oil"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Linked User Account</label>
                                <select
                                    value={form.data.user_id}
                                    onChange={(e) => form.setData('user_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None (Directory Listing)</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.phone}) — {u.role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Rating (0 - 5)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={5}
                                    value={form.data.rating}
                                    onChange={(e) => form.setData('rating', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Reviews Count</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.reviews_count}
                                    onChange={(e) => form.setData('reviews_count', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Description *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={255}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Products & brands supplied (max 255 chars)"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.description && <p className="text-rose-500 text-[11px] mt-1">{form.errors.description}</p>}
                            </div>

                            <div className="sm:col-span-2 flex gap-5 pt-1">
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_verified}
                                        onChange={(e) => form.setData('is_verified', e.target.checked)}
                                    />
                                    Verified Supplier
                                </label>
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_sponsored}
                                        onChange={(e) => form.setData('is_sponsored', e.target.checked)}
                                    />
                                    Sponsored Placement
                                </label>
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
                                    {editing ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
