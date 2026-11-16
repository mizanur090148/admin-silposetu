import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Building2,
    Cpu,
    Users,
    Briefcase,
    Radio,
    PackageCheck,
    FileSpreadsheet,
    Store,
    Handshake,
    Megaphone,
    UserSearch,
    ArrowRight,
    ClipboardList,
} from 'lucide-react';
import { Factory, FreeMachineRequest, SubcontractPost, SupplierRfq } from '@/types';
import { ROLE_META } from '@/utils/labels';

interface DashboardStats {
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    total_factories: number;
    qr_enabled_factories: number;
    configured_machines: number;
    total_machines: number;
    idle_machines: number;
    running_machines: number;
    down_machines: number;
    broadcast_free_machines: number;
    total_daily_capacity_kg: number;
    total_posts: number;
    open_posts: number;
    work_offer_posts: number;
    machine_available_posts: number;
    total_quotations: number;
    pending_quotations: number;
    total_machine_requests: number;
    new_machine_requests: number;
    total_suppliers: number;
    verified_suppliers: number;
    total_rfqs: number;
    new_rfqs: number;
    total_vendors: number;
    verified_vendors: number;
    total_partners: number;
    total_partner_commission_tk: number;
    total_ads: number;
    pending_ads: number;
    active_ads: number;
    total_jobs: number;
    total_job_applications: number;
    active_orders: number;
    total_orders: number;
    estimated_mrr_tk: number;
    expiring_trials: number;
    over_quota_factories: number;
    plan_distribution: Record<string, number>;
    total_knitted_kg: number;
    total_qc_inspections: number;
    pending_qc_signs: number;
    total_challans: number;
    unread_threads: number;
    total_billed_tk: number;
    total_collected_tk: number;
    total_expenses_tk: number;
}

interface Props {
    stats: DashboardStats;
    recentFactories: Factory[];
    recentPosts: SubcontractPost[];
    recentMachineRequests: FreeMachineRequest[];
    recentRfqs: SupplierRfq[];
}

export default function Dashboard({
    stats,
    recentFactories,
    recentPosts,
    recentMachineRequests,
    recentRfqs,
}: Props) {
    const kpiCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            sub: `${stats.active_users} active accounts`,
            icon: Users,
            tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400',
            href: route('admin.users.index'),
        },
        {
            title: 'Factories',
            value: stats.total_factories,
            sub: `${stats.qr_enabled_factories} QR enabled · ${stats.configured_machines} declared MCs`,
            icon: Building2,
            tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
            href: route('admin.factories.index'),
        },
        {
            title: 'Tracked Machines',
            value: stats.total_machines,
            sub: `${stats.idle_machines} idle · ${stats.running_machines} run · ${stats.broadcast_free_machines} free broadcast`,
            icon: Cpu,
            tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
            href: route('admin.factory-machines.index'),
        },
        {
            title: 'Subcontract Posts',
            value: stats.total_posts,
            sub: `${stats.open_posts} open · ${stats.total_quotations} bids`,
            icon: Briefcase,
            tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
            href: route('admin.posts.index'),
        },
        {
            title: 'Machine Requests',
            value: stats.total_machine_requests,
            sub: `${stats.new_machine_requests} new awaiting action`,
            icon: Radio,
            tone: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400',
            href: route('admin.free-machine-requests.index'),
        },
        {
            title: 'Suppliers & RFQs',
            value: `${stats.total_suppliers} / ${stats.total_rfqs}`,
            sub: `${stats.verified_suppliers} verified · ${stats.new_rfqs} new RFQs`,
            icon: PackageCheck,
            tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-400',
            href: route('admin.suppliers.index'),
        },
        {
            title: 'Jobs & Applicants',
            value: `${stats.total_jobs} / ${stats.total_job_applications}`,
            sub: `${stats.total_ads} ads (${stats.pending_ads} pending)`,
            icon: UserSearch,
            tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
            href: route('admin.jobs.index'),
        },
        {
            title: 'Factory Orders (ERP)',
            value: stats.total_orders,
            sub: `${stats.active_orders} running · ${stats.total_knitted_kg.toLocaleString()} kg knitted`,
            icon: ClipboardList,
            tone: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
            href: route('admin.orders.index'),
        },
    ];

    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                                        <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${card.tone}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">{card.sub}</p>
                            </Link>
                        );
                    })}
                </div>

                {/* Role & Ecosystem Strip */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Users by Role</h3>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {Object.entries(stats.users_by_role).map(([roleKey, count]) => {
                                const meta = ROLE_META[roleKey] || { label: roleKey, badgeClass: 'bg-slate-100 text-slate-700' };
                                return (
                                    <div key={roleKey} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${meta.badgeClass}`}>
                                            {meta.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Machine Utilization & Capacity</h3>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40">
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.running_machines}</p>
                                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Running</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.idle_machines}</p>
                                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Idle Free</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                                <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{stats.down_machines}</p>
                                <p className="text-[10px] font-medium text-rose-600 dark:text-rose-400">Down</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.total_daily_capacity_kg.toLocaleString()}</p>
                                <p className="text-[10px] font-medium text-slate-500">kg/day</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Ecosystem Summary</h3>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Store className="w-4 h-4" /> Vendors</span>
                                <span className="font-semibold">{stats.total_vendors} ({stats.verified_vendors} verified)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Handshake className="w-4 h-4" /> Partners</span>
                                <span className="font-semibold">{stats.total_partners} (৳{stats.total_partner_commission_tk.toLocaleString()})</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Megaphone className="w-4 h-4" /> Advertisements</span>
                                <span className="font-semibold">{stats.active_ads} active / {stats.pending_ads} pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SaaS Revenue & Floor ERP Oversight Strip (from KnitKhata telemetry) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SaaS Plans & Trial Health</h3>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Est. MRR: ৳{stats.estimated_mrr_tk.toLocaleString()}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            {[
                                { k: 's', name: 'Starter', price: '৳1k' },
                                { k: 'g', name: 'Growth', price: '৳1.5k' },
                                { k: 'p', name: 'Pro', price: '৳2.5k' },
                                { k: 'e', name: 'Enterprise', price: '৳4k' },
                            ].map((tier) => (
                                <div key={tier.k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.plan_distribution?.[tier.k] ?? 0}</p>
                                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{tier.name}</p>
                                    <p className="text-[10px] text-slate-400">{tier.price}/mo</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs pt-1">
                            <Link
                                href={route('admin.factories.index')}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold"
                            >
                                {stats.expiring_trials} expiring trials (&le; 7d)
                            </Link>
                            <Link
                                href={route('admin.factories.index')}
                                className={`px-2.5 py-1 rounded-lg font-semibold ${
                                    stats.over_quota_factories > 0
                                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {stats.over_quota_factories} over machine quota
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Floor ERP & Financial Pulse</h3>
                            <Link href={route('admin.bills.index')} className="text-xs font-semibold text-blue-600 hover:underline">
                                Billing Hub
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            <Link href={route('admin.orders.index')} className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 hover:ring-1 ring-blue-400">
                                <p className="text-base font-bold text-blue-700 dark:text-blue-300">{stats.total_qc_inspections}</p>
                                <p className="text-[10px] text-slate-500">QC ({stats.pending_qc_signs} unsigned)</p>
                            </Link>
                            <Link href={route('admin.orders.index')} className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 hover:ring-1 ring-emerald-400">
                                <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">{stats.total_challans}</p>
                                <p className="text-[10px] text-slate-500">Challans</p>
                            </Link>
                            <Link href={route('admin.bills.index')} className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:ring-1 ring-indigo-400">
                                <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">৳{Math.round(stats.total_billed_tk).toLocaleString()}</p>
                                <p className="text-[10px] text-slate-500">Billed ({Math.round(stats.total_collected_tk).toLocaleString()} paid)</p>
                            </Link>
                            <Link href={route('admin.threads.index')} className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 hover:ring-1 ring-amber-400">
                                <p className="text-base font-bold text-amber-700 dark:text-amber-300">{stats.unread_threads}</p>
                                <p className="text-[10px] text-slate-500">Unread Threads</p>
                            </Link>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Recorded factory operating expenses: <span className="font-semibold text-slate-800 dark:text-slate-200">৳{stats.total_expenses_tk.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Recent Activity Tables */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Factories</h3>
                            <Link href={route('admin.factories.index')} className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentFactories.length === 0 ? (
                                <p className="p-6 text-xs text-slate-500 text-center">No factories registered yet.</p>
                            ) : (
                                recentFactories.map((factory) => (
                                    <Link
                                        key={factory.id}
                                        href={route('admin.factories.show', factory.id)}
                                        className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                                                    {factory.code}
                                                </span>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{factory.name}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {factory.area || 'No area'} · Plan: <span className="uppercase font-medium">{factory.plan_code}</span>
                                            </p>
                                        </div>
                                        <div className="text-right text-xs shrink-0 ml-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{factory.factory_machines_count ?? 0} tracked MCs</p>
                                            <p className="text-[11px] text-slate-500">{factory.subcontract_orders_count ?? 0} orders</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Subcontract Posts</h3>
                            <Link href={route('admin.posts.index')} className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentPosts.length === 0 ? (
                                <p className="p-6 text-xs text-slate-500 text-center">No subcontract posts yet.</p>
                            ) : (
                                recentPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={route('admin.posts.show', post.id)}
                                        className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                                                        post.post_type === 'work_offer'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    }`}
                                                >
                                                    {post.post_type === 'work_offer' ? 'Work Offer' : 'Machine Free'}
                                                </span>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{post.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {post.fabric_type} · {Number(post.quantity_kg).toLocaleString()} kg · {post.location || 'BD'}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs shrink-0 ml-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{post.quotations_count ?? 0} bids</p>
                                            <span className="text-[11px] uppercase font-medium text-slate-500">{post.status}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Free Machine Requests</h3>
                            <Link href={route('admin.free-machine-requests.index')} className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                Manage <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentMachineRequests.length === 0 ? (
                                <p className="p-6 text-xs text-slate-500 text-center">No machine requests yet.</p>
                            ) : (
                                recentMachineRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between px-5 py-3.5">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {req.request_no} · {req.fabrication}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {req.contact_person} ({req.party_code}) · {req.machines_needed} MCs ({req.spec_label})
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-xs font-semibold">{Number(req.qty_kg).toLocaleString()} kg</p>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Supplier RFQs</h3>
                            <Link href={route('admin.supplier-rfqs.index')} className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                Manage <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentRfqs.length === 0 ? (
                                <p className="p-6 text-xs text-slate-500 text-center">No RFQs submitted yet.</p>
                            ) : (
                                recentRfqs.map((rfq) => (
                                    <div key={rfq.id} className="flex items-center justify-between px-5 py-3.5">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {rfq.rfq_no} · {rfq.item_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {rfq.factory?.name || rfq.factory_code} · Qty: {rfq.qty_label}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{rfq.quoted_price || 'Pending Quote'}</p>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {rfq.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
