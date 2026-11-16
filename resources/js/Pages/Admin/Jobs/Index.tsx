import React, { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Briefcase, Eye, Pencil, Plus, Search, Sparkles, Trash2, Users, X } from 'lucide-react';
import { JobListing, PaginatedData } from '@/types';
import { JOB_CATEGORY_LABELS } from '@/utils/labels';

interface Props {
    jobs: PaginatedData<JobListing>;
    counts: {
        total: number;
        new_jobs: number;
        total_vacancies: number;
        total_applications: number;
    };
    filters: {
        search: string;
        category: string;
        is_new: string;
        per_page: number;
    };
}

export default function Index({ jobs, counts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<JobListing | null>(null);

    const form = useForm({
        role_title: '',
        company_name: '',
        area: '',
        category: 'op',
        shift_label: '',
        experience_label: '',
        salary_label: '',
        posted_label: 'Just now',
        contact_phone: '',
        is_new: true,
        vacancies: 1,
        requirements_text: '',
    });

    const applyFilter = (overrides: Record<string, string | number>) => {
        router.get(route('admin.jobs.index'), { ...filters, search, ...overrides }, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({
            role_title: '',
            company_name: '',
            area: '',
            category: 'op',
            shift_label: 'Day/Night',
            experience_label: '2+ years',
            salary_label: 'Negotiable',
            posted_label: 'Today',
            contact_phone: '',
            is_new: true,
            vacancies: 1,
            requirements_text: '',
        });
        setShowModal(true);
    };

    const openEdit = (job: JobListing) => {
        setEditing(job);
        form.clearErrors();
        form.setData({
            role_title: job.role_title,
            company_name: job.company_name,
            area: job.area,
            category: job.category,
            shift_label: job.shift_label || '',
            experience_label: job.experience_label || '',
            salary_label: job.salary_label,
            posted_label: job.posted_label,
            contact_phone: job.contact_phone || '',
            is_new: job.is_new,
            vacancies: job.vacancies,
            requirements_text: Array.isArray(job.requirements_json) ? job.requirements_json.join('\n') : '',
        });
        setShowModal(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('admin.jobs.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route('admin.jobs.store'), {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (job: JobListing) => {
        if (!confirm(`Delete job listing "${job.role_title}" and all its applications?`)) {
            return;
        }
        router.delete(route('admin.jobs.destroy', job.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Jobs & Recruitment">
            <Head title="Job Listings" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Total Listings', val: counts.total, cls: 'text-slate-900 dark:text-white' },
                        { label: 'New Badge Active', val: counts.new_jobs, cls: 'text-emerald-600' },
                        { label: 'Total Vacancies', val: counts.total_vacancies, cls: 'text-blue-600' },
                        { label: 'Applications Received', val: counts.total_applications, cls: 'text-indigo-600' },
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
                                placeholder="Search role title, company, area..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <select
                            value={filters.category}
                            onChange={(e) => applyFilter({ category: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Categories</option>
                            {Object.entries(JOB_CATEGORY_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v} ({k})
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.is_new}
                            onChange={(e) => applyFilter({ is_new: e.target.value, page: 1 })}
                            className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                            <option value="all">All Listings</option>
                            <option value="1">New Highlight Only</option>
                            <option value="0">Standard Only</option>
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
                        <Plus className="w-3.5 h-3.5" /> Post Job
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Role & Company</th>
                                    <th className="py-3 px-4">Category & Area</th>
                                    <th className="py-3 px-4">Salary & Shift</th>
                                    <th className="py-3 px-4">Vacancies & Applicants</th>
                                    <th className="py-3 px-4">New Badge</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {jobs.data.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <Link
                                                href={route('admin.jobs.show', job.id)}
                                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600"
                                            >
                                                {job.role_title}
                                            </Link>
                                            <p className="text-[11px] text-slate-500">
                                                {job.company_name} • {job.posted_label}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[11px] font-semibold">
                                                {JOB_CATEGORY_LABELS[job.category] || job.category}
                                            </span>
                                            <p className="text-[11px] text-slate-500 mt-1">{job.area}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{job.salary_label}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {[job.shift_label, job.experience_label].filter(Boolean).join(' • ') || '—'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold">{job.vacancies} openings</p>
                                            <Link
                                                href={route('admin.jobs.show', job.id)}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline mt-0.5"
                                            >
                                                <Users className="w-3 h-3" /> {job.applications_count ?? 0} applicants
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => router.post(route('admin.jobs.toggleNew', job.id), {}, { preserveScroll: true })}
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                    job.is_new
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                {job.is_new ? 'New' : 'Regular'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('admin.jobs.show', job.id)}
                                                    title="View Applications"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(job)}
                                                    title="Edit Job"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(job)}
                                                    title="Delete Job"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {jobs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            No job listings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={jobs.links}
                        from={jobs.from ?? 0}
                        to={jobs.to ?? 0}
                        total={jobs.total}
                        perPage={filters.per_page}
                        onPerPageChange={(perPage) => applyFilter({ per_page: perPage, page: 1 })}
                    />
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl my-8">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editing ? `Edit Job: ${editing.role_title}` : 'Post New Job'}
                            </h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Role Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.role_title}
                                    onChange={(e) => form.setData('role_title', e.target.value)}
                                    placeholder="e.g. Senior Jacquard Operator"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                                {form.errors.role_title && <p className="text-rose-500 text-[11px] mt-1">{form.errors.role_title}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Company / Factory Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.company_name}
                                    onChange={(e) => form.setData('company_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Area *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.area}
                                    onChange={(e) => form.setData('area', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Category *</label>
                                <select
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                >
                                    {Object.entries(JOB_CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v} ({k})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Vacancies *</label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={form.data.vacancies}
                                    onChange={(e) => form.setData('vacancies', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Salary Label *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.salary_label}
                                    onChange={(e) => form.setData('salary_label', e.target.value)}
                                    placeholder="e.g. ৳18,000 - ৳22,000"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Posted Label *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.posted_label}
                                    onChange={(e) => form.setData('posted_label', e.target.value)}
                                    placeholder="e.g. Today, 2 days ago"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Shift Label</label>
                                <input
                                    type="text"
                                    value={form.data.shift_label}
                                    onChange={(e) => form.setData('shift_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Experience Label</label>
                                <input
                                    type="text"
                                    value={form.data.experience_label}
                                    onChange={(e) => form.setData('experience_label', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={form.data.contact_phone}
                                    onChange={(e) => form.setData('contact_phone', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-semibold mb-1">Requirements (one item per line)</label>
                                <textarea
                                    rows={3}
                                    value={form.data.requirements_text}
                                    onChange={(e) => form.setData('requirements_text', e.target.value)}
                                    placeholder={'Circular knitting Dia 30-36\nNight shift rotation\nNID copy required'}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-1.5 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_new}
                                        onChange={(e) => form.setData('is_new', e.target.checked)}
                                    />
                                    Highlight with &ldquo;New&rdquo; Badge
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
                                    {editing ? 'Update Job' : 'Create Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
