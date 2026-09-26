import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    User as UserIcon,
    Shield,
    Layers,
    FileText,
    Upload,
    Check,
    Plus,
    Trash2,
    Sparkles,
    KeyRound,
    Cpu,
    Scissors,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    Info,
    HelpCircle,
    BadgeCheck,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { MachineType, NonSewingMachineRow, SewingCapacity } from '@/types';

interface Props {
    machineTypes: MachineType[];
    districts: string[];
    industryTypes: string[];
    commonCapabilities: string[];
    suggestedCustomerId: string;
}

export default function Create({
    machineTypes,
    districts,
    industryTypes,
    commonCapabilities,
    suggestedCustomerId
}: Props) {
    const [activeDepartment, setActiveDepartment] = useState<'sewing' | 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery'>('sewing');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        phone: string;
        email: string;
        password: string;
        customer_id: string;
        nid_number: string;
        status: string;
        is_subscribed: boolean;
        business_name: string;
        logo: File | null;
        industry_type: string;
        contact_person: string;
        factory_phone: string;
        factory_email: string;
        district: string;
        address: string;
        total_lines: number | string;
        total_machines: number | string;
        daily_capacity: string;
        rating: number | string;
        is_verified: boolean;
        capabilities: string[];
        production_capacities: {
            sewing: SewingCapacity;
            knitting: NonSewingMachineRow[];
            yarn_dyeing: NonSewingMachineRow[];
            fabric_dyeing: NonSewingMachineRow[];
            print: NonSewingMachineRow[];
            embroidery: NonSewingMachineRow[];
        };
        trade_license_no: string;
        tin_no: string;
        bin_no: string;
        trade_license_file: File | null;
        tin_file: File | null;
        bin_file: File | null;
        nid_file: File | null;
    }>({
        name: '',
        phone: '',
        email: '',
        password: 'Shilpo@2026',
        customer_id: suggestedCustomerId || '',
        nid_number: '',
        status: 'active',
        is_subscribed: true,
        business_name: '',
        logo: null,
        industry_type: industryTypes[0] || 'Apparel & Garments',
        contact_person: '',
        factory_phone: '',
        factory_email: '',
        district: districts[0] || 'Gazipur',
        address: '',
        total_lines: '',
        total_machines: '',
        daily_capacity: '',
        rating: 5.0,
        is_verified: true,
        capabilities: ['Sewing Production', 'Finishing & Packing'],
        production_capacities: {
            sewing: {
                no_of_lines: 12,
                per_line_capacity: 1000,
                total_capacity_per_day: 12000,
                unit: 'Pcs',
            },
            knitting: [],
            yarn_dyeing: [],
            fabric_dyeing: [],
            print: [],
            embroidery: [],
        },
        trade_license_no: '',
        tin_no: '',
        bin_no: '',
        trade_license_file: null,
        tin_file: null,
        bin_file: null,
        nid_file: null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('logo', null);
            setLogoPreview(null);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    // Sewing calculation helper
    const handleSewingChange = (field: keyof SewingCapacity, val: any) => {
        const current = { ...data.production_capacities.sewing, [field]: val };
        const lines = Number(current.no_of_lines) || 0;
        const perLine = Number(current.per_line_capacity) || 0;
        current.total_capacity_per_day = lines * perLine;

        setData('production_capacities', {
            ...data.production_capacities,
            sewing: current,
        });

        if (lines > 0) {
            setData('total_lines', lines);
        }
        if (current.total_capacity_per_day > 0) {
            setData('daily_capacity', `${current.total_capacity_per_day.toLocaleString()} ${current.unit || 'Pcs'}/Day`);
        }
    };

    // Non-sewing machinery helpers
    const addMachineRow = (category: 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery') => {
        const catMachines = machineTypes.filter(m => m.category === category);
        const defaultMachine = catMachines[0];

        const newRow: NonSewingMachineRow = {
            id: Math.random().toString(36).substring(7),
            machine_type: defaultMachine?.name || 'Standard Machine',
            machine_type_id: defaultMachine?.id || null,
            no_of_machine: 5,
            capacity_per_machine: 100,
            total_capacity_per_day: 500,
            unit_type: defaultMachine?.default_unit || 'Kg',
        };

        const updatedRows = [...(data.production_capacities[category] || []), newRow];
        setData('production_capacities', {
            ...data.production_capacities,
            [category]: updatedRows,
        });
    };

    const updateMachineRow = (
        category: 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery',
        index: number,
        field: keyof NonSewingMachineRow,
        val: any
    ) => {
        const rows = [...(data.production_capacities[category] || [])];
        const row = { ...rows[index], [field]: val };

        if (field === 'machine_type') {
            const found = machineTypes.find(m => m.name === val && m.category === category);
            if (found) {
                row.machine_type_id = found.id;
                row.unit_type = found.default_unit;
            }
        }

        const count = Number(row.no_of_machine) || 0;
        const cap = Number(row.capacity_per_machine) || 0;
        row.total_capacity_per_day = count * cap;

        rows[index] = row;
        setData('production_capacities', {
            ...data.production_capacities,
            [category]: rows,
        });
    };

    const removeMachineRow = (
        category: 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery',
        index: number
    ) => {
        const rows = [...(data.production_capacities[category] || [])];
        rows.splice(index, 1);
        setData('production_capacities', {
            ...data.production_capacities,
            [category]: rows,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.factories.store'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="Add New Factory">
            <Head title="Add New Factory - Shilposetu Admin" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Top Navigation & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white">Create New Factory</h1>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 dark:border-blue-500/30">
                                    Manual Form
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Register a manufacturing unit, establish login credentials, capacities, and compliance records.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href={route('admin.factories.import')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition shadow-xs"
                        >
                            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Bulk Upload (CSV) Instead</span>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: OWNER & ACCOUNT CREDENTIALS */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Owner Account & Login Credentials</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">The primary user account the factory owner will use to sign in.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Contact Person / Owner Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Mohammad Tanvir Rahman"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Mobile / Phone <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="017xxxxxxxx"
                                        className="w-full pl-9 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {errors.phone && <p className="text-rose-500 text-[10px] mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="owner@factory.com"
                                        className="w-full pl-9 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {errors.email && <p className="text-rose-500 text-[10px] mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <KeyRound className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Default: Shilpo@2026"
                                        className="w-full pl-9 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Default temporary password for first sign in</p>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Customer ID
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_id}
                                    onChange={e => setData('customer_id', e.target.value)}
                                    placeholder={suggestedCustomerId}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-blue-600 dark:text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Auto-assigned sequential ID</p>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Owner NID Number
                                </label>
                                <input
                                    type="text"
                                    value={data.nid_number}
                                    onChange={e => setData('nid_number', e.target.value)}
                                    placeholder="e.g. 1984269102837482"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Account Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="active">Active (Instant Access)</option>
                                    <option value="pending">Pending Admin KYC Review</option>
                                    <option value="suspended">Suspended / Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_subscribed}
                                        onChange={e => setData('is_subscribed', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Active Paid Subscription</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: FACTORY BUSINESS PROFILE */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Factory Identity & Location</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Business registration name, manufacturing classification, and address.</p>
                            </div>
                        </div>

                        {/* Factory Logo Upload (Optional / Not Mandatory) */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                    Factory Logo <span className="text-slate-400 font-normal text-[11px]">(Optional - Not Mandatory)</span>
                                </label>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Remove</span>
                                    </button>
                                )}
                            </div>

                            {!logoPreview ? (
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 rounded-xl p-3.5 text-center cursor-pointer transition flex items-center justify-center gap-3.5 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            Click to upload factory brand logo
                                        </p>
                                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG up to 4MB • Not Mandatory</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                    <img
                                        src={logoPreview}
                                        alt="Factory logo preview"
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                            {data.logo?.name || 'Selected Logo'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {data.logo ? `${(data.logo.size / 1024).toFixed(1)} KB` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            {errors.logo && <p className="text-rose-500 text-[10px] mt-1">{errors.logo}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div className="lg:col-span-2">
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Factory / Business Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.business_name}
                                    onChange={e => setData('business_name', e.target.value)}
                                    placeholder="e.g. Apex Textile & Composite Garments Ltd"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                                {errors.business_name && <p className="text-rose-500 text-[10px] mt-1">{errors.business_name}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Industry Type
                                </label>
                                <select
                                    value={data.industry_type}
                                    onChange={e => setData('industry_type', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                >
                                    {industryTypes.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Contact Person (Factory Manager)
                                </label>
                                <input
                                    type="text"
                                    value={data.contact_person}
                                    onChange={e => setData('contact_person', e.target.value)}
                                    placeholder="e.g. Engr. Tanvir Ahmed"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Factory Direct Phone
                                </label>
                                <input
                                    type="text"
                                    value={data.factory_phone}
                                    onChange={e => setData('factory_phone', e.target.value)}
                                    placeholder="Direct landline or mobile"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    District
                                </label>
                                <div className="relative">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select
                                        value={data.district}
                                        onChange={e => setData('district', e.target.value)}
                                        className="w-full pl-9 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {districts.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Detailed Physical Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Plot #, Road #, Industrial Sector, Post Code..."
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: DEPARTMENT MACHINERY BREAKDOWN */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Department Machinery Breakdown</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure machine rows and line output by department</p>
                            </div>
                        </div>

                        {/* Department Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                {[
                                    { key: 'sewing', label: 'Sewing Lines' },
                                    { key: 'knitting', label: 'Knitting' },
                                    { key: 'fabric_dyeing', label: 'Fabric Dyeing' },
                                    { key: 'yarn_dyeing', label: 'Yarn Dyeing' },
                                    { key: 'print', label: 'Printing' },
                                    { key: 'embroidery', label: 'Embroidery' },
                                ].map(tab => (
                                    <button
                                        type="button"
                                        key={tab.key}
                                        onClick={() => setActiveDepartment(tab.key as any)}
                                        className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shrink-0 ${activeDepartment === tab.key
                                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Department Content Area */}
                            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 transition-colors">
                                {activeDepartment === 'sewing' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Number of Sewing Lines</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.production_capacities.sewing.no_of_lines}
                                                onChange={e => handleSewingChange('no_of_lines', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Capacity Per Line (Per Day)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.production_capacities.sewing.per_line_capacity}
                                                onChange={e => handleSewingChange('per_line_capacity', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Calculated Total Daily Capacity</label>
                                            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                                {data.production_capacities.sewing.total_capacity_per_day.toLocaleString()} Pcs / Day
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {data.production_capacities[activeDepartment]?.length || 0} machine types registered
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => addMachineRow(activeDepartment)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add Machine Entry</span>
                                            </button>
                                        </div>

                                        {(data.production_capacities[activeDepartment] || []).length === 0 ? (
                                            <div className="py-4 text-center text-slate-500 text-xs italic">
                                                No machinery records added for this department yet. Click "Add Machine Entry" above.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {(data.production_capacities[activeDepartment] || []).map((row, idx) => (
                                                    <div key={row.id || idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs items-center shadow-xs">
                                                        <div className="sm:col-span-2">
                                                            <input
                                                                type="text"
                                                                value={row.machine_type}
                                                                onChange={e => updateMachineRow(activeDepartment, idx, 'machine_type', e.target.value)}
                                                                placeholder="Machine model or description"
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={row.no_of_machine}
                                                                onChange={e => updateMachineRow(activeDepartment, idx, 'no_of_machine', e.target.value)}
                                                                className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono text-center"
                                                            />
                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">units</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                                                {row.total_capacity_per_day} {row.unit_type}/day
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMachineRow(activeDepartment, idx)}
                                                                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: LEGAL KYC & REGULATORY DOCUMENTS */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Regulatory Documentation & KYC Verification</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Trade License, Tax Identification, and Business Identification records.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Trade License Number</label>
                                <input
                                    type="text"
                                    value={data.trade_license_no}
                                    onChange={e => setData('trade_license_no', e.target.value)}
                                    placeholder="e.g. TRAD/GZP/2026/0192"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                                <div className="mt-2">
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Attach Trade License (PDF / Image)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setData('trade_license_file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">TIN Number</label>
                                <input
                                    type="text"
                                    value={data.tin_no}
                                    onChange={e => setData('tin_no', e.target.value)}
                                    placeholder="e.g. 748291028374"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                                <div className="mt-2">
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Attach TIN Certificate</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setData('tin_file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">BIN Number (VAT Reg)</label>
                                <input
                                    type="text"
                                    value={data.bin_no}
                                    onChange={e => setData('bin_no', e.target.value)}
                                    placeholder="e.g. 001928374-0101"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                                <div className="mt-2">
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Attach BIN Certificate</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setData('bin_file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-[11px] text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_verified}
                                    onChange={e => setData('is_verified', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Mark Factory as Verified & Trusted Badge
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* ACTION SUBMISSION BAR */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            href={route('admin.factories.index')}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>{processing ? 'Creating Factory Profile...' : 'Save & Create Factory'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
