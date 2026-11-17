import React, { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { CheckCircle2, Handshake, Pencil, Plus, Search, Trash2, Users, Wallet, X } from 'lucide-react';
import { PaginatedData, Partner, UserRef } from '@/types';

interface PartnerUserRow {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    partner_code: string | null;
    is_active: boolean;
}

interface Props {
    partners: PaginatedData<Partner>;
    partnerUsers?: PartnerUserRow[];
    existingPartnerUserIds?: number[];
    existingPartnerCodes?: string[];
    summary: {
        total_partners: number;
        total_referrals: number;
        total_commission_tk: number;
        balance_commission_tk: number;
    };
    users: UserRef[];
    filters: {
        search: string;
        payout_method: string;
        per_page: number;
    };
}

export default function Index({
    partners,
    partnerUsers = [],
    existingPartnerUserIds = [],
    existingPartnerCodes = [],
    summary,
    users,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [payoutPartner, setPayoutPartner] = useState<Partner | null>(null);

    const payoutForm = useForm({
        amount_tk: '',
    });

    const form = useForm({
        user_id: '',
        partner_code: '',
        total_referrals: 0,
        active_factories_count: 0,
        total_commission_tk: '0',
        withdrawn_commission_tk: '0',
        balance_commission_tk: '0',
        payout_method: 'bkash',
        payout_number: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.partners.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: '',
            partner_code: '',
            total_referrals: 0,
            active_factories_count: 0,
            total_commission_tk: '0',
            withdrawn_commission_tk: '0',
            balance_commission_tk: '0',
            payout_method: 'bkash',
            payout_number: '',
        });
        setShowModal(true);
    };

    const openEdit = (p: Partner) => {
        setEditing(p);
        form.clearErrors();
        form.setData({
            user_id: p.user_id ? String(p.user_id) : '',
            partner_code: p.partner_code,
            total_referrals: p.total_referrals,
            active_factories_count: p.active_factories_count,
            total_commission_tk: String(p.total_commission_tk),
            withdrawn_commission_tk: String(p.withdrawn_commission_tk),
            balance_commission_tk: String(p.balance_commission_tk),
            payout_method: p.payout_method,
            payout_number: p.payout_number || '',
        });
        setShowModal(true);
    };

    const openCreateFromUser = (u: PartnerUserRow) => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            user_id: String(u.id),
            partner_code: u.partner_code || `PTR-${String(u.id).padStart(3, '0')}`,
            total_referrals: 0,
            active_factories_count: 0,
            total_commission_tk: '0',
            withdrawn_commission_tk: '0',
            balance_commission_tk: '0',
            payout_method: 'bkash',
            payout_number: u.phone || '',
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.partners.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.partners.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (p: Partner) => {
        if (!confirm(`Delete partner ${p.partner_code}?`)) {
            return;
        }
        router.delete(route('admin.partners.destroy', p.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Referral Partners">
            <Head title="Partners" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Total Partners', val: summary.total_partners, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Total Referrals', val: summary.total_referrals, cls: 'text-blue-600' },
                        {
                            label: 'Total Commission',
                            val: `৳${Number(summary.total_commission_tk).toLocaleString()}`,
                            cls: 'text-emerald-600',
                        },
                        {
                            label: 'Pending Balance',
                            val: `৳${Number(summary.balance_commission_tk).toLocaleString()}`,
                            cls: 'text-amber-600',
                        },
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
                                placeholder="Search partner code, payout number, user name/phone..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.payout_method}
                            onChange={(e) => applyFilter({ payout_method: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Payout Methods</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="bank">Bank</option>
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
                        <Plus className="w-3.5 h-3.5" /> Add Partner
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Partner Code & User</th>
                                    <th className="py-3 px-4">Referrals & Active Factories</th>
                                    <th className="py-3 px-4">Commission Ledger</th>
                                    <th className="py-3 px-4">Payout Info</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {partners.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                                {p.partner_code}
                                            </span>
                                            {p.user ? (
                                                <div className="mt-0.5">
                                                    <p className="font-semibold text-slate-900 dark:text-white">{p.user.name}</p>
                                                    <p className="text-[11px] text-slate-500">{p.user.phone}</p>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-slate-400">Unlinked partner</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">{p.total_referrals} referrals</p>
                                            <p className="text-[11px] text-slate-500">{p.active_factories_count} active factories</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                Total: ৳{Number(p.total_commission_tk).toLocaleString()}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Withdrawn: ৳{Number(p.withdrawn_commission_tk).toLocaleString()} • Balance:{' '}
                                                <span className="font-bold text-amber-600">
                                                    ৳{Number(p.balance_commission_tk).toLocaleString()}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold uppercase">
                                                {p.payout_method}
                                            </span>
                                            <p className="text-[11px] text-slate-500 mt-1">{p.payout_number || '—'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {Number(p.balance_commission_tk) > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPayoutPartner(p);
                                                            payoutForm.setData('amount_tk', String(p.balance_commission_tk));
                                                        }}
                                                        title="Record Commission Payout"
                                                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500"
                                                    >
                                                        <Wallet className="w-3 h-3" /> Payout
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(p)}
                                                    title="Edit Partner"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p)}
                                                    title="Delete Partner"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {partners.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <Handshake className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No partners found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={partners.links}
                        from={partners.from ?? 0}
                        to={partners.to ?? 0}
                        total={partners.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>

                {/* Partner Role User Accounts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Partner User Accounts (`role = par`, {partnerUsers.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Partner User</th>
                                    <th className="py-3 px-4">Phone &amp; Email</th>
                                    <th className="py-3 px-4">Code / Status</th>
                                    <th className="py-3 px-4 text-right">Ledger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {partnerUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                                        <td className="py-3 px-4">
                                            {u.phone} {u.email ? `· ${u.email}` : ''}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono">{u.partner_code || 'No code yet'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {existingPartnerUserIds.includes(u.id) || (u.partner_code && existingPartnerCodes.includes(u.partner_code)) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Ledger Active
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openCreateFromUser(u)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-500"
                                                >
                                                    <Plus className="w-3 h-3" /> Setup Partner Ledger
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {partnerUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400">
                                            No partner user accounts found.
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
                                {editing ? `Edit Partner: ${editing.partner_code}` : 'Add Partner'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Partner Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.partner_code}
                                    onChange={(e) => form.setData('partner_code', e.target.value)}
                                    placeholder="e.g. PTR-101"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.partner_code && <p className="text-rose-500 text-[11px] mt-1">{form.errors.partner_code}</p>}
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
                                <label className="block font-semibold mb-1">Total Referrals *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={form.data.total_referrals}
                                    onChange={(e) => form.setData('total_referrals', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Active Factories *</label>
                                <input
                                    type="number"
                                    min={0}
                                    required
                                    value={form.data.active_factories_count}
                                    onChange={(e) => form.setData('active_factories_count', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Total Commission (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={form.data.total_commission_tk}
                                    onChange={(e) => form.setData('total_commission_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Withdrawn Commission (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={form.data.withdrawn_commission_tk}
                                    onChange={(e) => form.setData('withdrawn_commission_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Balance Commission (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={form.data.balance_commission_tk}
                                    onChange={(e) => form.setData('balance_commission_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Payout Method *</label>
                                <input
                                    type="text"
                                    required
                                    list="payout-methods"
                                    value={form.data.payout_method}
                                    onChange={(e) => form.setData('payout_method', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="payout-methods">
                                    <option value="bkash" />
                                    <option value="nagad" />
                                    <option value="rocket" />
                                    <option value="bank" />
                                </datalist>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Payout Number / Account</label>
                                <input
                                    type="text"
                                    value={form.data.payout_number}
                                    onChange={(e) => form.setData('payout_number', e.target.value)}
                                    placeholder="e.g. 017XXXXXXXX"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
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
                                    {editing ? 'Update Partner' : 'Create Partner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {payoutPartner && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Record Commission Payout: {payoutPartner.partner_code}</h3>
                            <button type="button" onClick={() => setPayoutPartner(null)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                payoutForm.post(route('admin.partners.payout', payoutPartner.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setPayoutPartner(null),
                                });
                            }}
                            className="p-5 space-y-4 text-xs"
                        >
                            <p className="text-slate-500">
                                Available balance: <span className="font-bold text-emerald-600">৳{Number(payoutPartner.balance_commission_tk).toLocaleString()}</span> · Method:{' '}
                                <span className="uppercase font-semibold">{payoutPartner.payout_method}</span> ({payoutPartner.payout_number || 'N/A'})
                            </p>
                            <div>
                                <label className="block font-semibold mb-1">Payout Amount (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={1}
                                    required
                                    value={payoutForm.data.amount_tk}
                                    onChange={(e) => payoutForm.setData('amount_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {payoutForm.errors.amount_tk && <p className="text-rose-500 mt-1">{payoutForm.errors.amount_tk}</p>}
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setPayoutPartner(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={payoutForm.processing} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
                                    Confirm Payout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
