import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Search, ShieldAlert, CheckCircle, Ban, Check, Phone, Mail } from 'lucide-react';

interface Props {
    users: {
        data: Array<any>;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    filters: {
        role: string;
        status: string;
        search: string;
    };
    stats: {
        total: number;
        factories: number;
        buyers: number;
        admins: number;
        suspended: number;
    };
}

export default function Index({ users, filters, stats }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(route('admin.users.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true });
    };

    const handleToggleStatus = (id: number, name: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'suspend / block' : 'activate';
        if (confirm(`Are you sure you want to ${action} user '${name}'?`)) {
            router.post(route('admin.users.toggleStatus', id));
        }
    };

    return (
        <AdminLayout title="Users">
            <Head title="User Management - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-black text-white">User Management</h1>
                    <p className="text-xs text-slate-400">
                        Review and manage all platform accounts (factories, buyers, and administrators).
                    </p>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <span className="text-slate-400 block">Total Users</span>
                        <span className="text-xl font-black text-white mt-1 block">{stats.total}</span>
                    </div>
                    <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <span className="text-slate-400 block">Factories</span>
                        <span className="text-xl font-black text-indigo-400 mt-1 block">{stats.factories}</span>
                    </div>
                    <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <span className="text-slate-400 block">Buyers</span>
                        <span className="text-xl font-black text-blue-400 mt-1 block">{stats.buyers}</span>
                    </div>
                    <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <span className="text-slate-400 block">Suspended / Blocked</span>
                        <span className="text-xl font-black text-rose-400 mt-1 block">{stats.suspended}</span>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, phone, or Customer ID..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filters.role || 'all'}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3"
                        >
                            <option value="all">All Roles</option>
                            <option value="factory">Factory</option>
                            <option value="buyer">Buyer</option>
                            <option value="admin">Admin</option>
                        </select>

                        <select
                            value={filters.status || 'all'}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3.5 px-4">User & ID</th>
                                    <th className="py-3.5 px-3">Contact</th>
                                    <th className="py-3.5 px-3">Role</th>
                                    <th className="py-3.5 px-3">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-white text-sm">{user.name}</div>
                                            <div className="font-mono text-[11px] text-blue-400">
                                                {user.customer_id || `S${user.id}`}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-300">
                                            <div>{user.phone || 'No phone'}</div>
                                            <div className="text-[11px] text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                user.account_type === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                    : user.account_type === 'factory'
                                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}>
                                                {user.account_type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                user.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : user.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {user.account_type !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                                        user.status === 'active'
                                                            ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/20'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? 'Block' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                            <div>
                                Page {users.current_page} of {users.last_page} (Total {users.total})
                            </div>
                            <div className="flex gap-2">
                                {users.prev_page_url && (
                                    <Link href={users.prev_page_url} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium">
                                        Previous
                                    </Link>
                                )}
                                {users.next_page_url && (
                                    <Link href={users.next_page_url} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
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
