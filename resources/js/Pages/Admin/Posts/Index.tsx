import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FileText, Search, Trash2, MapPin, Calendar, Building2 } from 'lucide-react';

interface Props {
    posts: {
        data: Array<any>;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    filters: {
        search: string;
        status: string;
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
        }, { preserveState: true });
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`সতর্কতা: আপনি কি নিশ্চিত যে সাব-কন্ট্রাক্ট পোস্ট '${title}' মুছে ফেলতে চান?`)) {
            router.delete(route('admin.posts.destroy', id));
        }
    };

    return (
        <AdminLayout title="সাব-কন্ট্রাক্ট পোস্টসমূহ">
            <Head title="সাব-কন্ট্রাক্ট পোস্ট ম্যানেজমেন্ট - শিল্পসেতু অ্যাডমিন" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-white">সাব-কন্ট্রাক্ট অর্ডার পোস্ট মডারেশন</h1>
                        <p className="text-xs text-slate-400">
                            মার্কেটপ্লেসে প্রকাশিত সকল সাব-কন্ট্রাক্ট অর্ডার পর্যবেক্ষণ এবং স্প্যাম প্রতিরোধ করুন। (মোট {totalPosts}টি)
                        </p>
                    </div>
                </div>

                {/* Search Toolbar */}
                <div className="flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="পোস্টের শিরোনাম বা জেলা দিয়ে খুঁজুন..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </form>
                </div>

                {/* Posts Table */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                    {posts.data.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                            <FileText className="w-10 h-10 text-slate-700" />
                            <span>কোনো সাব-কন্ট্রাক্ট পোস্ট পাওয়া যায়নি।</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3.5 px-4">অর্ডারের শিরোনাম</th>
                                        <th className="py-3.5 px-3">ক্যাটাগরি</th>
                                        <th className="py-3.5 px-3">পোস্টকারী ফ্যাক্টরি</th>
                                        <th className="py-3.5 px-3">পরিমাণ (Target)</th>
                                        <th className="py-3.5 px-3">তারিখ</th>
                                        <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <div className="font-bold text-white text-xs line-clamp-1">{post.title}</div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-slate-500" />
                                                    <span>{post.district}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-300">
                                                <div className="font-semibold">{post.factory?.business_name || post.user?.name}</div>
                                                <div className="font-mono text-[10px] text-slate-500">{post.user?.customer_id}</div>
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-slate-200">
                                                {post.target_quantity?.toLocaleString()} {post.unit}
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>ডিলিট</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.last_page > 1 && (
                        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                            <div>
                                পৃষ্ঠা {posts.current_page} এর {posts.last_page} (মোট {posts.total}টি)
                            </div>
                            <div className="flex gap-2">
                                {posts.prev_page_url && (
                                    <Link href={posts.prev_page_url} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium">
                                        আগেরটি
                                    </Link>
                                )}
                                {posts.next_page_url && (
                                    <Link href={posts.next_page_url} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
                                        পরেরটি
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
