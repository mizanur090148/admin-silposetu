import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle,
    AlertCircle,
    Info,
    HelpCircle,
    FileText,
    Shield,
    X,
    Building2,
    Check
} from 'lucide-react';

interface Props {
    districts: string[];
    industryTypes: string[];
}

export default function Import({ districts, industryTypes }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const { data, setData, post, processing, errors } = useForm<{
        file: File | null;
        default_status: 'active' | 'pending';
        default_verified: boolean;
        default_password: string;
        skip_duplicates: boolean;
    }>({
        file: null,
        default_status: 'active',
        default_verified: true,
        default_password: 'Shilpo@2026',
        skip_duplicates: true,
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setData('file', droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setData('file', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) {
            alert('Please select or drag-and-drop a CSV file to upload.');
            return;
        }

        post(route('admin.factories.import.store'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="Bulk Import Factories">
            <Head title="Bulk Import Factories - Shilposetu Admin" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header & Back Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white">Bulk Import Factories</h1>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-500/30">
                                    CSV Batch Insert
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Rapidly insert dozens or hundreds of verified factories and owner accounts from a CSV spreadsheet.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <a
                            href={route('admin.factories.template')}
                            download
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Sample CSV Template</span>
                        </a>
                        <Link
                            href={route('admin.factories.create')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition"
                        >
                            <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            <span>Manual Form</span>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Drag and drop upload zone */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upload Spreadsheet File</h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Supported formats: Comma-separated CSV, Semicolon-separated CSV, or UTF-8 text file (Max: 10MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Drop Area */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                                dragActive
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : data.file
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {data.file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20">
                                        <FileSpreadsheet className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{data.file.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                        {(data.file.size / 1024).toFixed(1)} KB • Ready to import
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile();
                                        }}
                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Remove File</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-850 text-slate-900 dark:text-white">
                                        Drag & drop your CSV file here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                                        Save your spreadsheet as CSV (.csv) before uploading. Make sure column headers match the template.
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold">{errors.file}</p>}
                    </div>

                    {/* Import Settings & Default Options */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Import Configuration & Fallbacks</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Settings applied when individual rows do not specify custom values.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Default Account Status
                                </label>
                                <select
                                    value={data.default_status}
                                    onChange={e => setData('default_status', e.target.value as any)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="active">Active (Instant Sign In)</option>
                                    <option value="pending">Pending Admin Review</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Default Password for New Accounts
                                </label>
                                <input
                                    type="text"
                                    value={data.default_password}
                                    onChange={e => setData('default_password', e.target.value)}
                                    placeholder="Shilpo@2026"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.default_verified}
                                        onChange={e => setData('default_verified', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Mark as Verified</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.skip_duplicates}
                                        onChange={e => setData('skip_duplicates', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Skip Existing Phone/Email</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Columns Reference Guide Card */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <span>CSV Format & Columns Reference Cheat Sheet</span>
                            </h3>
                            <a
                                href={route('admin.factories.template')}
                                download
                                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <Download className="w-3 h-3" />
                                <span>Download CSV Template with Samples</span>
                            </a>
                        </div>

                        <div className="overflow-x-auto text-[11px]">
                            <table className="w-full text-left">
                                <thead className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                                    <tr>
                                        <th className="py-2.5 px-3">Column Name</th>
                                        <th className="py-2.5 px-3">Required?</th>
                                        <th className="py-2.5 px-3">Description & Sample Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">business_name</td>
                                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400 font-bold">Yes</td>
                                        <td className="py-2 px-3">Official manufacturing factory name (e.g. "Apex Garments Ltd")</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">phone</td>
                                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400 font-bold">Yes</td>
                                        <td className="py-2 px-3">Primary mobile phone for login (e.g. "01711223344", must be unique)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">owner_name</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Full name of factory owner (Defaults to factory name if empty)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">email</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Login email (auto-generated from phone if blank: factory_phone@silposetu.internal)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">district</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Industrial district: Gazipur, Ashulia, Savar, Narayanganj, Dhaka, Chittagong, etc.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">industry_type</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">e.g. "Knitwear & Composite", "Woven Manufacturing", "Apparel & Garments"</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">total_lines</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Number of sewing/assembly lines (e.g. 24)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">total_machines</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Total machinery count (e.g. 450)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">daily_capacity</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Output rate (e.g. "18,000 Pcs/Day" or "5,000 Kg/Day")</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">capabilities</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Pipe or comma-separated tags (e.g. "Circular Knitting | Sewing Production | Fabric Dyeing")</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">trade_license_no</td>
                                        <td className="py-2 px-3 text-slate-400 dark:text-slate-500">Optional</td>
                                        <td className="py-2 px-3">Official trade license registration string</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !data.file}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            <span>{processing ? 'Processing & Inserting Records...' : 'Start Bulk Import'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
