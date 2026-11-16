import React, { FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageProps } from '@/types';

interface Props {
    existingPlans: string[];
}

export default function Import({ existingPlans }: Props) {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm<{
        file: File | null;
        skip_duplicates: boolean;
    }>({
        file: null,
        skip_duplicates: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.factories.import.store'), { forceFormData: true });
    };

    return (
        <AdminLayout title="Bulk Import Factories">
            <Head title="Import Factories" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('admin.factories.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Factories
                    </Link>

                    <a
                        href={route('admin.factories.template')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <Download className="w-3.5 h-3.5" /> Download CSV Template
                    </a>
                </div>

                {flash?.importReport && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Import Report
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                <p className="text-lg font-bold">{flash.importReport.created}</p>
                                <p>Created</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                                <p className="text-lg font-bold">{flash.importReport.skipped}</p>
                                <p>Skipped</p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                <p className="text-lg font-bold">{flash.importReport.failed}</p>
                                <p>Failed</p>
                            </div>
                        </div>
                        {flash.importReport.errors.length > 0 && (
                            <ul className="space-y-1 text-rose-600 dark:text-rose-400">
                                {flash.importReport.errors.map((err, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>{err}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-xs"
                >
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-200">CSV Columns</p>
                            <p className="mt-1 font-mono text-[11px] text-blue-700 dark:text-blue-300">
                                code, name, area, address, phone, total_machines, plan_code, billing_cycle, qr_sticker_enabled
                            </p>
                            {existingPlans.length > 0 && (
                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    Existing plans in DB: {existingPlans.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">Upload CSV File *</label>
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                            required
                            className="block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                        />
                        {errors.file && <p className="text-rose-500 mt-1">{errors.file}</p>}
                    </div>

                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.skip_duplicates}
                            onChange={(e) => setData('skip_duplicates', e.target.checked)}
                        />
                        Skip rows with existing `code` instead of reporting error
                    </label>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || !data.file}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" /> {processing ? 'Importing...' : 'Run Import'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
