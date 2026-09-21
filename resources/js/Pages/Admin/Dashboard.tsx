import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    Factory,
    FileText,
    Users,
    ShieldAlert,
    CheckCircle2,
    ArrowUpRight,
    MapPin,
    CheckCircle,
    Phone,
} from 'lucide-react';

interface Props {
    stats: {
        pending_factories: number;
        active_factories: number;
        suspended_users: number;
        total_posts: number;
        total_quotations: number;
        total_users: number;
    };
    recentPending: Array<any>;
    recentPosts: Array<any>;
}

export default function Dashboard({ stats, recentPending, recentPosts }: Props) {
    const handleQuickApprove = (userId: number, name: string) => {
        if (confirm(`Are you sure you want to approve factory account '${name}'?`)) {
            router.post(route('admin.factories.approve', userId));
        }
    };

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard - Shilposetu" />

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-black text-white">Admin Control Center</h1>
                        <span className="text-[11px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                            Live System
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Verify factory registrations, review company KYC details, and monitor industrial subcontract orders.
                    </p>
                </div>

                {stats.pending_factories > 0 ? (
                    <Link
                        href={route('admin.factories.index') + '?tab=pending'}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
                    >
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>{stats.pending_factories} Factories Pending Review</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3.5 py-2 rounded-xl text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All Factories Verified</span>
                    </div>
                )}
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Pending Approvals */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Pending Approvals</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats.pending_factories}</span>
                        <span className="text-[11px] text-amber-400 font-semibold">Requires Action</span>
                    </div>
                    <Link
                        href={route('admin.factories.index') + '?tab=pending'}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                    >
                        View Pending List <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Card 2: Active Verified Factories */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Active Factories</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Factory className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats.active_factories}</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">Verified</span>
                    </div>
                    <Link
                        href={route('admin.factories.index') + '?tab=active'}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                    >
                        View All Factories <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Card 3: Total Subcontract Posts */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Subcontract Orders</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats.total_posts}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({stats.total_quotations} Bids)</span>
                    </div>
                    <Link
                        href={route('admin.posts.index')}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                    >
                        Moderate Posts <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Card 4: Suspended Users */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Suspended Users</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats.suspended_users}</span>
                        <span className="text-[11px] text-rose-400 font-semibold">Blocked</span>
                    </div>
                    <Link
                        href={route('admin.users.index') + '?status=suspended'}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                    >
                        Blocked List <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                        <h2 className="text-base font-bold text-white">Pending Factory Verifications</h2>
                    </div>
                    <Link
                        href={route('admin.factories.index') + '?tab=pending'}
                        className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                        View All ({stats.pending_factories}) <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentPending.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                        <span>No pending factory applications. All registrations are verified!</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-3">Factory & Owner</th>
                                    <th className="py-3 px-3">Customer ID</th>
                                    <th className="py-3 px-3">Location</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentPending.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-3">
                                            <div className="font-bold text-slate-100">
                                                {item.factory?.business_name || item.name}
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                <span>Owner: {item.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-500" />
                                                    {item.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 font-mono font-bold text-blue-400">
                                            {item.customer_id || `S${item.id}`}
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{item.factory?.district || 'Gazipur'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                <Clock className="w-3 h-3" />
                                                Pending Review
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right space-x-2">
                                            <Link
                                                href={route('admin.factories.show', item.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                                            >
                                                Review
                                            </Link>
                                            <button
                                                onClick={() => handleQuickApprove(item.id, item.name)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition cursor-pointer"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Subcontract Posts */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white">Recent Subcontract Orders</h2>
                    <Link href={route('admin.posts.index')} className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                        View All Posts <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentPosts.map((post) => (
                        <div key={post.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                    {post.category}
                                </span>
                                <h3 className="text-xs font-bold text-white line-clamp-1">{post.title}</h3>
                                <p className="text-[11px] text-slate-400">
                                    Posted by: {post.factory?.business_name || post.user?.name} ({post.district})
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {post.target_quantity?.toLocaleString()} {post.unit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
