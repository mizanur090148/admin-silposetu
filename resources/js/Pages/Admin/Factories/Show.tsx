import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ShieldAlert,
    Clock,
    Check,
    Ban,
    Phone,
    Mail,
    MapPin,
    Layers,
    FileText,
    Shield,
    Hash,
    Calendar,
    ExternalLink,
    AlertCircle,
    Edit3
} from 'lucide-react';

interface Props {
    user: {
        id: number;
        customer_id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        created_at: string;
        nid_number?: string;
        factory?: {
            id: number;
            business_name: string;
            logo?: string | null;
            industry_type: string;
            contact_person: string;
            phone: string;
            email: string;
            district: string;
            address: string;
            total_lines: number;
            total_machines: number;
            daily_capacity: string;
            trade_license_no?: string;
            tin_no?: string;
            bin_no?: string;
            is_verified: boolean;
            rating: number;
            capabilities?: Record<string, any>;
        };
        subcontract_posts?: Array<any>;
    };
}

export default function Show({ user }: Props) {
    const factory = user.factory;
    const isFromPending = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('from') === 'pending' || user.status === 'pending');
    const backUrl = isFromPending ? route('admin.factories.pending') : route('admin.factories.index');

    const handleApprove = () => {
        if (confirm(`Are you sure you want to approve and activate the factory account '${factory?.business_name || user.name}'?`)) {
            router.post(route('admin.factories.approve', user.id));
        }
    };

    const handleBlock = () => {
        if (confirm(`Warning: Are you sure you want to suspend/block the account '${factory?.business_name || user.name}'?`)) {
            router.post(route('admin.factories.block', user.id));
        }
    };

    const handleUnblock = () => {
        if (confirm(`Are you sure you want to unblock and reactivate the account '${factory?.business_name || user.name}'?`)) {
            router.post(route('admin.factories.unblock', user.id));
        }
    };

    return (
        <AdminLayout title="Factory Review">
            <Head title={`Review: ${factory?.business_name || user.name} - Shilposetu Admin`} />

            <div className="space-y-6">
                {/* Back link & Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={backUrl}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-xs shrink-0"
                            title={isFromPending ? 'Back to Pending Verifications' : 'Back to Factories Directory'}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        {factory?.logo ? (
                            <img
                                src={`/storage/${factory.logo}`}
                                alt={factory.business_name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shrink-0">
                                {(factory?.business_name || user.name || 'F').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white">{factory?.business_name || user.name}</h1>
                                {user.status === 'pending' && (
                                    <span className="text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pending Review
                                    </span>
                                )}
                                {user.status === 'active' && (
                                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active & Verified
                                    </span>
                                )}
                                {user.status === 'suspended' && (
                                    <span className="text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" />
                                        Suspended / Blocked
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                Customer ID: {user.customer_id || `S${user.id}`} • Registered Date: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <Link
                            href={route('admin.factories.edit', user.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition shadow-xs cursor-pointer"
                        >
                            <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Edit Factory</span>
                        </Link>

                        {user.status === 'pending' && (
                            <button
                                onClick={handleApprove}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition transform active:scale-95 cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>Approve & Activate</span>
                            </button>
                        )}

                        {user.status === 'active' && (
                            <button
                                onClick={handleBlock}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition cursor-pointer"
                            >
                                <Ban className="w-4 h-4" />
                                <span>Suspend Account</span>
                            </button>
                        )}

                        {user.status === 'suspended' && (
                            <button
                                onClick={handleUnblock}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>Unblock Account</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Technical & Legal Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Factory Profile */}
                        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Factory Profile & Overview</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Company / Factory Name:</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{factory?.business_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Industry Type:</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{factory?.industry_type || 'Apparel & Garments'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Owner / Contact Person:</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{factory?.contact_person || user.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">District:</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{factory?.district || 'N/A'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Full Address:</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{factory?.address || 'Address not provided'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Production Capacity & Infrastructure */}
                        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Production Capacity & Infrastructure</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Lines</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                        {factory?.total_lines || 0} Lines
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Machines</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                        {factory?.total_machines || 0} Machines
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Daily Capacity</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                        {factory?.daily_capacity || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legal & KYC Documents */}
                        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Legal & Verification Documents (KYC)</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 block">Trade License Number:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-sm">
                                        {factory?.trade_license_no || 'Not attached'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 block">TIN Certificate Number:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-sm">
                                        {factory?.tin_no || 'Not attached'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 block">BIN / VAT Number:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-sm">
                                        {factory?.bin_no || 'Not attached'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 block">National ID (NID) Number:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-sm">
                                        {user.nid_number || 'Not attached'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Account Status & Contacts */}
                    <div className="space-y-6">
                        {/* Account Status Card */}
                        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none transition-colors">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                                Account Status
                            </h2>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Status:</span>
                                    <span className="font-bold text-slate-900 dark:text-white uppercase">{user.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Verified Badge:</span>
                                    <span className={`font-bold ${factory?.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {factory?.is_verified ? 'Yes (Verified)' : 'No (Pending)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Customer ID:</span>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{user.customer_id || `S${user.id}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-none transition-colors">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                                Contact Information
                            </h2>
                            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>{user.phone || 'No phone number provided'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>{factory?.district || 'Gazipur'}, Bangladesh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
