import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FileText, Search, Trash2, MapPin, Calendar, Building2 } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { PaginatedData } from '@/types';

interface Props {
    posts: PaginatedData<any>;
    filters: {
        search: string;
        status: string;
        per_page?: number;
    };
    totalPosts: number;
}

export default function Index({ posts, filters, totalPosts }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.posts.index'), {
            ...filters,
            search,
            page: 1,
        }, { preserveState: true });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(route('admin.posts.index'), {
            ...filters,
            per_page: perPage,
            page: 1,
        }, { preserveState: true });
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Warning: Are you sure you want to delete the subcontract post '${title}'?`)) {
            router.delete(route('admin.posts.destroy', id));
        }
    };

    return (
        <AdminLayout title="Subcontract Orders">
            <Head title="Subcontract Order Moderation - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Subcontract Order Moderation</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Monitor all marketplace subcontract orders and prevent spam. (Total: {totalPosts})
                        </p>
                    </div>
                </div>

                {/* Search Toolbar */}
                <div className="flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or district..."
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm transition"
                        />
                    </form>
                </div>

                {/* Posts Table */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
                    {posts.data.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                            <span>No subcontract orders found.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3.5 px-4">Order Title</th>
                                        <th className="py-3.5 px-3">Category</th>
                                        <th className="py-3.5 px-3">Factory</th>
                                        <th className="py-3.5 px-3">Target Quantity</th>
                                        <th className="py-3.5 px-3">Date</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{post.title}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                    <span>{post.district}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 dark:border-blue-500/30">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                                <div className="font-semibold">{post.factory?.business_name || post.user?.name}</div>
                                                <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{post.user?.customer_id}</div>
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                                {post.target_quantity?.toLocaleString()} {post.unit}
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Server-Side Pagination */}
                    <Pagination
                        links={posts.links}
                        from={posts.from}
                        to={posts.to}
                        total={posts.total}
                        perPage={filters.per_page || posts.per_page}
                        onPerPageChange={handlePerPageChange}
                        itemName="subcontract orders"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
