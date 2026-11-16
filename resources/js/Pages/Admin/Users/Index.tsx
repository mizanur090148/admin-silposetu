import React, { useState, FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Users, Search, Plus, Pencil, Power, Trash2, X } from 'lucide-react';
import { FactoryRef, PaginatedData, SupplierRef, User, UserRole, VendorRef } from '@/types';
import { ROLE_META } from '@/utils/labels';

interface Props {
    users: PaginatedData<User>;
    counts: {
        total: number;
        active: number;
        fac: number;
        ven: number;
        sup: number;
        par: number;
        admin: number;
    };
    filters: {
        search: string;
        role: string;
        is_active: string;
        subscription_plan: string;
        per_page: number;
    };
    factories: FactoryRef[];
    vendors: VendorRef[];
    suppliers: SupplierRef[];
}

export default function Index({ users, counts, filters, factories, vendors, suppliers }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);

    const form = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'fac' as UserRole,
        designation: '',
        organization_name: '',
        factory_id: '',
        vendor_id: '',
        supplier_id: '',
        partner_code: '',
        party_code: '',
        is_owner: false,
        is_vendor_rep: false,
        can_message: true,
        is_active: true,
        subscription_plan: 'free',
        billing_cycle: 'm' as 'm' | 'y',
        trial_ends_at: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.users.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setShowModal(true);
    };

    const openEdit = (u: User) => {
        setEditing(u);
        form.clearErrors();
        form.setData({
            name: u.name,
            phone: u.phone,
            email: u.email || '',
            password: '',
            password_confirmation: '',
            role: u.role,
            designation: u.designation || '',
            organization_name: u.organization_name || '',
            factory_id: u.factory_id ? String(u.factory_id) : '',
            vendor_id: u.vendor_id ? String(u.vendor_id) : '',
            supplier_id: u.supplier_id ? String(u.supplier_id) : '',
            partner_code: u.partner_code || '',
            party_code: u.party_code || '',
            is_owner: u.is_owner,
            is_vendor_rep: u.is_vendor_rep,
            can_message: u.can_message,
            is_active: u.is_active,
            subscription_plan: u.subscription_plan,
            billing_cycle: u.billing_cycle,
            trial_ends_at: u.trial_ends_at ? u.trial_ends_at.slice(0, 10) : '',
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.users.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.users.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    return (
        <AdminLayout title="Users & Accounts">
            <Head title="Users" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                    {[
                        { label: 'Total Users', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Active', val: counts.active, cls: 'text-emerald-600' },
                        { label: 'Factories', val: counts.fac, cls: 'text-blue-600' },
                        { label: 'Vendors', val: counts.ven, cls: 'text-teal-600' },
                        { label: 'Suppliers', val: counts.sup, cls: 'text-amber-600' },
                        { label: 'Partners', val: counts.par, cls: 'text-purple-600' },
                        { label: 'Admins', val: counts.admin, cls: 'text-indigo-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({ page: 1 });
                        }}
                        className="flex flex-wrap items-center gap-2 flex-1"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, phone, email, organization..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.role}
                            onChange={(e) => applyFilter({ role: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Roles</option>
                            <option value="fac">Factory (fac)</option>
                            <option value="ven">Vendor (ven)</option>
                            <option value="sup">Supplier (sup)</option>
                            <option value="par">Partner (par)</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select
                            value={filters.is_active}
                            onChange={(e) => applyFilter({ is_active: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">Any Status</option>
                            <option value="1">Active Only</option>
                            <option value="0">Inactive Only</option>
                        </select>
                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add User
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">User & Contact</th>
                                    <th className="py-3 px-4">Role & Organization</th>
                                    <th className="py-3 px-4">Linked Entity</th>
                                    <th className="py-3 px-4">Plan & Flags</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No users match your query.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => {
                                        const meta = ROLE_META[u.role] || { label: u.role, badgeClass: 'bg-slate-100 text-slate-700' };
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                                <td className="py-3.5 px-4">
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{u.name}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {u.phone} {u.email ? `· ${u.email}` : ''}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${meta.badgeClass}`}>
                                                        {meta.label}
                                                    </span>
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                                                        {u.organization_name || '—'} {u.designation ? `(${u.designation})` : ''}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4 text-[11px]">
                                                    {u.factory && <p>Factory: {u.factory.code} ({u.factory.name})</p>}
                                                    {u.vendor && <p>Vendor: {u.vendor.code} ({u.vendor.name})</p>}
                                                    {u.supplier && <p>Supplier: {u.supplier.name}</p>}
                                                    {u.partner_code && <p>Partner: {u.partner_code}</p>}
                                                    {u.party_code && <p>Party: {u.party_code}</p>}
                                                    {!u.factory && !u.vendor && !u.supplier && !u.partner_code && !u.party_code && '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-[11px]">
                                                    <p className="uppercase font-semibold">
                                                        {u.subscription_plan} ({u.billing_cycle})
                                                    </p>
                                                    <p className="text-slate-500">
                                                        {u.is_owner ? 'Owner ' : ''}
                                                        {u.is_vendor_rep ? 'VendorRep ' : ''}
                                                        {u.can_message ? 'ChatOn' : 'ChatOff'}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            u.is_active
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(u)}
                                                            title="Edit User"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(route('admin.users.toggleStatus', u.id), {}, { preserveScroll: true })}
                                                            title="Toggle Active"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm(`Delete user "${u.name}"?`)) {
                                                                    router.delete(route('admin.users.destroy', u.id), { preserveScroll: true });
                                                                }
                                                            }}
                                                            title="Delete User"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={users.links}
                        from={users.from}
                        to={users.to}
                        total={users.total}
                        perPage={filters.per_page}
                        onPerPageChange={(n) => applyFilter({ per_page: n, page: 1 })}
                        itemName="users"
                    />
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold">{editing ? `Edit User: ${editing.name}` : 'Create New User'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.name && <p className="text-rose-500 mt-1">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Phone *</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.phone && <p className="text-rose-500 mt-1">{form.errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.email && <p className="text-rose-500 mt-1">{form.errors.email}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Role *</label>
                                <select
                                    value={form.data.role}
                                    onChange={(e) => form.setData('role', e.target.value as UserRole)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="fac">Factory (fac)</option>
                                    <option value="ven">Vendor (ven)</option>
                                    <option value="sup">Supplier (sup)</option>
                                    <option value="par">Partner (par)</option>
                                    <option value="admin">Admin (admin)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">
                                    Password {editing ? '(leave blank to keep)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    required={!editing}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.password && <p className="text-rose-500 mt-1">{form.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    required={!editing}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    value={form.data.organization_name}
                                    onChange={(e) => form.setData('organization_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Designation</label>
                                <input
                                    type="text"
                                    value={form.data.designation}
                                    onChange={(e) => form.setData('designation', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Linked Factory</label>
                                <select
                                    value={form.data.factory_id}
                                    onChange={(e) => form.setData('factory_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None</option>
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} · {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Linked Vendor</label>
                                <select
                                    value={form.data.vendor_id}
                                    onChange={(e) => form.setData('vendor_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None</option>
                                    {vendors.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.code} · {v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Linked Supplier</label>
                                <select
                                    value={form.data.supplier_id}
                                    onChange={(e) => form.setData('supplier_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Partner Code</label>
                                    <input
                                        type="text"
                                        value={form.data.partner_code}
                                        onChange={(e) => form.setData('partner_code', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Party Code</label>
                                    <input
                                        type="text"
                                        value={form.data.party_code}
                                        onChange={(e) => form.setData('party_code', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Subscription Plan *</label>
                                <input
                                    type="text"
                                    value={form.data.subscription_plan}
                                    onChange={(e) => form.setData('subscription_plan', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Billing Cycle</label>
                                <select
                                    value={form.data.billing_cycle}
                                    onChange={(e) => form.setData('billing_cycle', e.target.value as 'm' | 'y')}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="m">Monthly (m)</option>
                                    <option value="y">Yearly (y)</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                                    Active Account
                                </label>
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input type="checkbox" checked={form.data.is_owner} onChange={(e) => form.setData('is_owner', e.target.checked)} />
                                    Is Owner
                                </label>
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input type="checkbox" checked={form.data.is_vendor_rep} onChange={(e) => form.setData('is_vendor_rep', e.target.checked)} />
                                    Vendor Rep
                                </label>
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input type="checkbox" checked={form.data.can_message} onChange={(e) => form.setData('can_message', e.target.checked)} />
                                    Can Message
                                </label>
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {editing ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
