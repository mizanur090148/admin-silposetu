import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Layers,
    Plus,
    Search,
    Check,
    X,
    Trash2,
    Edit2,
    ToggleLeft,
    ToggleRight,
    Building2,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { KnittingType, PaginatedData } from '@/types';

interface Props {
    knittingTypes: PaginatedData<KnittingType>;
    filters: {
        search: string;
        status: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function Index({
    knittingTypes,
    filters,
    stats,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingType, setEditingType] = useState<KnittingType | null>(null);

    // Single Add Form
    const {
        data: addData,
        setData: setAddData,
        post: postAdd,
        processing: adding,
        errors: addErrors,
        reset: resetAdd,
    } = useForm({
        name: '',
        slug: '',
        description: '',
        sort_order: (stats.total || 0) + 1,
        is_active: true,
    });

    // Single Edit Form
    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        slug: '',
        description: '',
        sort_order: 1,
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.knitting-types.index'),
            {
                ...filters,
                search,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            route('admin.knitting-types.index'),
            {
                ...filters,
                status,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleToggle = (id: number) => {
        router.post(route('admin.knitting-types.toggle', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string, factoriesCount?: number) => {
        const warning = factoriesCount && factoriesCount > 0
            ? `Warning: This knitting type is currently linked to ${factoriesCount} factory/factories. Deleting it will unlink it from them. Continue?`
            : `Are you sure you want to delete knitting type '${name}'?`;

        if (confirm(warning)) {
            router.delete(route('admin.knitting-types.destroy', id), { preserveScroll: true });
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('admin.knitting-types.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const startEditing = (type: KnittingType) => {
        setEditingType(type);
        setEditData({
            name: type.name,
            slug: type.slug,
            description: type.description || '',
            sort_order: type.sort_order,
            is_active: type.is_active,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingType) return;

        postEdit(route('admin.knitting-types.update', editingType.id), {
            onSuccess: () => {
                setEditingType(null);
                resetEdit();
            },
        });
    };

    return (
        <AdminLayout title="Knitting Types Master Data">
            <Head title="Knitting Types Master Data - Shilposetu Admin" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Knitting Types</h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 dark:border-blue-500/30">
                                Master Data
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Configure fabric classifications (Single Jersey, Interlock, Rib, Fleece, etc.) used across factories and frontend marketplace categories.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => {
                                setAddData('sort_order', stats.total + 1);
                                setShowAddModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Knitting Type</span>
                        </button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Types</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.total}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Fabrics & knit classifications</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active (Public)</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.active}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Visible on registration & filters</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inactive (Hidden)</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.inactive}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Draft or unlisted types</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, slug, description..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                        />
                    </form>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
                        {(['all', 'active', 'inactive'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                                    (filters.status || 'all') === st
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Knitting Types Data Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4">Knitting Type Name</th>
                                    <th className="py-3 px-4">Identifier / Slug</th>
                                    <th className="py-3 px-4">Description & Fabric Scope</th>
                                    <th className="py-3 px-4 text-center">Factories</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {knittingTypes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-semibold">No knitting types found</p>
                                            <p className="text-xs mt-1">Try changing filters or add a new knitting type.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    knittingTypes.data.map((type, idx) => (
                                        <tr key={type.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                            <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                                                {type.sort_order}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                                    <span>{type.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    {type.slug}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                                                <p className="line-clamp-2 leading-relaxed">
                                                    {type.description || <span className="text-slate-400 italic">No description provided</span>}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20">
                                                    <Building2 className="w-3 h-3" />
                                                    <span>{type.factories_count || 0}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(type.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                                        type.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                                    }`}
                                                    title="Click to toggle status"
                                                >
                                                    {type.is_active ? (
                                                        <>
                                                            <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Inactive</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => startEditing(type)}
                                                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                                                        title="Edit Knitting Type"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(type.id, type.name, type.factories_count)}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Delete Knitting Type"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {knittingTypes.total > knittingTypes.per_page && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <Pagination links={knittingTypes.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Knitting Type</h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Knitting Type Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addData.name}
                                    onChange={(e) => setAddData('name', e.target.value)}
                                    placeholder="e.g. Single Jersey, Interlock, Rib"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                                {addErrors.name && <p className="text-rose-500 text-[10px] mt-1">{addErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Slug / Code <span className="text-slate-400 font-normal">(Auto-generated if blank)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addData.slug}
                                        onChange={(e) => setAddData('slug', e.target.value)}
                                        placeholder="e.g. single-jersey"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                                    />
                                    {addErrors.slug && <p className="text-rose-500 text-[10px] mt-1">{addErrors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={addData.sort_order}
                                        onChange={(e) => setAddData('sort_order', Number(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Description & Fabric Scope
                                </label>
                                <textarea
                                    rows={3}
                                    value={addData.description}
                                    onChange={(e) => setAddData('description', e.target.value)}
                                    placeholder="Explain typical yarn combinations, fabric textures, GSM, or end garment uses..."
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={addData.is_active}
                                        onChange={(e) => setAddData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Active & Visible in Platform
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {adding ? 'Saving...' : 'Save Knitting Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Edit2 className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Edit Knitting Type: {editingType.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingType(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Knitting Type Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                                {editErrors.name && <p className="text-rose-500 text-[10px] mt-1">{editErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Slug / Code <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editData.slug}
                                        onChange={(e) => setEditData('slug', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                                    />
                                    {editErrors.slug && <p className="text-rose-500 text-[10px] mt-1">{editErrors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editData.sort_order}
                                        onChange={(e) => setEditData('sort_order', Number(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Description & Fabric Scope
                                </label>
                                <textarea
                                    rows={3}
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_active}
                                        onChange={(e) => setEditData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Active & Visible in Platform
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingType(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editing}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {editing ? 'Updating...' : 'Update Knitting Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
