import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Cog,
    Plus,
    Search,
    Check,
    X,
    Trash2,
    Edit2,
    ToggleLeft,
    ToggleRight,
    Filter,
    Cpu,
    RotateCcw,
    AlertTriangle,
    Layers,
    User,
    Gauge,
    Hash
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import SearchableSelect, { SearchableOption } from '@/Components/SearchableSelect';
import { Machine, MachineType, PaginatedData } from '@/types';

interface Props {
    machines: PaginatedData<Machine>;
    machineTypes: MachineType[];
    defaultUnits: string[];
    stats: {
        total: number;
        active: number;
        inactive: number;
        trashed: number;
    };
    filters: {
        search: string;
        status: string;
        machine_type_id: string;
        per_page?: number;
    };
}

export default function Index({
    machines,
    machineTypes,
    defaultUnits,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [machineTypeId, setMachineTypeId] = useState(filters.machine_type_id || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

    const machineTypeOptions: SearchableOption[] = machineTypes.map((t) => ({
        value: t.id.toString(),
        label: t.name,
        subLabel: t.brand_or_model || undefined,
        category: t.category,
    }));

    // Add Machine Form
    const {
        data: addData,
        setData: setAddData,
        post: postAdd,
        processing: adding,
        errors: addErrors,
        reset: resetAdd
    } = useForm({
        name: '',
        machine_type_id: machineTypes[0]?.id?.toString() || '',
        cph: '25.00',
        unit: 'Kg',
        brand_or_model: '',
        serial_number: '',
        notes: '',
        sort_order: (stats.total || 0) + 1,
        is_active: true,
    });

    // Edit Machine Form
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: updating,
        errors: editErrors,
        reset: resetEdit
    } = useForm({
        name: '',
        machine_type_id: '',
        cph: '0.00',
        unit: 'Kg',
        brand_or_model: '',
        serial_number: '',
        notes: '',
        sort_order: 0,
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.machines.index'), {
            ...filters,
            search,
            machine_type_id: machineTypeId,
            page: 1,
        }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            route('admin.machines.index'),
            {
                ...filters,
                status,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleTypeFilter = (typeId: string) => {
        setMachineTypeId(typeId);
        router.get(
            route('admin.machines.index'),
            {
                ...filters,
                machine_type_id: typeId,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        router.get(
            route('admin.machines.index'),
            {
                ...filters,
                per_page: newPerPage,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('admin.machines.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const openEditModal = (machine: Machine) => {
        setEditingMachine(machine);
        setEditData({
            name: machine.name,
            machine_type_id: machine.machine_type_id?.toString() || '',
            cph: machine.cph?.toString() || '0.00',
            unit: machine.unit || 'Kg',
            brand_or_model: machine.brand_or_model || '',
            serial_number: machine.serial_number || '',
            notes: machine.notes || '',
            sort_order: machine.sort_order ?? 0,
            is_active: machine.is_active,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMachine) return;
        putEdit(route('admin.machines.update', editingMachine.id), {
            onSuccess: () => {
                setEditingMachine(null);
                resetEdit();
            },
        });
    };

    const handleToggle = (id: number) => {
        router.post(route('admin.machines.toggle', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to move machine '${name}' to trash?`)) {
            router.delete(route('admin.machines.destroy', id), { preserveScroll: true });
        }
    };

    const handleRestore = (id: number, name: string) => {
        if (confirm(`Restore machine '${name}' from trash?`)) {
            router.post(route('admin.machines.restore', id), {}, { preserveScroll: true });
        }
    };

    const handleForceDelete = (id: number, name: string) => {
        if (confirm(`PERMANENT DELETION: Are you sure you want to permanently delete machine '${name}'? This cannot be undone.`)) {
            router.delete(route('admin.machines.forceDelete', id), { preserveScroll: true });
        }
    };

    const isTrashedFilter = filters.status === 'trashed';

    return (
        <AdminLayout title="Machines Master Data">
            <Head title="Machines Master Data - Shilposetu Admin" />

            <div className="space-y-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Machines Directory</h1>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                {stats.total} Total
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Physical & catalog machines inventory with capacity per hour (CPH) and machine types.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Machine</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar with Status Tabs (like Machine Types) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="relative w-full lg:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search machines by name, model, serial..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Machine Type Filter */}
                        <div className="w-full sm:w-60">
                            <SearchableSelect
                                options={[
                                    { value: '', label: `All Machine Types (${machineTypes.length})` },
                                    ...machineTypeOptions,
                                ]}
                                value={machineTypeId}
                                onChange={(val) => handleTypeFilter(val)}
                                placeholder="All Machine Types..."
                                searchPlaceholder="Search machine types..."
                            />
                        </div>

                        {/* Status Tabs like Machine Types */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
                            {(['all', 'active', 'inactive', 'trashed'] as const).map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusFilter(st)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer flex items-center gap-1.5 ${
                                        (filters.status || 'all') === st
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{st === 'trashed' ? 'Trash' : st}</span>
                                    {stats && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            (filters.status || 'all') === st
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                            {st === 'trashed' ? stats.trashed : st === 'active' ? stats.active : st === 'inactive' ? stats.inactive : stats.total}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {(search || machineTypeId || (filters.status && filters.status !== 'all')) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setMachineTypeId('');
                                    router.get(route('admin.machines.index'));
                                }}
                                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Machines Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-4 py-3 w-16">Sort</th>
                                    <th className="px-4 py-3">Machine Details</th>
                                    <th className="px-4 py-3">Machine Type</th>
                                    <th className="px-4 py-3">Capacity (CPH)</th>
                                    <th className="px-4 py-3">Created By</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {machines.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                            <Cog className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600 animate-spin-slow" />
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No machines found</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {isTrashedFilter ? 'Trash is empty.' : 'Try adjusting filters or create a new machine.'}
                                            </p>
                                            {!isTrashedFilter && (
                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add New Machine</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    machines.data.map((m) => (
                                        <tr
                                            key={m.id}
                                            className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                                                m.deleted_at ? 'bg-rose-50/20 dark:bg-rose-950/10 opacity-75' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                                                #{m.sort_order ?? m.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{m.name}</span>
                                                    {m.serial_number && (
                                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            {m.serial_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                                    {m.brand_or_model ? (
                                                        <span>{m.brand_or_model}</span>
                                                    ) : (
                                                        <span className="italic text-slate-400">No brand specified</span>
                                                    )}
                                                    {m.notes && (
                                                        <span className="text-[10px] text-slate-400 max-w-xs truncate" title={m.notes}>
                                                            • {m.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {m.machine_type ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-semibold">
                                                        <Cpu className="w-3 h-3 text-indigo-500" />
                                                        <span>{m.machine_type.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0E6B66] dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/50">
                                                    <Gauge className="w-3.5 h-3.5 text-teal-600" />
                                                    <span className="font-mono font-bold text-xs">
                                                        {parseFloat(m.cph?.toString() || '0').toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                                                        {m.unit || 'Kg'}/hr
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span>{m.created_by?.name || 'System'}</span>
                                                </div>
                                                {m.created_at && (
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                        {new Date(m.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {m.deleted_at ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                        Trashed
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(m.id)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                                                            m.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                        title="Click to toggle status"
                                                    >
                                                        {m.is_active ? (
                                                            <>
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                                <span>Active</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="w-3 h-3 text-slate-400" />
                                                                <span>Inactive</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    {m.deleted_at ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestore(m.id, m.name)}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                                                                title="Restore Machine"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleForceDelete(m.id, m.name)}
                                                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                                title="Permanently Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(m)}
                                                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                                title="Edit Machine"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(m.id, m.name)}
                                                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                                title="Move to Trash (Soft Delete)"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Server-Side Pagination */}
                    <Pagination
                        links={machines.links}
                        from={machines.from}
                        to={machines.to}
                        total={machines.total}
                        perPage={filters.per_page || machines.per_page}
                        onPerPageChange={handlePerPageChange}
                        itemName="machines"
                    />
                </div>

                {/* MODAL: ADD MACHINE */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/90 dark:border-slate-800 max-w-xl w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] relative max-h-[92vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            Add New Machine
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Register industrial machinery specifications and hourly capacity.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="space-y-4 mt-5 text-xs">
                                {/* Row 1: Machine Name */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-slate-700 dark:text-slate-300">
                                            Machine Name / Model <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-slate-400">Primary Identifier</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={addData.name}
                                        onChange={(e) => setAddData('name', e.target.value)}
                                        placeholder="e.g. Terrot S3P-172 Circular Knitting 30''"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                                    />
                                    {addErrors.name && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{addErrors.name}</p>}
                                </div>

                                {/* Row 2: Machine Type (Full Row) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-slate-700 dark:text-slate-300">
                                            Machine Type <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                                            Searchable Directory
                                        </span>
                                    </div>
                                    <SearchableSelect
                                        options={machineTypeOptions}
                                        value={addData.machine_type_id}
                                        onChange={(val) => setAddData('machine_type_id', val)}
                                        placeholder="Select Machine Type..."
                                        searchPlaceholder="Type to search machine types..."
                                        required
                                        error={addErrors.machine_type_id}
                                    />
                                </div>

                                {/* Row 3: Capacity Per Hour (CPH) (Full Row) */}
                                <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="font-bold text-slate-800 dark:text-teal-200 flex items-center gap-1.5">
                                            <Gauge className="w-4 h-4 text-teal-600" />
                                            <span>Capacity Per Hour (CPH)</span>
                                            <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Standard Output Rate</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={addData.cph}
                                            onChange={(e) => setAddData('cph', e.target.value)}
                                            placeholder="25.00"
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/90 dark:border-teal-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 shadow-xs"
                                        />
                                        <select
                                            value={addData.unit}
                                            onChange={(e) => setAddData('unit', e.target.value)}
                                            className="w-32 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/90 dark:border-teal-800 text-[#0E6B66] dark:text-teal-300 font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
                                        >
                                            {defaultUnits.map((u) => (
                                                <option key={u} value={u}>{u} / hour</option>
                                            ))}
                                        </select>
                                    </div>
                                    {addErrors.cph && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{addErrors.cph}</p>}
                                </div>

                                {/* Row 4: Brand/Model & Serial Number */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Brand / Manufacturer
                                        </label>
                                        <input
                                            type="text"
                                            value={addData.brand_or_model}
                                            onChange={(e) => setAddData('brand_or_model', e.target.value)}
                                            placeholder="e.g. Mayer & Cie / Germany"
                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Serial / Machine ID
                                        </label>
                                        <input
                                            type="text"
                                            value={addData.serial_number}
                                            onChange={(e) => setAddData('serial_number', e.target.value)}
                                            placeholder="e.g. MC-01 or SN-88392"
                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Status Toggle & Sort Order */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAddData('is_active', !addData.is_active)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                addData.is_active ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                            role="switch"
                                            aria-checked={addData.is_active}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    addData.is_active ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                {addData.is_active ? 'Active & Ready' : 'Inactive / Standby'}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Available for shop-floor assignments
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Order:</label>
                                        <input
                                            type="number"
                                            value={addData.sort_order}
                                            onChange={(e) => setAddData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-20 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center"
                                        />
                                    </div>
                                </div>

                                {/* Row 6: Technical Notes */}
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Notes & Technical Specifications
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={addData.notes}
                                        onChange={(e) => setAddData('notes', e.target.value)}
                                        placeholder="Optional gauge (28G), diameter (30''), feeder count (96F), or remarks..."
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{adding ? 'Saving Machine...' : 'Save Machine'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: EDIT MACHINE */}
                {editingMachine && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/90 dark:border-slate-800 max-w-xl w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] relative max-h-[92vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                                        <Edit2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            Edit Machine
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                                            Updating: {editingMachine.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingMachine(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4 mt-5 text-xs">
                                {/* Row 1: Machine Name */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-slate-700 dark:text-slate-300">
                                            Machine Name / Model <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-slate-400">Primary Identifier</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                                    />
                                    {editErrors.name && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{editErrors.name}</p>}
                                </div>

                                {/* Row 2: Machine Type (Full Row) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-slate-700 dark:text-slate-300">
                                            Machine Type <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                                            Searchable Directory
                                        </span>
                                    </div>
                                    <SearchableSelect
                                        options={machineTypeOptions}
                                        value={editData.machine_type_id}
                                        onChange={(val) => setEditData('machine_type_id', val)}
                                        placeholder="Select Machine Type..."
                                        searchPlaceholder="Type to search machine types..."
                                        required
                                        error={editErrors.machine_type_id}
                                    />
                                </div>

                                {/* Row 3: Capacity Per Hour (CPH) (Full Row) */}
                                <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="font-bold text-slate-800 dark:text-teal-200 flex items-center gap-1.5">
                                            <Gauge className="w-4 h-4 text-teal-600" />
                                            <span>Capacity Per Hour (CPH)</span>
                                            <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Standard Output Rate</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editData.cph}
                                            onChange={(e) => setEditData('cph', e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/90 dark:border-teal-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 shadow-xs"
                                        />
                                        <select
                                            value={editData.unit}
                                            onChange={(e) => setEditData('unit', e.target.value)}
                                            className="w-32 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/90 dark:border-teal-800 text-[#0E6B66] dark:text-teal-300 font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
                                        >
                                            {defaultUnits.map((u) => (
                                                <option key={u} value={u}>{u} / hour</option>
                                            ))}
                                        </select>
                                    </div>
                                    {editErrors.cph && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{editErrors.cph}</p>}
                                </div>

                                {/* Row 4: Brand/Model & Serial Number */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Brand / Manufacturer
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.brand_or_model}
                                            onChange={(e) => setEditData('brand_or_model', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Serial / Machine ID
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.serial_number}
                                            onChange={(e) => setEditData('serial_number', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Status Toggle & Sort Order */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditData('is_active', !editData.is_active)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                editData.is_active ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                            role="switch"
                                            aria-checked={editData.is_active}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    editData.is_active ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                                {editData.is_active ? 'Active & Ready' : 'Inactive / Standby'}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Available for shop-floor assignments
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Order:</label>
                                        <input
                                            type="number"
                                            value={editData.sort_order}
                                            onChange={(e) => setEditData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-20 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center"
                                        />
                                    </div>
                                </div>

                                {/* Row 6: Technical Notes */}
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Notes & Technical Specifications
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editData.notes}
                                        onChange={(e) => setEditData('notes', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMachine(null)}
                                        className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{updating ? 'Updating Machine...' : 'Update Machine'}</span>
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
