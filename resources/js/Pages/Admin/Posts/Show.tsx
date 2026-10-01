import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Flame,
    Layers,
    MapPin,
    Package,
    Phone,
    Mail,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Trash2,
    Eye,
    Cpu,
    Sparkles,
    Gauge,
    Hash,
    Tag,
    Zap,
    Download,
    Check,
    X,
    MessageSquare,
    TrendingDown,
    Activity,
    Maximize2
} from 'lucide-react';
import { SubcontractPost, Quotation } from '@/types';

interface Props {
    post: SubcontractPost;
}

export default function Show({ post }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const factory = post.factory;
    const authorUser = post.user;
    const specs = post.specs as Record<string, any> | null;
    const quotations = post.quotations || [];

    // Calculate commercial estimates
    const targetQuantity = Number(post.target_quantity) || 0;
    const targetRate = post.target_rate ? Number(post.target_rate) : null;
    const totalEstimatedValue = targetRate ? targetQuantity * targetRate : null;

    // Deadline countdown calculations
    const deadlineDate = post.deadline ? new Date(post.deadline) : null;
    const today = new Date();
    const daysRemaining = deadlineDate
        ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Quotation analytics
    const validQuotes = quotations.filter((q) => Number(q.offered_unit_price) > 0);
    const lowestBid = validQuotes.length > 0
        ? Math.min(...validQuotes.map((q) => Number(q.offered_unit_price)))
        : null;
    const fastestLeadDays = quotations.filter((q) => q.offered_lead_days > 0).length > 0
        ? Math.min(...quotations.map((q) => q.offered_lead_days))
        : null;

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === post.status) return;
        if (confirm(`Are you sure you want to change order status to "${newStatus.replace('_', ' ').toUpperCase()}"?`)) {
            setStatusUpdating(true);
            router.post(
                route('admin.posts.status', post.id),
                { status: newStatus },
                {
                    preserveScroll: true,
                    onFinish: () => setStatusUpdating(false),
                }
            );
        }
    };

    const handleDelete = () => {
        if (confirm(`Warning: Are you sure you want to completely delete the subcontract order "${post.title}"? This action cannot be undone.`)) {
            router.delete(route('admin.posts.destroy', post.id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live on Marketplace (Open)
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        <Activity className="w-3.5 h-3.5" />
                        In Production (Awarded)
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed & Delivered
                    </span>
                );
            case 'closed':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Closed / Inactive
                    </span>
                );
        }
    };

    const formatSpecValue = (key: string, val: any) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        const str = String(val);
        if (key.toLowerCase().includes('capacity') && !isNaN(Number(str))) {
            return `${Number(str).toLocaleString()} kg/day`;
        }
        return str;
    };

    return (
        <AdminLayout title={`Order #${post.id} Details`}>
            <Head title={`Subcontract Order #${post.id} - ${post.title} - Shilposetu Admin`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Top Action Bar & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.posts.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Orders</span>
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>/</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Order #SUB-{post.id.toString().padStart(5, '0')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Live Marketplace link */}
                        <a
                            href={`/feed/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                            title="Open live post on user-facing feed"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View on Marketplace Feed</span>
                        </a>

                        {/* Status Switcher Dropdown */}
                        <div className="relative inline-flex items-center">
                            <select
                                value={post.status}
                                disabled={statusUpdating}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                            >
                                <option value="open">Status: Open (Live)</option>
                                <option value="in_progress">Status: In Progress</option>
                                <option value="completed">Status: Completed</option>
                                <option value="closed">Status: Closed / Inactive</option>
                            </select>
                        </div>

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Order</span>
                        </button>
                    </div>
                </div>

                {/* Hero Header Card */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[11px] font-extrabold uppercase bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-500/20">
                                    {post.category}
                                </span>

                                {post.is_urgent && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full border border-rose-500/30 animate-pulse">
                                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                                        Urgent Order
                                    </span>
                                )}

                                {getStatusBadge(post.status)}
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>Posted {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-slate-400" />
                                    <span>{post.views_count || 0} Marketplace Views</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {quotations.length} Quotation{quotations.length === 1 ? '' : 's'} Received
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{post.district}, Bangladesh</span>
                                </div>
                            </div>
                        </div>

                        {/* Author Factory Mini Snippet */}
                        {factory && (
                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 lg:w-72 shrink-0 space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Issued By Factory
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                                        {factory.logo ? (
                                            <img src={factory.logo} alt={factory.business_name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            factory.business_name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
                                            <span>{factory.business_name}</span>
                                            {factory.is_verified && (
                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                            {factory.district} • {factory.total_machines || 0} Machines
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.factories.show', factory.user_id || post.user_id)}
                                    className="block text-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                                >
                                    View Full Factory KYC →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4 Commercial Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Metric 1: Quantity */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Volume</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                {targetQuantity.toLocaleString()} <span className="text-sm font-semibold text-slate-500">{post.unit}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">Required production batch</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Metric 2: Unit Rate */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Unit Rate</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                {targetRate ? `৳ ${targetRate.toFixed(2)}` : 'Negotiable'}
                                {targetRate && <span className="text-xs font-semibold text-slate-500"> / {post.unit}</span>}
                            </div>
                            <span className={`text-[11px] font-semibold ${post.rate_negotiable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {post.rate_negotiable ? 'Negotiable pricing' : 'Strict fixed rate'}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Metric 3: Estimated Budget */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estimated Value</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                {totalEstimatedValue ? `৳ ${totalEstimatedValue.toLocaleString()}` : 'Determined by Bids'}
                            </div>
                            <span className="text-[11px] text-slate-400">Total subcontract value</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Metric 4: Deadline */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivery Deadline</span>
                            <div className="text-base font-black text-slate-900 dark:text-white">
                                {deadlineDate ? deadlineDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible Timeline'}
                            </div>
                            {daysRemaining !== null ? (
                                <span className={`text-[11px] font-bold ${daysRemaining < 0 ? 'text-rose-500' : daysRemaining <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {daysRemaining < 0 ? `Passed ${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days remaining`}
                                </span>
                            ) : (
                                <span className="text-[11px] text-slate-400">No strict deadline</span>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Main Content Layout: 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Specs, Work Scope, Images, Quotations */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section A: Machinery & Technical Specifications */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Machinery & Technical Specifications
                                    </h2>
                                </div>
                                <span className="text-xs font-semibold text-slate-400">Machine matching criteria</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Machine Gauge */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Gauge className="w-3.5 h-3.5 text-blue-500" />
                                        <span>Machine Gauge</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {specs?.gauge || specs?.gauge_dia || 'Standard / Unspecified'}
                                    </div>
                                </div>

                                {/* Cylinder Diameter */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Cylinder Diameter</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {specs?.dia || specs?.cylinder_diameter || 'Standard / Open'}
                                    </div>
                                </div>

                                {/* Yarn Count */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                        <span>Yarn Count</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {specs?.yarn_count || 'As per yarn spec'}
                                    </div>
                                </div>

                                {/* Yarn Composition */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Composition / Blend</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {specs?.yarn_composition || specs?.composition || '100% Cotton / Mixed'}
                                    </div>
                                </div>

                                {/* Fabric GSM */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Hash className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Fabric GSM</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {specs?.gsm || specs?.fabric_gsm || 'As per tech pack'}
                                    </div>
                                </div>

                                {/* Machine Attachments */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                                        <Zap className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Attachments / Features</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                        {specs?.attachments || specs?.machine_type || 'Standard circular'}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Custom Specs (if present) */}
                            {specs && Object.keys(specs).filter(k => !['gauge', 'gauge_dia', 'dia', 'cylinder_diameter', 'yarn_count', 'yarn_composition', 'composition', 'gsm', 'fabric_gsm', 'attachments', 'machine_type'].includes(k)).length > 0 && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Additional Parameters:</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                        {Object.entries(specs)
                                            .filter(([k]) => !['gauge', 'gauge_dia', 'dia', 'cylinder_diameter', 'yarn_count', 'yarn_composition', 'composition', 'gsm', 'fabric_gsm', 'attachments', 'machine_type'].includes(k))
                                            .map(([key, val]) => (
                                                <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{formatSpecValue(key, val)}</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section B: Detailed Description & Quality Terms */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Order Scope, Description & Quality Terms
                                    </h2>
                                </div>
                            </div>

                            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/60 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                {post.description || 'No detailed description provided by author.'}
                            </div>
                        </div>

                        {/* Section C: Tech Pack Files & Images Gallery */}
                        {(post.tech_pack_file || (post.product_images && post.product_images.length > 0)) && (
                            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Tech Pack & Sample Attachments
                                    </h2>
                                </div>

                                {post.tech_pack_file && (
                                    <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Technical Spec Sheet / Tech Pack
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Attached by order poster
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={post.tech_pack_file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                )}

                                {post.product_images && post.product_images.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Sample & Fabric Images ({post.product_images.length})
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {post.product_images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedImage(img)}
                                                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Sample ${idx + 1}`}
                                                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                        <Maximize2 className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section D: Received Quotations & Bids */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Marketplace Bids & Quotations Received
                                        </h2>
                                        <p className="text-[11px] text-slate-400">
                                            Submitted proposals by partner manufacturing units
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Total: {quotations.length} {quotations.length === 1 ? 'Bid' : 'Bids'}
                                </span>
                            </div>

                            {/* Quotations summary strip if bids exist */}
                            {quotations.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Budget Rate</span>
                                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {targetRate ? `৳ ${targetRate} / ${post.unit}` : 'Negotiable'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Lowest Bid Offered</span>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                            {lowestBid ? (
                                                <>
                                                    <TrendingDown className="w-3.5 h-3.5" />
                                                    <span>৳ {lowestBid.toFixed(2)} / {post.unit}</span>
                                                </>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Fastest Lead Time</span>
                                        <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                            {fastestLeadDays ? `${fastestLeadDays} Days` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quotations List */}
                            {quotations.length === 0 ? (
                                <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                                        No partner factories have submitted bids yet.
                                    </span>
                                    <span className="text-[11px] text-slate-400 max-w-sm">
                                        This order is currently visible on the live feed. Quotations will appear here as soon as factories submit proposals.
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {quotations.map((quote: Quotation) => (
                                        <div
                                            key={quote.id}
                                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                                                        <Building2 className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{quote.bidder_factory?.business_name || quote.bidder_user?.name}</span>
                                                            {quote.bidder_factory?.is_verified && (
                                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                            <span>{quote.bidder_factory?.district || 'Bangladesh'}</span>
                                                            <span>•</span>
                                                            <span>Submitted {new Date(quote.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                                        quote.status === 'accepted'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                            : quote.status === 'rejected'
                                                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                                    }`}>
                                                        {quote.status}
                                                    </span>

                                                    {quote.bidder_factory && (
                                                        <Link
                                                            href={route('admin.factories.show', quote.bidder_factory.user_id || quote.bidder_user_id)}
                                                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                                                        >
                                                            View Factory →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bid terms comparison */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-[10px] text-slate-400">Offered Rate</span>
                                                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                        ৳ {Number(quote.offered_unit_price).toFixed(2)} / {post.unit}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] text-slate-400">Production Lead</span>
                                                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                        {quote.offered_lead_days} Days
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] text-slate-400">Offered Total</span>
                                                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                        {quote.offered_total_cost ? `৳ ${Number(quote.offered_total_cost).toLocaleString()}` : 'N/A'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] text-slate-400">Bidder Phone</span>
                                                    <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                                                        {quote.bidder_user?.phone || quote.bidder_factory?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Note / Proposal terms */}
                                            {quote.note && (
                                                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">Proposal Note: </span>
                                                    <span>{quote.note}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (1 Col): Factory & Moderation Sidebar */}
                    <div className="space-y-6">
                        {/* Card 1: Author Factory Identity */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Publishing Factory
                                </h3>
                                {factory?.is_verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        <Check className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0">
                                        {factory?.logo ? (
                                            <img src={factory.logo} alt={factory.business_name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            (factory?.business_name || authorUser?.name || 'F').substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {factory?.business_name || authorUser?.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {factory?.industry_type || 'Industrial Plant'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Contact Person:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {factory?.contact_person || authorUser?.name || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Phone:</span>
                                        <a
                                            href={`tel:${factory?.phone || authorUser?.phone}`}
                                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <Phone className="w-3 h-3" />
                                            <span>{factory?.phone || authorUser?.phone || 'N/A'}</span>
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Email:</span>
                                        <a
                                            href={`mailto:${factory?.email || authorUser?.email}`}
                                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                                        >
                                            <Mail className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{factory?.email || authorUser?.email || 'N/A'}</span>
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Total Machinery:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {factory?.total_machines || 0} Sets Installed
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Daily Capacity:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {factory?.daily_capacity || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {factory && (
                                    <Link
                                        href={route('admin.factories.show', factory.user_id || post.user_id)}
                                        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition"
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>View Complete Factory KYC</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Card 2: Plant Location & Logistics */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Delivery & Location
                                </h3>
                                <MapPin className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                <div>
                                    <span className="text-slate-400 text-[11px] block">Industrial District:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{post.district}, Bangladesh</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 text-[11px] block">Delivery / Mill Address:</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {post.address || factory?.address || 'Not specified'}
                                    </span>
                                </div>

                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((post.address || '') + ' ' + post.district + ' Bangladesh')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Search location on Google Maps</span>
                                </a>
                            </div>
                        </div>

                        {/* Card 3: System Timestamps & Moderation Info */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Order Metadata
                            </h3>

                            <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                                <div className="flex items-center justify-between">
                                    <span>System ID:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{post.id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Marketplace Type:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{post.post_type}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Created At:</span>
                                    <span>{new Date(post.created_at).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Last Updated:</span>
                                    <span>{new Date(post.updated_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Sample Full"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
