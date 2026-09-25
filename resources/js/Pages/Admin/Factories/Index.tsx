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
    Check,
    Ban,
    Eye,
    Layers,
    Plus,
    Upload,
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
        if (confirm(`Are you sure you want to approve factory '${name}'?`)) {
            router.post(route('admin.factories.approve', id));
        }
    };

    const handleBlock = (id: number, name: string) => {
        if (confirm(`Warning: Are you sure you want to suspend/block factory '${name}'?`)) {
            router.post(route('admin.factories.block', id));
        }
    };

    const handleUnblock = (id: number, name: string) => {
        if (confirm(`Are you sure you want to unblock factory '${name}'?`)) {
            router.post(route('admin.factories.unblock', id));
        }
    };

    return (
        <AdminLayout title="Factories Management">
            <Head title="Factories Management - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Factory Verification & Directory</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Verify registered manufacturing units, inspect legal documents, and approve or suspend factory accounts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <Link
                            href={route('admin.factories.import')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition shadow-xs"
                        >
                            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Bulk Upload CSV</span>
                        </Link>
                        <Link
                            href={route('admin.factories.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition transform active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Factory</span>
                        </Link>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
                    <button
                        onClick={() => handleTabChange('pending')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                            filters.tab === 'pending'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Approval</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {counts.pending}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('active')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                            filters.tab === 'active'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active & Verified</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'active' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {counts.active}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('suspended')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                            filters.tab === 'suspended'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspended / Blocked</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'suspended' ? 'bg-rose-900 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {counts.suspended}
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('all')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                            filters.tab === 'all'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                    >
                        <Factory className="w-3.5 h-3.5" />
                        <span>All Factories</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filters.tab === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {counts.all}
                        </span>
                    </button>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Factory name, phone, or Customer ID..."
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-600 dark:text-slate-400 shrink-0">District:</span>
                        <select
                            value={filters.district || 'all'}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 py-2 px-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">All Districts</option>
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Factories Table */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
                    {factories.data.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                            <Factory className="w-10 h-10 text-slate-400 dark:text-slate-700" />
                            <span>No factories found in this view.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3.5 px-4">Factory & Owner</th>
                                        <th className="py-3.5 px-3">Customer ID</th>
                                        <th className="py-3.5 px-3">Contact</th>
                                        <th className="py-3.5 px-3">Capacity</th>
                                        <th className="py-3.5 px-3">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {factories.data.map((user) => {
                                        const factory = user.factory;
                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {factory?.business_name || user.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                        <span>Owner: {user.name}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            {factory?.district || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                                                    {user.customer_id || `S${user.id}`}
                                                </td>
                                                <td className="py-4 px-3 text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{user.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px] mt-0.5">
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-200">
                                                        <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                        <span>{factory?.total_lines || 0} Lines</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Machines: {factory?.total_machines || 0}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    {user.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                                            <Clock className="w-3 h-3" />
                                                            Pending
                                                        </span>
                                                    )}
                                                    {user.status === 'active' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Active & Verified
                                                        </span>
                                                    )}
                                                    {user.status === 'suspended' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            Suspended
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right space-x-1.5">
                                                    <Link
                                                        href={route('admin.factories.show', user.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Review</span>
                                                    </Link>

                                                    {user.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleApprove(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Approve</span>
                                                        </button>
                                                    )}

                                                    {user.status === 'active' && (
                                                        <button
                                                            onClick={() => handleBlock(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition cursor-pointer"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                            <span>Block</span>
                                                        </button>
                                                    )}

                                                    {user.status === 'suspended' && (
                                                        <button
                                                            onClick={() => handleUnblock(user.id, user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition cursor-pointer"
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
                        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div>
                                Page {factories.current_page} of {factories.last_page} (Total {factories.total} factories)
                            </div>
                            <div className="flex gap-2">
                                {factories.prev_page_url && (
                                    <Link
                                        href={factories.prev_page_url}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-medium"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {factories.next_page_url && (
                                    <Link
                                        href={factories.next_page_url}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                                    >
                                        Next
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
