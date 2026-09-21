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
    AlertCircle
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

    const handleApprove = () => {
        if (confirm(`আপনি কি নিশ্চিত যে '${factory?.business_name || user.name}' ফ্যাক্টরি অ্যাকাউন্টটি অনুমোদন (Approve) ও অ্যাক্টিভ করবেন?`)) {
            router.post(route('admin.factories.approve', user.id));
        }
    };

    const handleBlock = () => {
        if (confirm(`সতর্কতা: আপনি কি নিশ্চিত যে '${factory?.business_name || user.name}' অ্যাকাউন্টটি ব্লক/স্থগিত (Suspend) করবেন?`)) {
            router.post(route('admin.factories.block', user.id));
        }
    };

    const handleUnblock = () => {
        if (confirm(`আপনি কি নিশ্চিত যে '${factory?.business_name || user.name}' অ্যাকাউন্টটি পুনরায় সক্রিয় (Unblock) করবেন?`)) {
            router.post(route('admin.factories.unblock', user.id));
        }
    };

    return (
        <AdminLayout title="ফ্যাক্টরি তথ্য রিভিউ">
            <Head title={`রিভিউ: ${factory?.business_name || user.name} - শিল্পসেতু অ্যাডমিন`} />

            <div className="space-y-6">
                {/* Back link & Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-white">{factory?.business_name || user.name}</h1>
                                {user.status === 'pending' && (
                                    <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pending Review
                                    </span>
                                )}
                                {user.status === 'active' && (
                                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active & Verified
                                    </span>
                                )}
                                {user.status === 'suspended' && (
                                    <span className="text-xs font-bold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" />
                                        Suspended / Blocked
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                কাস্টমার আইডি: {user.customer_id || `S${user.id}`} • নিবন্ধনের তারিখ: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {user.status === 'pending' && (
                            <button
                                onClick={handleApprove}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
                            >
                                <Check className="w-4 h-4" />
                                <span>অনুমোদন ও সক্রিয় করুন (Approve & Active)</span>
                            </button>
                        )}

                        {user.status === 'active' && (
                            <button
                                onClick={handleBlock}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition"
                            >
                                <Ban className="w-4 h-4" />
                                <span>অ্যাকাউন্ট স্থগিত করুন (Block)</span>
                            </button>
                        )}

                        {user.status === 'suspended' && (
                            <button
                                onClick={handleUnblock}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition"
                            >
                                <Check className="w-4 h-4" />
                                <span>পুনরায় সক্রিয় করুন (Unblock)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Technical & Legal Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Factory Profile */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <span>ফ্যাক্টরির পরিচিতি ও তথ্য</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-500 block mb-1">প্রতিষ্ঠানের নাম:</span>
                                    <span className="font-semibold text-slate-200">{factory?.business_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">ইন্ডাস্ট্রি টাইপ:</span>
                                    <span className="font-semibold text-slate-200">{factory?.industry_type || 'Apparel & Garments'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">মালিক / ফোকাল পার্সন:</span>
                                    <span className="font-semibold text-slate-200">{factory?.contact_person || user.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">জেলা (District):</span>
                                    <span className="font-semibold text-slate-200">{factory?.district || 'N/A'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-slate-500 block mb-1">পূর্ণ ঠিকানা:</span>
                                    <span className="font-semibold text-slate-200">{factory?.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Production Capacity & Infrastructure */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Layers className="w-4 h-4 text-indigo-400" />
                                <span>উৎপাদন সক্ষমতা ও অবকাঠামো (Capacity)</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                                    <span className="text-slate-400 block text-[11px]">মোট লাইন সংখ্যা</span>
                                    <span className="text-xl font-black text-white mt-1 block">
                                        {factory?.total_lines || 0} Lines
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                                    <span className="text-slate-400 block text-[11px]">মোট মেশিন সংখ্যা</span>
                                    <span className="text-xl font-black text-white mt-1 block">
                                        {factory?.total_machines || 0} Machines
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                                    <span className="text-slate-400 block text-[11px]">দৈনিক ক্যাপাসিটি</span>
                                    <span className="text-xl font-black text-white mt-1 block">
                                        {factory?.daily_capacity || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legal & KYC Documents */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                <span>আইনি ও ভেরিফিকেশন ডকুমেন্টস (KYC)</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 block">ট্রেড লাইসেন্স নম্বর:</span>
                                    <span className="font-mono font-bold text-slate-200 text-sm">
                                        {factory?.trade_license_no || 'সংযুক্ত নেই'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 block">TIN সার্টিফিকেট নম্বর:</span>
                                    <span className="font-mono font-bold text-slate-200 text-sm">
                                        {factory?.tin_no || 'সংযুক্ত নেই'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 block">BIN / VAT নম্বর:</span>
                                    <span className="font-mono font-bold text-slate-200 text-sm">
                                        {factory?.bin_no || 'সংযুক্ত নেই'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
                                    <span className="text-slate-500 block">জাতীয় পরিচয়পত্র (NID) নম্বর:</span>
                                    <span className="font-mono font-bold text-slate-200 text-sm">
                                        {user.nid_number || 'সংযুক্ত নেই'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Account Status & Contacts */}
                    <div className="space-y-6">
                        {/* Account Status Card */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                                অ্যাকাউন্ট স্ট্যাটাস
                            </h2>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">স্ট্যাটাস:</span>
                                    <span className="font-bold text-white uppercase">{user.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">ভেরিফাইড ব্যাজ:</span>
                                    <span className={`font-bold ${factory?.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {factory?.is_verified ? 'Yes (Verified)' : 'No (Pending)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">কাস্টমার আইডি:</span>
                                    <span className="font-mono font-bold text-blue-400">{user.customer_id || `S${user.id}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                                যোগাযোগের তথ্য
                            </h2>
                            <div className="space-y-2.5 text-xs text-slate-300">
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span>{user.phone || 'ফোন নম্বর নেই'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                                    <span>{factory?.district || 'Gazipur'}, বাংলাদেশ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
