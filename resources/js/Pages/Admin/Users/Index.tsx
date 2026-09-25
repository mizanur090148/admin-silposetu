import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Search, ShieldAlert, CheckCircle, Ban, Check, Phone, Mail, Plus, X, UserPlus } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { PaginatedData, User } from '@/types';

interface Props {
    users: PaginatedData<User>;
    filters: {
        role: string;
        status: string;
        search: string;
        per_page?: number;
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
    const [search, setSearch] = useState(filters.search || '');
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: addData, setData: setAddData, post: postAdd, processing: adding, errors: addErrors, reset: resetAdd } = useForm({
        name: '',
        phone: '',
        email: '',
        password: 'Shilpo@2026',
        account_type: 'buyer',
        status: 'active',
        nid_number: '',
        is_subscribed: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            ...filters,
            search,
            page: 1,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(route('admin.users.index'), {
            ...filters,
            [key]: value,
            page: 1,
        }, { preserveState: true });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(route('admin.users.index'), {
            ...filters,
            per_page: perPage,
            page: 1,
        }, { preserveState: true });
    };

    const handleToggleStatus = (id: number, name: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'suspend / block' : 'activate';
        if (confirm(`Are you sure you want to ${action} user '${name}'?`)) {
            router.post(route('admin.users.toggleStatus', id));
        }
    };

    const submitAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('admin.users.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    return (
        <AdminLayout title="Users">
            <Head title="User Management - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">User Management</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Review and manage all platform accounts (factories, buyers, and administrators).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition transform active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
                        <span className="text-slate-500 dark:text-slate-400 block">Total Users</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
                    </div>
                    <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
                        <span className="text-slate-500 dark:text-slate-400 block">Factories</span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{stats.factories}</span>
                    </div>
                    <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
                        <span className="text-slate-500 dark:text-slate-400 block">Buyers</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{stats.buyers}</span>
                    </div>
                    <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none">
                        <span className="text-slate-500 dark:text-slate-400 block">Suspended / Blocked</span>
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{stats.suspended}</span>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, phone, or Customer ID..."
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm transition"
                        />
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filters.role || 'all'}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 py-2 px-3 shadow-sm transition"
                        >
                            <option value="all">All Roles</option>
                            <option value="factory">Factory</option>
                            <option value="buyer">Buyer</option>
                            <option value="admin">Admin</option>
                        </select>

                        <select
                            value={filters.status || 'all'}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 py-2 px-3 shadow-sm transition"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3.5 px-4">User & ID</th>
                                    <th className="py-3.5 px-3">Contact</th>
                                    <th className="py-3.5 px-3">Role</th>
                                    <th className="py-3.5 px-3">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</div>
                                            <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                                                {user.customer_id || `S${user.id}`}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                                            <div>{user.phone || 'No phone'}</div>
                                            <div className="text-[11px] text-slate-400 dark:text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                user.account_type === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30'
                                                    : user.account_type === 'factory'
                                                    ? 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30'
                                                    : 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30'
                                            }`}>
                                                {user.account_type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                user.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                                    : user.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {user.account_type !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                        user.status === 'active'
                                                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/20'
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

                    {/* Server-Side Pagination */}
                    <Pagination
                        links={users.links}
                        from={users.from}
                        to={users.to}
                        total={users.total}
                        perPage={filters.per_page || users.per_page}
                        onPerPageChange={handlePerPageChange}
                        itemName="users"
                    />
                </div>

                {/* MODAL: ADD USER */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                    <span>Create New User Account</span>
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitAddUser} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Account Role / Type <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <select
                                        value={addData.account_type}
                                        onChange={e => setAddData('account_type', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    >
                                        <option value="buyer">Buyer (Brand / Sourcing Merchant)</option>
                                        <option value="factory">Factory (Manufacturing Partner)</option>
                                        <option value="admin">Administrator (Control Center)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Full Name <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={addData.name}
                                        onChange={e => setAddData('name', e.target.value)}
                                        placeholder="e.g. Shakil Chowdhury"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    />
                                    {addErrors.name && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{addErrors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Mobile / Phone <span className="text-rose-500 dark:text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addData.phone}
                                            onChange={e => setAddData('phone', e.target.value)}
                                            placeholder="017xxxxxxxx"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                        />
                                        {addErrors.phone && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{addErrors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Email Address <span className="text-rose-500 dark:text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={addData.email}
                                            onChange={e => setAddData('email', e.target.value)}
                                            placeholder="user@example.com"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                        />
                                        {addErrors.email && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{addErrors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="text"
                                            value={addData.password}
                                            onChange={e => setAddData('password', e.target.value)}
                                            placeholder="Shilpo@2026"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                            Initial Status
                                        </label>
                                        <select
                                            value={addData.status}
                                            onChange={e => setAddData('status', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        NID Number
                                    </label>
                                    <input
                                        type="text"
                                        value={addData.nid_number}
                                        onChange={e => setAddData('nid_number', e.target.value)}
                                        placeholder="Optional NID"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition cursor-pointer"
                                    >
                                        {adding ? 'Creating User...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

