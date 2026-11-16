import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Briefcase, MapPin, Phone, Sparkles, Trash2, Users } from 'lucide-react';
import { JobListing } from '@/types';
import { JOB_CATEGORY_LABELS } from '@/utils/labels';

interface Props {
    job: JobListing;
}

export default function Show({ job }: Props) {
    const applications = job.applications || [];

    const handleDeleteJob = () => {
        if (!confirm(`Delete job listing "${job.role_title}" and all ${applications.length} applications?`)) {
            return;
        }
        router.delete(route('admin.jobs.destroy', job.id));
    };

    const handleDeleteApplication = (applicationId: number, name: string) => {
        if (!confirm(`Remove application from ${name}?`)) {
            return;
        }
        router.delete(route('admin.jobs.applications.destroy', [job.id, applicationId]), { preserveScroll: true });
    };

    return (
        <AdminLayout title={job.role_title}>
            <Head title={job.role_title} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.jobs.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Job Listings
                    </Link>

                    <div className="flex items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => router.post(route('admin.jobs.toggleNew', job.id), {}, { preserveScroll: true })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold ${
                                job.is_new
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            {job.is_new ? 'New Badge Active' : 'Mark as New'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteJob}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Job
                        </button>
                    </div>
                </div>

                {/* Job Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[11px] font-bold">
                                    {JOB_CATEGORY_LABELS[job.category] || job.category}
                                </span>
                                {job.is_new && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-bold">
                                        NEW
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{job.role_title}</h2>
                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                    <Briefcase className="w-3.5 h-3.5" /> {job.company_name}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {job.area}
                                </span>
                                {job.contact_phone && (
                                    <span className="inline-flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {job.contact_phone}
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="text-right text-xs">
                            <p className="text-slate-500">Salary Range</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{job.salary_label}</p>
                            <p className="text-slate-500 mt-0.5">
                                {job.vacancies} vacancies • {job.posted_label}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                            <p className="text-[11px] text-slate-500">Shift Schedule</p>
                            <p className="font-semibold">{job.shift_label || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Required Experience</p>
                            <p className="font-semibold">{job.experience_label || 'Not specified'}</p>
                        </div>
                    </div>

                    {Array.isArray(job.requirements_json) && job.requirements_json.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <p className="font-bold text-slate-900 dark:text-white mb-2">Requirements</p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                                {job.requirements_json.map((req, idx) => (
                                    <li key={idx}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Applications Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Job Applications ({applications.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-3 px-4">Applicant Name</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Experience</th>
                                    <th className="py-3 px-4">Current Area</th>
                                    <th className="py-3 px-4">Note</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{app.applicant_name}</td>
                                        <td className="py-3 px-4">{app.phone}</td>
                                        <td className="py-3 px-4">{app.experience}</td>
                                        <td className="py-3 px-4">{app.current_area}</td>
                                        <td className="py-3 px-4 max-w-[260px] text-slate-500">{app.note || '—'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteApplication(app.id, app.applicant_name)}
                                                title="Remove Application"
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            No applications received for this job yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
