import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { ClipboardList, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { FactoryRef, PaginatedData, SubcontractPost } from '@/types';
import { formatDeadline } from '@/utils/date';

interface Props {
    posts: PaginatedData<SubcontractPost>;
    counts: {
        total: number;
        open: number;
        work_offer: number;
        machine_available: number;
    };
    factories: FactoryRef[];
    filters: {
        search: string;
        post_type: string;
        status: string;
        factory_id: string;
        per_page: number;
    };
}

const STATUS_BADGE: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    awarded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    closed: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function Index({ posts, counts, factories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.posts.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (postId: number, status: string) => {
        router.post(route('admin.posts.status', postId), { status }, { preserveScroll: true });
    };

    const handleDelete = (post: SubcontractPost) => {
        if (!confirm(`Delete subcontract post "${post.title}" and all its quotations?`)) {
            return;
        }
        router.delete(route('admin.posts.destroy', post.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Subcontract Marketplace">
            <Head title="Subcontract Posts" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Total Posts', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Open Posts', val: counts.open, cls: 'text-emerald-600' },
                        { label: 'Work Offers', val: counts.work_offer, cls: 'text-blue-600' },
                        { label: 'Machine Available', val: counts.machine_available, cls: 'text-amber-600' },
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
                                placeholder="Search title, fabric, yarn count, location, factory..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.post_type}
                            onChange={(e) => applyFilter({ post_type: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Post Types</option>
                            <option value="work_offer">Work Offer</option>
                            <option value="machine_available">Machine Available</option>
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => applyFilter({ status: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="awarded">Awarded</option>
                            <option value="closed">Closed</option>
                            <option value="cancelled">Cancelled</option>
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
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>

                    <Link
                        href={route('admin.posts.create')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Post
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Post & Type</th>
                                    <th className="py-3 px-4">Fabric & Specs</th>
                                    <th className="py-3 px-4">Quantity & Rate</th>
                                    <th className="py-3 px-4">Factory / Poster</th>
                                    <th className="py-3 px-4">Deadline</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {posts.data.map((post) => (
                                    <tr key={post.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4 max-w-[260px]">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        post.post_type === 'work_offer'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {post.post_type === 'work_offer' ? 'Work Offer' : 'Machine Free'}
                                                </span>
                                                <span className="text-[11px] text-slate-400">{post.quotations_count ?? 0} quotes</span>
                                            </div>
                                            <Link
                                                href={route('admin.posts.show', post.id)}
                                                className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 line-clamp-2"
                                            >
                                                {post.title}
                                            </Link>
                                            {post.location && <p className="text-[11px] text-slate-500 mt-0.5">{post.location}</p>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{post.fabric_type}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {[
                                                    post.gsm ? `GSM ${post.gsm}` : null,
                                                    post.dia ? `Dia ${post.dia}"` : null,
                                                    post.gauge ? `GG ${post.gauge}` : null,
                                                    post.yarn_count ? `Yarn ${post.yarn_count}` : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') || '—'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {Number(post.quantity_kg).toLocaleString()} kg
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {post.target_rate_tk ? `৳${post.target_rate_tk}/kg` : 'Negotiable'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {post.factory ? (
                                                <Link
                                                    href={route('admin.factories.show', post.factory.id)}
                                                    className="font-semibold text-blue-600 hover:underline block"
                                                >
                                                    {post.factory.code} — {post.factory.name}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400">No factory</span>
                                            )}
                                            {post.user && (
                                                <p className="text-[11px] text-slate-500">
                                                    {post.user.name} ({post.user.phone})
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                            {post.delivery_deadline ? formatDeadline(post.delivery_deadline) : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={post.status}
                                                onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border-0 cursor-pointer ${
                                                    STATUS_BADGE[post.status] || 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <option value="open">Open</option>
                                                <option value="awarded">Awarded</option>
                                                <option value="closed">Closed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('admin.posts.show', post.id)}
                                                    title="View Details & Quotations"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(post)}
                                                    title="Delete Post"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {posts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No subcontract posts found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={posts.links}
                        from={posts.from ?? 0}
                        to={posts.to ?? 0}
                        total={posts.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
