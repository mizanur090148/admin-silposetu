import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    CheckCircle,
    ShieldAlert,
    Factory,
    Search,
    MapPin,
    Phone,
    Mail,
    SlidersHorizontal,
    Check,
    Ban,
    Eye,
    ChevronLeft,
    ChevronRight,
    Layers
} from 'lucide-react';

interface Props {
    factories: {
        data: Array<any>;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    counts: {
        pending: number;
        active: number;
        suspended: number;
        all: number;
    };
    filters: {
        tab: string;
        search: string;
        district: string;
    };
    districts: string[];
}

export default function Index({ factories, counts, filters, districts }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.factories.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const handleTabChange = (tab: string) => {
        router.get(route('admin.factories.index'), {
            ...filters,
            tab,
        }, { preserveState: true });
    };

    const handleDistrictChange = (district: string) => {
        router.get(route('admin.factories.index'), {
            ...filters,
            district,
        }, { preserveState: true });
    };

    const handleApprove = (id: number, name: string) => {
        if (confirm(`আপনি কি '${name}' ফ্যাক্টরিটি অনুমোদন (Approve) করতে চান?`)) {
            router.post(route('admin.factories.approve', id));
        }
    };

    const handleBlock = (id: number, name: string) => {
        if (confirm(`সতর্কতা: আপনি কি '${name}' ফ্যাক্টরিটি সাময়িকভাবে স্থগিত/ব্লক করতে চান?`)) {
            router.post(route('admin.factories.block', id));
        }
    };

    const handleUnblock = (id: number, name: string) => {
        if (confirm(`আপনি কি '${name}' ফ্যাক্টরিটি আনব্লক করতে চান?`)) {
            router.post(route('admin.factories.unblock', id));
        }
    };

    return (
        <AdminLayout title="ফ্যাক্টরি ম্যানেজমেন্ট">
            <Head title="ফ্যাক্টরি তালিকা - শিল্পসেতু অ্যাডমিন" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-white">ফ্যাক্টরি ভেরিফিকেশন ও তালিকা</h1>
                        <p className="text-xs text-slate-400">
                            প্ল্যাটফর্মে নিবন্ধিত সকল ফ্যাক্টরি যাচাই, লাইসেন্স রিভিউ এবং সক্রিয়/স্থগিত করুন।
                        </p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
                    <button
                        onClick={() => handleTabChange('pending')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                            filters.tab === 'pending'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>পেন্ডিং অনুমোদন (Pending)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                            {counts.pending}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('active')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                            filters.tab === 'active'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>সক্রিয় ফ্যাক্টরি (Active)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'active' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {counts.active}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('suspended')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                            filters.tab === 'suspended'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>স্থগিত / ব্লকড (Suspended)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'suspended' ? 'bg-rose-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {counts.suspended}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('all')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                            filters.tab === 'all'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <Factory className="w-3.5 h-3.5" />
                        <span>সকল ফ্যাক্টরি (All)</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {counts.all}
                        </span>
                    </button>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ফ্যাক্টরির নাম, মোবাইল বা কাস্টমার আইডি..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-400 shrink-0">জেলা:</span>
                        <select
                            value={filters.district || 'all'}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">সকল জেলা</option>
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Factories Table */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                    {factories.data.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                            <Factory className="w-10 h-10 text-slate-700" />
                            <span>কোনো ফ্যাক্টরি পাওয়া যায়নি।</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3.5 px-4">ফ্যাক্টরি ও মালিক</th>
                                        <th className="py-3.5 px-3">কাস্টমার আইডি</th>
                                        <th className="py-3.5 px-3">যোগাযোগ</th>
                                        <th className="py-3.5 px-3">ক্যাপাসিটি</th>
                                        <th className="py-3.5 px-3">স্ট্যাটাস</th>
                                        <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {factories.data.map((user) => {
                                        const factory = user.factory;
                                        return (
                                            <tr key={user.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-white text-sm">
                                                        {factory?.business_name || user.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                        <span>মালিক: {user.name}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 text-slate-400">
                                                            <MapPin className="w-3 h-3 text-slate-500" />
                                                            {factory?.district || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 font-mono font-bold text-blue-400 text-xs">
                                                    {user.customer_id || `S${user.id}`}
                                                </td>
                                                <td className="py-4 px-3 text-slate-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{user.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 text-slate-300">
                                                    <div className="flex items-center gap-1 font-semibold text-slate-200">
                                                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                                        <span>{factory?.total_lines || 0} লাইনস</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        মেশিন: {factory?.total_machines || 0}টি
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    {user.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                            <Clock className="w-3 h-3" />
                                                            পেন্ডিং
                                                        </span>
                                                    )}
                                                    {user.status === 'active' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                            <CheckCircle className="w-3 h-3" />
                                                            অ্যাক্টিভ & ভেরিফাইড
                                                        </span>
                                                    )}
                                                    {user.status === 'suspended' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            স্থগিত (Blocked)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right space-x-1.5">
                                                    <Link
                                                        href={route('admin.factories.show', user.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>রিভিউ</span>
                                                    </Link>

                                                    {user.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleApprove(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Active</span>
                                                        </button>
                                                    )}

                                                    {user.status === 'active' && (
                                                        <button
                                                            onClick={() => handleBlock(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                            <span>Block</span>
                                                        </button>
                                                    )}

                                                    {user.status === 'suspended' && (
                                                        <button
                                                            onClick={() => handleUnblock(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition"
                                                        >
                                                            <span>Unblock</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {factories.last_page > 1 && (
                        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                            <div>
                                পৃষ্ঠা {factories.current_page} এর {factories.last_page} (মোট {factories.total}টি)
                            </div>
                            <div className="flex gap-2">
                                {factories.prev_page_url && (
                                    <Link
                                        href={factories.prev_page_url}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
                                    >
                                        আগেরটি
                                    </Link>
                                )}
                                {factories.next_page_url && (
                                    <Link
                                        href={factories.next_page_url}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                                    >
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
