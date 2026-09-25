import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    Search,
    MapPin,
    Phone,
    Mail,
    Check,
    Ban,
    Eye,
    CheckCircle2,
    Shield,
    Building2,
    AlertCircle,
    X,
    Filter,
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { PaginatedData, User } from '@/types';

interface Props {
    factories: PaginatedData<User>;
    filters: {
        search: string;
        district: string;
        per_page?: number;
    };
    districts: string[];
    pendingCount: number;
}

export default function Pending({ factories, filters, districts, pendingCount }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.factories.pending'), {
            ...filters,
            search,
            page: 1,
        }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('admin.factories.pending'), {
            ...filters,
            search: '',
            page: 1,
        }, { preserveState: true });
    };

    const handleDistrictChange = (district: string) => {
        router.get(route('admin.factories.pending'), {
            ...filters,
            district,
            page: 1,
        }, { preserveState: true });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(route('admin.factories.pending'), {
            ...filters,
            per_page: perPage,
            page: 1,
        }, { preserveState: true });
    };

    const handleApprove = (id: number, name: string) => {
        if (confirm(`Approve and verify factory account '${name}'? This will enable their public profile and RFQ access.`)) {
            router.post(route('admin.factories.approve', id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = (id: number, name: string) => {
        if (confirm(`Are you sure you want to reject / block factory '${name}'?`)) {
            router.post(route('admin.factories.block', id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout title="Pending Factory Verifications">
            <Head title="Pending Factory Verifications - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Pending Factory Verifications</h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                <Clock className="w-3.5 h-3.5" />
                                {pendingCount} Awaiting Review
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Review newly submitted factory registrations, verify trade licenses, TIN/BIN legal documents, and approve active operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href={route('admin.factories.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition shadow-xs"
                        >
                            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>View All Factories</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-sm dark:shadow-none transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search pending factories by name, phone, email, customer ID..."
                                className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            {/* District Filter */}
                            <div className="flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                                <select
                                    value={filters.district || 'all'}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="all">All Districts</option>
                                    {districts.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Factories Table */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
                    {factories.data.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center p-6 space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div className="max-w-md space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    No Pending Verifications
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                    {filters.search || (filters.district && filters.district !== 'all')
                                        ? 'No pending factory matches your search criteria. Try adjusting the search query or district filter.'
                                        : 'All registered manufacturing units have been reviewed and approved! When new factories submit their profiles, they will automatically appear here for verification.'}
                                </p>
                            </div>
                            {(filters.search || (filters.district && filters.district !== 'all')) && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('admin.factories.pending'));
                                    }}
                                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3.5 px-4">Factory & Contact</th>
                                        <th className="py-3.5 px-3">Customer ID</th>
                                        <th className="py-3.5 px-3">Location & District</th>
                                        <th className="py-3.5 px-3">Production Capacity</th>
                                        <th className="py-3.5 px-3">Submitted Date</th>
                                        <th className="py-3.5 px-3">Status</th>
                                        <th className="py-3.5 px-4 text-right">Verification Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {factories.data.map((user) => {
                                        const factory = user.factory;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                                            >
                                                {/* Factory & Contact */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>{factory?.business_name || user.name}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            Owner: {user.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {user.phone}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Customer ID */}
                                                <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    {user.customer_id || `S${user.id}`}
                                                </td>

                                                {/* District & Location */}
                                                <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{factory?.district || 'Not specified'}</span>
                                                    </div>
                                                    {factory?.address && (
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                                                            {factory.address}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Production Capacity */}
                                                <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                                        {factory?.daily_capacity || factory?.industry_type || 'General Apparel'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {factory?.total_lines ?? 0} Lines • {factory?.total_machines ?? 0} Machines
                                                    </div>
                                                </td>

                                                {/* Submitted Date */}
                                                <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-[11px] font-mono whitespace-nowrap">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    }) : '—'}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/25">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Pending Review
                                                    </span>
                                                </td>

                                                {/* Verification Actions */}
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <Link
                                                            href={route('admin.factories.show', user.id) + '?from=pending'}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 transition"
                                                            title="Inspect Legal KYC & Factory Profile"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Review</span>
                                                        </Link>

                                                        <button
                                                            onClick={() => handleApprove(user.id, factory?.business_name || user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                                                            title="Approve & Activate Factory"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Approve</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleReject(user.id, factory?.business_name || user.name)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                                                            title="Reject / Block Application"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Server-Side Pagination */}
                    <Pagination
                        links={factories.links}
                        from={factories.from}
                        to={factories.to}
                        total={factories.total}
                        perPage={factories.per_page}
                        onPerPageChange={handlePerPageChange}
                        itemName="pending factories"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
