import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import {
    Building2,
    CalendarCheck2,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import {
    EmployeeRow,
    FactoryAttendanceRow,
    FactoryRef,
    PaginatedData,
    PartyRow,
} from '@/types';

interface RosterEmployee {
    id: number;
    factory_id: number;
    name: string;
    employee_type: string;
    shift: string;
    daily_wage: string | number;
}

interface Props {
    tab: 'employees' | 'attendance' | 'parties';
    employees: PaginatedData<EmployeeRow>;
    attendances: PaginatedData<FactoryAttendanceRow>;
    parties: PaginatedData<PartyRow>;
    summary: {
        total_employees: number;
        active_employees: number;
        operators: number;
        attendance_records: number;
        present_attendance: number;
        total_parties: number;
        active_parties: number;
        daily_wage_pool_tk: number;
    };
    factories: FactoryRef[];
    employeeRoster: RosterEmployee[];
    filters: {
        search: string;
        factory_id: string;
        employee_type: string;
        shift: string;
        status: string;
        attendance_date: string;
        party_type: string;
        per_page: number;
    };
}

const ATT_STATUS_BADGE: Record<string, string> = {
    present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    overtime: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    leave: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function Index({
    tab,
    employees,
    attendances,
    parties,
    summary,
    factories,
    employeeRoster,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showEmpModal, setShowEmpModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState<EmployeeRow | null>(null);
    const [showAttModal, setShowAttModal] = useState(false);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [editingParty, setEditingParty] = useState<PartyRow | null>(null);

    const empForm = useForm({
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        employee_type: 'operator',
        id_no: '',
        name: '',
        mobile: '',
        address: '',
        designation: '',
        shift: 'A',
        machine_assigned: '',
        daily_wage: '550',
        joining_date: '',
        status: 'active',
        notes: '',
    });

    const attForm = useForm({
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        worker_name: '',
        role_type: 'operator',
        shift: 'A',
        status: 'present',
        attendance_date: new Date().toISOString().slice(0, 10),
        in_time: '08:00 AM',
        out_time: '05:00 PM',
        overtime_hours: '0',
        daily_wage_tk: '550',
        note: '',
    });

    const partyForm = useForm({
        factory_id: factories[0]?.id ? String(factories[0].id) : '',
        code: '',
        name: '',
        type: 'ven',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        bin_tin: '',
        default_rate_tk: '14',
        payment_terms: 'বিলের ৩০ দিনের মধ্যে',
        opening_balance: '0',
        is_active: true,
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(
            route('admin.workforce.index'),
            { tab, ...filters, search, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    const openCreateEmp = () => {
        setEditingEmp(null);
        empForm.clearErrors();
        empForm.setData({
            factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
            employee_type: 'operator',
            id_no: '',
            name: '',
            mobile: '',
            address: '',
            designation: '',
            shift: 'A',
            machine_assigned: '',
            daily_wage: '550',
            joining_date: '',
            status: 'active',
            notes: '',
        });
        setShowEmpModal(true);
    };

    const openEditEmp = (emp: EmployeeRow) => {
        setEditingEmp(emp);
        empForm.clearErrors();
        empForm.setData({
            factory_id: String(emp.factory_id),
            employee_type: emp.employee_type,
            id_no: emp.id_no || '',
            name: emp.name,
            mobile: emp.mobile || '',
            address: emp.address || '',
            designation: emp.designation || '',
            shift: emp.shift,
            machine_assigned: emp.machine_assigned || '',
            daily_wage: String(emp.daily_wage),
            joining_date: emp.joining_date ? emp.joining_date.slice(0, 10) : '',
            status: emp.status,
            notes: emp.notes || '',
        });
        setShowEmpModal(true);
    };

    const submitEmp = (e: FormEvent) => {
        e.preventDefault();
        if (editingEmp) {
            empForm.put(route('admin.workforce.employees.update', editingEmp.id), {
                preserveScroll: true,
                onSuccess: () => setShowEmpModal(false),
            });
        } else {
            empForm.post(route('admin.workforce.employees.store'), {
                preserveScroll: true,
                onSuccess: () => setShowEmpModal(false),
            });
        }
    };

    const openAttFromRow = (att?: FactoryAttendanceRow) => {
        attForm.clearErrors();
        if (att) {
            attForm.setData({
                factory_id: String(att.factory_id),
                worker_name: att.worker_name,
                role_type: att.role_type,
                shift: att.shift,
                status: att.status,
                attendance_date: att.attendance_date.slice(0, 10),
                in_time: att.in_time || '',
                out_time: att.out_time || '',
                overtime_hours: String(att.overtime_hours),
                daily_wage_tk: String(att.daily_wage_tk),
                note: att.note || '',
            });
        } else {
            attForm.setData({
                factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
                worker_name: '',
                role_type: 'operator',
                shift: 'A',
                status: 'present',
                attendance_date: new Date().toISOString().slice(0, 10),
                in_time: '08:00 AM',
                out_time: '05:00 PM',
                overtime_hours: '0',
                daily_wage_tk: '550',
                note: '',
            });
        }
        setShowAttModal(true);
    };

    const handleSelectRosterWorker = (workerName: string) => {
        const match = employeeRoster.find((r) => r.name === workerName);
        if (match) {
            attForm.setData((prev) => ({
                ...prev,
                worker_name: match.name,
                factory_id: String(match.factory_id),
                role_type: match.employee_type,
                shift: match.shift,
                daily_wage_tk: String(match.daily_wage),
            }));
        } else {
            attForm.setData('worker_name', workerName);
        }
    };

    const submitAtt = (e: FormEvent) => {
        e.preventDefault();
        attForm.post(route('admin.workforce.attendance.store'), {
            preserveScroll: true,
            onSuccess: () => setShowAttModal(false),
        });
    };

    const openCreateParty = () => {
        setEditingParty(null);
        partyForm.clearErrors();
        partyForm.setData({
            factory_id: filters.factory_id !== 'all' ? filters.factory_id : (factories[0]?.id ? String(factories[0].id) : ''),
            code: '',
            name: '',
            type: 'ven',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            bin_tin: '',
            default_rate_tk: '14',
            payment_terms: 'বিলের ৩০ দিনের মধ্যে',
            opening_balance: '0',
            is_active: true,
        });
        setShowPartyModal(true);
    };

    const openEditParty = (p: PartyRow) => {
        setEditingParty(p);
        partyForm.clearErrors();
        partyForm.setData({
            factory_id: String(p.factory_id),
            code: p.code,
            name: p.name,
            type: p.type,
            contact_person: p.contact_person || '',
            phone: p.phone || '',
            email: p.email || '',
            address: p.address || '',
            bin_tin: p.bin_tin || '',
            default_rate_tk: String(p.default_rate_tk),
            payment_terms: p.payment_terms || '',
            opening_balance: String(p.opening_balance),
            is_active: p.is_active,
        });
        setShowPartyModal(true);
    };

    const submitParty = (e: FormEvent) => {
        e.preventDefault();
        if (editingParty) {
            partyForm.put(route('admin.workforce.parties.update', editingParty.id), {
                preserveScroll: true,
                onSuccess: () => setShowPartyModal(false),
            });
        } else {
            partyForm.post(route('admin.workforce.parties.store'), {
                preserveScroll: true,
                onSuccess: () => setShowPartyModal(false),
            });
        }
    };

    const tabs = [
        { id: 'employees', label: `Employees (${summary.total_employees})`, icon: Users },
        { id: 'attendance', label: `Attendance (${summary.attendance_records})`, icon: CalendarCheck2 },
        { id: 'parties', label: `Factory Parties (${summary.total_parties})`, icon: Building2 },
    ] as const;

    return (
        <AdminLayout title="Staff, Attendance & Factory Parties">
            <Head title="Staff & Attendance" />

            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    {[
                        { label: 'Active Staff', val: `${summary.active_employees} / ${summary.total_employees}`, cls: 'text-slate-900 dark:text-white' },
                        { label: 'Operators', val: summary.operators, cls: 'text-blue-600' },
                        { label: 'Daily Wage Pool', val: `৳${Math.round(summary.daily_wage_pool_tk).toLocaleString()}`, cls: 'text-emerald-600' },
                        { label: 'Attendance Punches', val: summary.attendance_records, cls: 'text-indigo-600' },
                        { label: 'Present / OT', val: summary.present_attendance, cls: 'text-teal-600' },
                        { label: 'Active Parties', val: `${summary.active_parties} / ${summary.total_parties}`, cls: 'text-amber-600' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500">{c.label}</p>
                            <p className={`text-lg font-bold mt-1 ${c.cls}`}>{c.val}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Header & Action CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {tabs.map((item) => {
                            const Icon = item.icon;
                            const active = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => applyFilter({ tab: item.id })}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {tab === 'employees' && (
                        <button
                            type="button"
                            onClick={openCreateEmp}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Employee
                        </button>
                    )}
                    {tab === 'attendance' && (
                        <button
                            type="button"
                            onClick={() => openAttFromRow()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <UserCheck className="w-3.5 h-3.5" /> Log Attendance
                        </button>
                    )}
                    {tab === 'parties' && (
                        <button
                            type="button"
                            onClick={openCreateParty}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Party
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({});
                        }}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, ID, mobile, machine, party code..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        <select
                            value={filters.factory_id}
                            onChange={(e) => applyFilter({ factory_id: e.target.value })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[210px]"
                        >
                            <option value="all">All Factories</option>
                            {factories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.code} — {f.name}
                                </option>
                            ))}
                        </select>

                        {tab === 'employees' && (
                            <>
                                <select
                                    value={filters.employee_type}
                                    onChange={(e) => applyFilter({ employee_type: e.target.value })}
                                    className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="operator">Operator</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="technician">Technician</option>
                                    <option value="helper">Helper</option>
                                    <option value="staff">Staff</option>
                                </select>
                                <select
                                    value={filters.status}
                                    onChange={(e) => applyFilter({ status: e.target.value })}
                                    className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="all">Any Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </>
                        )}

                        {tab === 'attendance' && (
                            <>
                                <input
                                    type="date"
                                    value={filters.attendance_date}
                                    onChange={(e) => applyFilter({ attendance_date: e.target.value })}
                                    className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <select
                                    value={filters.shift}
                                    onChange={(e) => applyFilter({ shift: e.target.value })}
                                    className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="all">All Shifts</option>
                                    <option value="A">Shift A</option>
                                    <option value="B">Shift B</option>
                                    <option value="C">Shift C</option>
                                </select>
                            </>
                        )}

                        {tab === 'parties' && (
                            <select
                                value={filters.party_type}
                                onChange={(e) => applyFilter({ party_type: e.target.value })}
                                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <option value="all">All Party Types</option>
                                <option value="ven">Vendor / Buyer (ven)</option>
                                <option value="sup">Supplier / Transport (sup)</option>
                            </select>
                        )}

                        <button type="submit" className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                            Search
                        </button>
                    </form>
                </div>

                {/* Tab 1: Employees */}
                {tab === 'employees' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Employee &amp; ID</th>
                                        <th className="py-3 px-4">Factory &amp; Role</th>
                                        <th className="py-3 px-4">Shift &amp; Machine</th>
                                        <th className="py-3 px-4">Daily Wage</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {employees.data.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {emp.id_no || `EMP-${emp.id}`} {emp.mobile ? `· ${emp.mobile}` : ''}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {emp.factory && (
                                                    <Link href={route('admin.factories.show', emp.factory.id)} className="font-semibold text-blue-600 hover:underline block">
                                                        {emp.factory.code} — {emp.factory.name}
                                                    </Link>
                                                )}
                                                <p className="text-[11px] text-slate-500 uppercase">
                                                    {emp.employee_type} {emp.designation ? `· ${emp.designation}` : ''}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">Shift {emp.shift}</span>
                                                <p className="text-[11px] font-mono text-slate-500 mt-1">{emp.machine_assigned || 'Unassigned'}</p>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-emerald-600">৳{Number(emp.daily_wage).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        emp.status === 'active'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditEmp(emp)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Remove employee "${emp.name}"?`)) {
                                                                router.delete(route('admin.workforce.employees.destroy', emp.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={employees.links}
                            from={employees.from}
                            to={employees.to}
                            total={employees.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}

                {/* Tab 2: Attendance */}
                {tab === 'attendance' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Date &amp; Shift</th>
                                        <th className="py-3 px-4">Worker &amp; Role</th>
                                        <th className="py-3 px-4">Factory</th>
                                        <th className="py-3 px-4">Timing &amp; OT</th>
                                        <th className="py-3 px-4">Wage</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{att.attendance_date.slice(0, 10)}</p>
                                                <span className="text-[11px] text-slate-500">Shift {att.shift}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{att.worker_name}</p>
                                                <p className="text-[11px] text-slate-500 uppercase">{att.role_type}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {att.factory ? `${att.factory.code} — ${att.factory.name}` : `Factory #${att.factory_id}`}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p>{att.in_time || '—'} → {att.out_time || '—'}</p>
                                                <p className="text-[11px] text-slate-500">OT: {att.overtime_hours} hrs</p>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">৳{Number(att.daily_wage_tk).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${ATT_STATUS_BADGE[att.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {att.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openAttFromRow(att)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete attendance log for ${att.worker_name}?`)) {
                                                                router.delete(route('admin.workforce.attendance.destroy', att.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {attendances.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-slate-400">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={attendances.links}
                            from={attendances.from}
                            to={attendances.to}
                            total={attendances.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}

                {/* Tab 3: Factory Parties */}
                {tab === 'parties' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                        <th className="py-3 px-4">Code &amp; Name</th>
                                        <th className="py-3 px-4">Type &amp; Factory</th>
                                        <th className="py-3 px-4">Contact &amp; BIN</th>
                                        <th className="py-3 px-4">Default Rate &amp; Terms</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {parties.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold text-blue-600">{p.code}</span>
                                                <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        p.type === 'ven'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {p.type === 'ven' ? 'Vendor / Buyer' : 'Supplier / Contractor'}
                                                </span>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    {p.factory ? `${p.factory.code} — ${p.factory.name}` : `Factory #${p.factory_id}`} · {p.subcontract_orders_count ?? 0} orders
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 max-w-[220px]">
                                                <p>{p.contact_person || '—'} {p.phone ? `· ${p.phone}` : ''}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{p.address || '—'} {p.bin_tin ? `· BIN ${p.bin_tin}` : ''}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold">৳{Number(p.default_rate_tk).toLocaleString()}/kg</p>
                                                <p className="text-[11px] text-slate-500">Opening: ৳{Number(p.opening_balance).toLocaleString()} · {p.payment_terms}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(route('admin.workforce.parties.toggle', p.id), {}, { preserveScroll: true })}
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        p.is_active
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {p.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditParty(p)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Remove party "${p.name}"?`)) {
                                                                router.delete(route('admin.workforce.parties.destroy', p.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {parties.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No factory parties found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={parties.links}
                            from={parties.from}
                            to={parties.to}
                            total={parties.total}
                            perPage={filters.per_page}
                            onPerPageChange={(n) => applyFilter({ per_page: n })}
                        />
                    </div>
                )}
            </div>

            {/* Employee Modal */}
            {showEmpModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">{editingEmp ? `Edit Employee: ${editingEmp.name}` : 'Add Employee'}</h3>
                            <button type="button" onClick={() => setShowEmpModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitEmp} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={empForm.data.factory_id}
                                    onChange={(e) => empForm.setData('factory_id', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Employee Type *</label>
                                <select
                                    value={empForm.data.employee_type}
                                    onChange={(e) => empForm.setData('employee_type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="operator">Operator</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="technician">Technician</option>
                                    <option value="helper">Helper</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={empForm.data.name}
                                    onChange={(e) => empForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">ID Card No</label>
                                <input
                                    type="text"
                                    value={empForm.data.id_no}
                                    onChange={(e) => empForm.setData('id_no', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Mobile</label>
                                <input
                                    type="text"
                                    value={empForm.data.mobile}
                                    onChange={(e) => empForm.setData('mobile', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Designation</label>
                                <input
                                    type="text"
                                    value={empForm.data.designation}
                                    onChange={(e) => empForm.setData('designation', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Shift *</label>
                                <select
                                    value={empForm.data.shift}
                                    onChange={(e) => empForm.setData('shift', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="A">Shift A</option>
                                    <option value="B">Shift B</option>
                                    <option value="C">Shift C</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Assigned Machine</label>
                                <input
                                    type="text"
                                    value={empForm.data.machine_assigned}
                                    onChange={(e) => empForm.setData('machine_assigned', e.target.value)}
                                    placeholder="M-01"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Daily Wage (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={empForm.data.daily_wage}
                                    onChange={(e) => empForm.setData('daily_wage', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={empForm.data.status}
                                    onChange={(e) => empForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Joining Date</label>
                                <input
                                    type="date"
                                    value={empForm.data.joining_date}
                                    onChange={(e) => empForm.setData('joining_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Address</label>
                                <input
                                    type="text"
                                    value={empForm.data.address}
                                    onChange={(e) => empForm.setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={empForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    {editingEmp ? 'Update Employee' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {showAttModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">Log / Update Worker Attendance</h3>
                            <button type="button" onClick={() => setShowAttModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitAtt} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Worker Name *</label>
                                <input
                                    type="text"
                                    required
                                    list="roster-workers"
                                    value={attForm.data.worker_name}
                                    onChange={(e) => handleSelectRosterWorker(e.target.value)}
                                    placeholder="Pick from staff or type name..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                <datalist id="roster-workers">
                                    {employeeRoster.map((r) => (
                                        <option key={r.id} value={r.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={attForm.data.factory_id}
                                    onChange={(e) => attForm.setData('factory_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={attForm.data.attendance_date}
                                    onChange={(e) => attForm.setData('attendance_date', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Shift *</label>
                                <select
                                    value={attForm.data.shift}
                                    onChange={(e) => attForm.setData('shift', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="A">Shift A</option>
                                    <option value="B">Shift B</option>
                                    <option value="C">Shift C</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Status *</label>
                                <select
                                    value={attForm.data.status}
                                    onChange={(e) => attForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="present">Present</option>
                                    <option value="late">Late</option>
                                    <option value="overtime">Overtime</option>
                                    <option value="leave">Leave</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Role Type</label>
                                <input
                                    type="text"
                                    required
                                    value={attForm.data.role_type}
                                    onChange={(e) => attForm.setData('role_type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Daily Wage (৳)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={attForm.data.daily_wage_tk}
                                    onChange={(e) => attForm.setData('daily_wage_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">In Time</label>
                                <input
                                    type="text"
                                    value={attForm.data.in_time}
                                    onChange={(e) => attForm.setData('in_time', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Out Time / OT (hrs)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={attForm.data.out_time}
                                        onChange={(e) => attForm.setData('out_time', e.target.value)}
                                        className="w-2/3 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                    <input
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={attForm.data.overtime_hours}
                                        onChange={(e) => attForm.setData('overtime_hours', e.target.value)}
                                        className="w-1/3 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowAttModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={attForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    Save Attendance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Party Modal */}
            {showPartyModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm">{editingParty ? `Edit Party: ${editingParty.name}` : 'Add Factory Party'}</h3>
                            <button type="button" onClick={() => setShowPartyModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitParty} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Factory *</label>
                                <select
                                    value={partyForm.data.factory_id}
                                    onChange={(e) => partyForm.setData('factory_id', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.code} — {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Type *</label>
                                <select
                                    value={partyForm.data.type}
                                    onChange={(e) => partyForm.setData('type', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    <option value="ven">Vendor / Buying House (ven)</option>
                                    <option value="sup">Supplier / Contractor (sup)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Party Code</label>
                                <input
                                    type="text"
                                    value={partyForm.data.code}
                                    onChange={(e) => partyForm.setData('code', e.target.value)}
                                    placeholder="Auto if blank"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                />
                                {partyForm.errors.code && <p className="text-rose-500 mt-1">{partyForm.errors.code}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Party Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={partyForm.data.name}
                                    onChange={(e) => partyForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    value={partyForm.data.contact_person}
                                    onChange={(e) => partyForm.setData('contact_person', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={partyForm.data.phone}
                                    onChange={(e) => partyForm.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Default Rate (৳/kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partyForm.data.default_rate_tk}
                                    onChange={(e) => partyForm.setData('default_rate_tk', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Opening Balance (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={partyForm.data.opening_balance}
                                    onChange={(e) => partyForm.setData('opening_balance', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Payment Terms</label>
                                <input
                                    type="text"
                                    value={partyForm.data.payment_terms}
                                    onChange={(e) => partyForm.setData('payment_terms', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Address</label>
                                <input
                                    type="text"
                                    value={partyForm.data.address}
                                    onChange={(e) => partyForm.setData('address', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowPartyModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={partyForm.processing} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">
                                    {editingParty ? 'Update Party' : 'Create Party'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
