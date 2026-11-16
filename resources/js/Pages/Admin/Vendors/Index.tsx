import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Building2, CheckCircle2, Pencil, Plus, Search, Store, Trash2, Users, X } from 'lucide-react';
import { FactoryRef, PaginatedData, UserRef, Vendor } from '@/types';

interface VendorPartyRow {
    id: number;
    factory_id: number;
    code: string;
    name: string;
    type: string;
    address: string | null;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    default_rate_tk: string | number;
    payment_terms: string;
    opening_balance: string | number;
    is_active: boolean;
    subcontract_orders_count?: number;
    factory?: FactoryRef | null;
}

interface VendorUserRow {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    designation: string | null;
    organization_name: string | null;
    factory_id: number | null;
    vendor_id: number | null;
    is_vendor_rep: boolean;
    is_active: boolean;
    factory?: FactoryRef | null;
}

interface Props {
    vendors: PaginatedData<Vendor>;
    vendorParties?: VendorPartyRow[];
    vendorUsers?: VendorUserRow[];
    counts: {
        total: number;
        verified: number;
        parties?: number;
        vendor_users?: number;
    };
    users: UserRef[];
    factories: FactoryRef[];
    filters: {
        search: string;
        is_verified: string;
        per_page: number;
    };
}

export default function Index({ vendors, vendorParties = [], vendorUsers = [], counts, users, factories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Vendor | null>(null);

    const form = useForm({
        user_id: '',
        factory_id: '',
        code: '',
        name: '',
        type: 'buying_house',
        contact_person: '',
        phone: '',
        email: '',
        area: '',
        address: '',
        is_verified: true,
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.vendors.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: '',
            factory_id: '',
            code: '',
            name: '',
            type: 'buying_house',
            contact_person: '',
            phone: '',
            email: '',
            area: '',
            address: '',
            is_verified: true,
        });
        setShowModal(true);
    };

    const openEdit = (v: Vendor) => {
        setEditing(v);
        form.clearErrors();
        form.setData({
            user_id: v.user_id ? String(v.user_id) : '',
            factory_id: v.factory_id ? String(v.factory_id) : '',
            code: v.code,
            name: v.name,
            type: v.type,
            contact_person: v.contact_person || '',
            phone: v.phone || '',
            email: v.email || '',
            area: v.area || '',
            address: v.address || '',
            is_verified: v.is_verified,
        });
        setShowModal(true);
    };

    const openCreateFromParty = (party: VendorPartyRow) => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: '',
            factory_id: String(party.factory_id),
            code: party.code,
            name: party.name,
            type: 'buying_house',
            contact_person: party.contact_person || '',
            phone: party.phone || '',
            email: party.email || '',
            area: party.factory?.area || '',
            address: party.address || '',
            is_verified: true,
        });
        setShowModal(true);
    };

    const openCreateFromUser = (u: VendorUserRow) => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: String(u.id),
            factory_id: u.factory_id ? String(u.factory_id) : '',
            code: `VEN-${String(u.id).padStart(3, '0')}`,
            name: u.organization_name || u.name,
            type: 'buying_house',
            contact_person: u.name,
            phone: u.phone || '',
            email: u.email || '',
            area: '',
            address: '',
            is_verified: true,
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.vendors.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.vendors.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (v: Vendor) => {
        if (!confirm(`Delete vendor "${v.name}" (${v.code})?`)) {
            return;
        }
        router.delete(route('admin.vendors.destroy', v.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Vendors & Buying Houses">
            <Head title="Vendors" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                        <p className="text-[11px] text-slate-500">Directory Profiles</p>
                        <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.total}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                        <p className="text-[11px] text-slate-500">Verified Profiles</p>
                        <p className="text-xl font-bold mt-1 text-emerald-600">{counts.verified}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                        <p className="text-[11px] text-slate-500">Factory Vendor Parties</p>
                        <p className="text-xl font-bold mt-1 text-blue-600">{counts.parties ?? vendorParties.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                        <p className="text-[11px] text-slate-500">Vendor Rep Accounts</p>
                        <p className="text-xl font-bold mt-1 text-indigo-600">{counts.vendor_users ?? vendorUsers.length}</p>
                    </div>
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
                                placeholder="Search vendor code, name, contact, phone, area..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.is_verified}
                            onChange={(e) => applyFilter({ is_verified: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Status</option>
                            <option value="1">Verified Only</option>
                            <option value="0">Unverified Only</option>
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
                        <Plus className="w-3.5 h-3.5" /> Add Vendor
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Code & Name</th>
                                    <th className="py-3 px-4">Type & Contact</th>
                                    <th className="py-3 px-4">Area & Address</th>
                                    <th className="py-3 px-4">Linked User / Factory</th>
                                    <th className="py-3 px-4">Verified</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {vendors.data.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {v.code}
                                            </span>
                                            <p className="font-bold text-slate-900 dark:text-white">{v.name}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                                                {v.type}
                                            </span>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {v.contact_person || '—'} {v.phone ? `• ${v.phone}` : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[220px]">
                                            <p className="font-medium">{v.area || '—'}</p>
                                            {v.address && <p className="text-[11px] text-slate-400 truncate">{v.address}</p>}
                                        </td>
                                        <td className="py-3 px-4">
                                            {v.user ? (
                                                <p className="text-[11px]">
                                                    User: <span className="font-semibold">{v.user.name}</span>
                                                </p>
                                            ) : null}
                                            {v.factory ? (
                                                <Link
                                                    href={route('admin.factories.show', v.factory.id)}
                                                    className="text-[11px] text-blue-600 hover:underline block"
                                                >
                                                    {v.factory.code} — {v.factory.name}
                                                </Link>
                                            ) : null}
                                            {!v.user && !v.factory && <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => router.post(route('admin.vendors.toggleVerified', v.id), {}, { preserveScroll: true })}
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                    v.is_verified
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                {v.is_verified ? 'Verified' : 'Unverified'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(v)}
                                                    title="Edit Vendor"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(v)}
                                                    title="Delete Vendor"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {vendors.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No vendors found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={vendors.links}
                        from={vendors.from ?? 0}
                        to={vendors.to ?? 0}
                        total={vendors.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>

                {/* Factory Vendor Parties (from parties table where type = 'ven') */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <Store className="w-4 h-4 text-blue-600" />
                                Factory Vendor Parties ({vendorParties.length})
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Buying houses &amp; buyers recorded by factories (`parties` table with `type = ven`).
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Code &amp; Vendor Party</th>
                                    <th className="py-3 px-4">Contact &amp; Address</th>
                                    <th className="py-3 px-4">Factory &amp; Orders</th>
                                    <th className="py-3 px-4">Rate &amp; Terms</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Directory</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {vendorParties.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-[11px] text-blue-600">{p.code}</span>
                                            <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[240px]">
                                            <p>{p.contact_person || '—'}</p>
                                            <p className="text-[11px] text-slate-500">{p.phone || '—'}</p>
                                            {p.address && <p className="text-[11px] text-slate-400 truncate">{p.address}</p>}
                                        </td>
                                        <td className="py-3 px-4">
                                            {p.factory ? (
                                                <Link href={route('admin.factories.show', p.factory.id)} className="font-semibold text-blue-600 hover:underline block">
                                                    {p.factory.code} — {p.factory.name}
                                                </Link>
                                            ) : (
                                                <span>Factory #{p.factory_id}</span>
                                            )}
                                            <p className="text-[11px] text-slate-500">{p.subcontract_orders_count ?? 0} orders</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">৳{p.default_rate_tk}/kg</p>
                                            <p className="text-[11px] text-slate-500">{p.payment_terms}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                    p.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                }`}
                                            >
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openCreateFromParty(p)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-semibold hover:bg-slate-800"
                                            >
                                                <Plus className="w-3 h-3" /> Add to Directory
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {vendorParties.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">
                                            No factory vendor parties found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vendor Rep User Accounts (from users where role = 'ven' or is_vendor_rep) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Vendor Rep User Accounts ({vendorUsers.length})
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            User accounts with `role = ven` or `is_vendor_rep = true`.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">User &amp; Contact</th>
                                    <th className="py-3 px-4">Organization</th>
                                    <th className="py-3 px-4">Linked Factory</th>
                                    <th className="py-3 px-4">Directory Link</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {vendorUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {u.phone} {u.email ? `· ${u.email}` : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">{u.organization_name || '—'}</p>
                                            <p className="text-[11px] text-slate-500">{u.designation || u.role}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {u.factory ? (
                                                <Link href={route('admin.factories.show', u.factory.id)} className="text-blue-600 font-semibold hover:underline">
                                                    {u.factory.code} — {u.factory.name}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {u.vendor_id ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-[11px]">
                                                    Linked (#{u.vendor_id})
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-bold text-[11px]">
                                                    Not in directory
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {!u.vendor_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => openCreateFromUser(u)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500"
                                                >
                                                    <Plus className="w-3 h-3" /> Create Profile
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {vendorUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            No vendor user accounts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editing ? `Edit Vendor: ${editing.name}` : 'Add Vendor'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Vendor Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    placeholder="e.g. VEN-001"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.code && <p className="text-rose-500 text-[11px] mt-1">{form.errors.code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Type *</label>
                                <input
                                    type="text"
                                    required
                                    list="vendor-types"
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="vendor-types">
                                    <option value="buying_house" />
                                    <option value="garments" />
                                    <option value="exporter" />
                                    <option value="merchant" />
                                </datalist>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Vendor Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.name && <p className="text-rose-500 text-[11px] mt-1">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    value={form.data.contact_person}
                                    onChange={(e) => form.setData('contact_person', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Area</label>
                                <input
                                    type="text"
                                    value={form.data.area}
                                    onChange={(e) => form.setData('area', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Address</label>
                                <input
                                    type="text"
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Linked User</label>
                                <select
                                    value={form.data.user_id}
                                    onChange={(e) => form.setData('user_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Primary Factory</label>
                                <select
                                    value={form.data.factory_id}
                                    onChange={(e) => form.setData('factory_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="">None</option>
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 pt-1">
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_verified}
                                        onChange={(e) => form.setData('is_verified', e.target.checked)}
                                    />
                                    Verified Vendor
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
                                    {editing ? 'Update Vendor' : 'Create Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
