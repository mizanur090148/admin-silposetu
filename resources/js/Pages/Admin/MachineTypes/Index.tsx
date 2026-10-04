import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Cpu,
    Plus,
    Upload,
    Download,
    Search,
    Check,
    X,
    Trash2,
    Edit2,
    ToggleLeft,
    ToggleRight,
    Filter,
    Layers,
    Scissors,
    Sparkles,
    FileSpreadsheet
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { MachineType, PaginatedData } from '@/types';

interface Props {
    machineTypes: PaginatedData<MachineType>;
    categories: Record<string, string>;
    defaultUnits: string[];
    categoryCounts: Record<string, number>;
    totalCount: number;
    stats?: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        category: string;
        search: string;
        status?: string;
        per_page?: number;
    };
}

export default function Index({
    machineTypes,
    categories,
    defaultUnits,
    categoryCounts,
    totalCount,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingMachine, setEditingMachine] = useState<MachineType | null>(null);

    // Single Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: adding, errors: addErrors, reset: resetAdd } = useForm({
        category: Object.keys(categories)[0] || 'knitting',
        name: '',
        brand_or_model: '',
        default_unit: 'Kg',
        sort_order: (stats?.total || totalCount || 0) + 1,
        is_active: true,
    });

    // Single Edit Form
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: updating,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        category: 'knitting',
        name: '',
        brand_or_model: '',
        default_unit: 'Kg',
        sort_order: 1,
        is_active: true,
    });

    // Bulk Import Form
    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.machine-types.index'), {
            ...filters,
            search,
            page: 1,
        }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            route('admin.machine-types.index'),
            {
                ...filters,
                status,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleCategoryFilter = (cat: string) => {
        router.get(route('admin.machine-types.index'), {
            ...filters,
            category: cat,
            page: 1,
        }, { preserveState: true });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(route('admin.machine-types.index'), {
            ...filters,
            per_page: perPage,
            page: 1,
        }, { preserveState: true });
    };

    const handleToggle = (id: number) => {
        router.post(route('admin.machine-types.toggle', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete machine type '${name}'?`)) {
            router.delete(route('admin.machine-types.destroy', id), { preserveScroll: true });
        }
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('admin.machine-types.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const startEditing = (item: MachineType) => {
        setEditingMachine(item);
        setEditData({
            category: item.category,
            name: item.name,
            brand_or_model: item.brand_or_model || '',
            default_unit: item.default_unit || 'Kg',
            sort_order: item.sort_order ?? 1,
            is_active: Boolean(item.is_active),
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMachine) return;

        putEdit(route('admin.machine-types.update', editingMachine.id), {
            onSuccess: () => {
                setEditingMachine(null);
                resetEdit();
            },
        });
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importData.file) {
            alert('Please select a CSV file to upload.');
            return;
        }
        postImport(route('admin.machine-types.import'), {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
    };

    return (
        <AdminLayout title="Machine Types Master Data">
            <Head title="Machine Types Master Data - Shilposetu Admin" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Machine Types Master Directory</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Configure standard textile machinery models, units, and categories available for factory capacity profiles.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            <span>Bulk Upload CSV</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition transform active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Machine Type</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar with Status Tabs like Knitting Types */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search knitting machinery by name..."
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

                {/* Machine Types Table */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
                    {machineTypes.data.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                            <Cpu className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                            <span>No {filters.status && filters.status !== 'all' ? `${filters.status} ` : ''}knitting machinery found.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-4">Machine Name</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        <th className="py-2.5 px-3">Sort Order</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {machineTypes.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">
                                                {item.name}
                                            </td>
                                            <td className="py-2 px-3">
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-slate-700/60">
                                                    {categories[item.category] || item.category}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">
                                                {item.sort_order}
                                            </td>
                                            <td className="py-2 px-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(item.id)}
                                                    className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                                >
                                                    {item.is_active ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <ToggleRight className="w-4 h-4" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                            <ToggleLeft className="w-4 h-4" /> Inactive
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(item)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                                        title="Edit machine type"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                                        title="Delete machine type"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Server-Side Pagination */}
                    <Pagination
                        links={machineTypes.links}
                        from={machineTypes.from}
                        to={machineTypes.to}
                        total={machineTypes.total}
                        perPage={filters.per_page || machineTypes.per_page}
                        onPerPageChange={handlePerPageChange}
                        itemName="machine types"
                    />
                </div>

                {/* MODAL: ADD MACHINE TYPE */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                    <span>Add New Machine Type</span>
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitAdd} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Department Category <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <select
                                        value={addData.category}
                                        onChange={e => setAddData('category', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    >
                                        {Object.entries(categories).map(([k, label]) => (
                                            <option key={k} value={k}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Machine Name / Model <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={addData.name}
                                        onChange={e => setAddData('name', e.target.value)}
                                        placeholder="e.g. Single Jersey Circular Knitting Machine"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    />
                                    {addErrors.name && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{addErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={addData.sort_order}
                                        onChange={e => setAddData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={addData.is_active}
                                            onChange={e => setAddData('is_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-2 text-xs text-slate-700 dark:text-slate-300">Active</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition cursor-pointer"
                                    >
                                        {adding ? 'Saving...' : 'Add Machine'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: EDIT MACHINE TYPE */}
                {editingMachine && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span>Edit Machine Type: {editingMachine.name}</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingMachine(null);
                                        resetEdit();
                                    }}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitEdit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Department Category <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <select
                                        value={editData.category}
                                        onChange={e => setEditData('category', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    >
                                        {Object.entries(categories).map(([k, label]) => (
                                            <option key={k} value={k}>{label}</option>
                                        ))}
                                    </select>
                                    {editErrors.category && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{editErrors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Machine Name / Model <span className="text-rose-500 dark:text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editData.name}
                                        onChange={e => setEditData('name', e.target.value)}
                                        placeholder="e.g. Single Jersey Circular Knitting Machine"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                    />
                                    {editErrors.name && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{editErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={editData.sort_order}
                                        onChange={e => setEditData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                    />
                                    {editErrors.sort_order && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{editErrors.sort_order}</p>}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editData.is_active}
                                            onChange={e => setEditData('is_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Active</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingMachine(null);
                                            resetEdit();
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {updating ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: BULK IMPORT MACHINE TYPES */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                    <span>Bulk Import Machine Types</span>
                                </h3>
                                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={submitImport} className="space-y-4 text-xs">
                                <div>
                                    <a
                                        href={route('admin.machine-types.template')}
                                        download
                                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Sample Machine Types CSV Template</span>
                                    </a>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                        Select CSV File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        required
                                        onChange={e => setImportData('file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 transition"
                                    />
                                    {importErrors.file && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1">{importErrors.file}</p>}
                                </div>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Columns expected: <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">category, name, brand_or_model, default_unit, sort_order, is_active</code>.
                                </p>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowImportModal(false)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importing || !importData.file}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50 transition cursor-pointer"
                                    >
                                        {importing ? 'Importing...' : 'Upload & Import'}
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
