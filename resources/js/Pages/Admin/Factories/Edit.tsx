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
    ExternalLink,
    Save
} from 'lucide-react';
import { MachineType, NonSewingMachineRow, SewingCapacity } from '@/types';

interface Props {
    user: {
        id: number;
        customer_id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        nid_number?: string;
        is_subscribed?: boolean;
        factory?: {
            id: number;
            business_name: string;
            logo?: string | null;
            industry_type?: string;
            contact_person?: string;
            phone?: string;
            email?: string;
            district?: string;
            address?: string;
            total_lines?: number;
            total_machines?: number;
            daily_capacity?: string;
            rating?: number;
            is_verified?: boolean;
            capabilities?: string[];
            production_capacities?: {
                sewing?: SewingCapacity;
                knitting?: NonSewingMachineRow[];
                yarn_dyeing?: NonSewingMachineRow[];
                fabric_dyeing?: NonSewingMachineRow[];
                print?: NonSewingMachineRow[];
                embroidery?: NonSewingMachineRow[];
            };
            trade_license_no?: string;
            trade_license_file?: string;
            tin_no?: string;
            tin_file?: string;
            bin_no?: string;
            bin_file?: string;
            nid_file?: string;
        };
    };
    machineTypes: MachineType[];
    districts: string[];
    industryTypes: string[];
    commonCapabilities: string[];
}

export default function Edit({
    user,
    machineTypes,
    districts,
    industryTypes,
    commonCapabilities,
}: Props) {
    const factory = user.factory;
    const [activeDepartment, setActiveDepartment] = useState<'sewing' | 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery'>('sewing');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        factory?.logo ? `/storage/${factory.logo}` : null
    );

    const initialSewing: SewingCapacity = factory?.production_capacities?.sewing || {
        no_of_lines: factory?.total_lines || 12,
        per_line_capacity: 1000,
        total_capacity_per_day: (factory?.total_lines || 12) * 1000,
        unit: 'Pcs',
    };

    const { data, setData, post, processing, errors } = useForm<{
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
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        customer_id: user.customer_id || '',
        nid_number: user.nid_number || '',
        status: user.status || 'active',
        is_subscribed: user.is_subscribed ?? true,
        business_name: factory?.business_name || '',
        logo: null,
        industry_type: factory?.industry_type || industryTypes[0] || 'Apparel & Garments',
        contact_person: factory?.contact_person || '',
        factory_phone: factory?.phone || '',
        factory_email: factory?.email || '',
        district: factory?.district || districts[0] || 'Gazipur',
        address: factory?.address || '',
        total_lines: factory?.total_lines ?? '',
        total_machines: factory?.total_machines ?? '',
        daily_capacity: factory?.daily_capacity || '',
        rating: factory?.rating ?? 5.0,
        is_verified: factory?.is_verified ?? true,
        capabilities: factory?.capabilities || ['Sewing Production', 'Finishing & Packing'],
        production_capacities: {
            sewing: initialSewing,
            knitting: factory?.production_capacities?.knitting || [],
            yarn_dyeing: factory?.production_capacities?.yarn_dyeing || [],
            fabric_dyeing: factory?.production_capacities?.fabric_dyeing || [],
            print: factory?.production_capacities?.print || [],
            embroidery: factory?.production_capacities?.embroidery || [],
        },
        trade_license_no: factory?.trade_license_no || '',
        tin_no: factory?.tin_no || '',
        bin_no: factory?.bin_no || '',
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
            setLogoPreview(factory?.logo ? `/storage/${factory.logo}` : null);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const toggleCapability = (cap: string) => {
        if (data.capabilities.includes(cap)) {
            setData('capabilities', data.capabilities.filter(c => c !== cap));
        } else {
            setData('capabilities', [...data.capabilities, cap]);
        }
    };

    const addCustomCapability = () => {
        const trimmed = customTagInput.trim();
        if (trimmed && !data.capabilities.includes(trimmed)) {
            setData('capabilities', [...data.capabilities, trimmed]);
            setCustomTagInput('');
        }
    };

    const updateSewingField = (field: keyof SewingCapacity, val: any) => {
        const current = { ...data.production_capacities.sewing };
        (current as any)[field] = val;

        if (field === 'no_of_lines' || field === 'per_line_capacity') {
            const lines = field === 'no_of_lines' ? Number(val) : Number(current.no_of_lines);
            const perLine = field === 'per_line_capacity' ? Number(val) : Number(current.per_line_capacity);
            current.total_capacity_per_day = (lines || 0) * (perLine || 0);

            setData('production_capacities', {
                ...data.production_capacities,
                sewing: current,
            });
            setData('total_lines', lines);
            setData('daily_capacity', `${(lines * perLine).toLocaleString()} ${current.unit || 'Pcs'}/Day`);
            return;
        }

        setData('production_capacities', {
            ...data.production_capacities,
            sewing: current,
        });
    };

    const addMachineRow = (category: 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery') => {
        const categoryTypes = machineTypes.filter(m => m.category === category);
        const defaultType = categoryTypes[0]?.name || 'Standard Machine';
        const defaultUnit = categoryTypes[0]?.default_unit || 'Kg/Day';

        const newRow: NonSewingMachineRow = {
            id: 'row_' + Date.now(),
            machine_type: defaultType,
            machine_type_id: categoryTypes[0]?.id || null,
            no_of_machine: 5,
            capacity_per_machine: 100,
            total_capacity_per_day: 500,
            rate: '',
            unit_type: defaultUnit,
        };

        setData('production_capacities', {
            ...data.production_capacities,
            [category]: [...(data.production_capacities[category] || []), newRow],
        });
    };

    const updateMachineRow = (
        category: 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery',
        index: number,
        field: keyof NonSewingMachineRow,
        val: any
    ) => {
        const rows = [...(data.production_capacities[category] || [])];
        const row = { ...rows[index] };
        (row as any)[field] = val;

        if (field === 'machine_type') {
            const matched = machineTypes.find(m => m.name === val);
            if (matched) {
                row.machine_type_id = matched.id;
                row.unit_type = matched.default_unit;
            }
        }

        if (field === 'no_of_machine' || field === 'capacity_per_machine') {
            const count = field === 'no_of_machine' ? Number(val) : Number(row.no_of_machine);
            const cap = field === 'capacity_per_machine' ? Number(val) : Number(row.capacity_per_machine);
            row.total_capacity_per_day = (count || 0) * (cap || 0);
        }

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
        post(route('admin.factories.update', user.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title={`Edit Factory: ${factory?.business_name || user.name}`}>
            <Head title={`Edit Factory: ${factory?.business_name || user.name} - Shilposetu Admin`} />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Top Navigation & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.factories.show', user.id)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
                            title="Back to Factory Overview"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                                    Edit Factory Profile
                                </h1>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 dark:border-blue-500/30">
                                    ID: {user.customer_id || `S${user.id}`}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Modify business identity, credentials, machinery capacity, and verification status.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href={route('admin.factories.show', user.id)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition shadow-xs"
                        >
                            <span>Cancel</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                        </button>
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
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Contact Person & Account Login</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">The primary user account and credentials for this factory.</p>
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
                                    Reset Password <span className="text-slate-400 font-normal text-[11px]">(Leave blank to keep existing)</span>
                                </label>
                                <div className="relative">
                                    <KeyRound className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="w-full pl-9 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {errors.password && <p className="text-rose-500 text-[10px] mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Custom Customer ID
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_id}
                                    onChange={e => setData('customer_id', e.target.value)}
                                    placeholder="S2026xxxx"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-blue-600 dark:text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                                />
                                {errors.customer_id && <p className="text-rose-500 text-[10px] mt-1">{errors.customer_id}</p>}
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
                                    <option value="active">Active (Access Allowed)</option>
                                    <option value="pending">Pending KYC Review</option>
                                    <option value="suspended">Suspended / Blocked</option>
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

                        {/* Factory Logo Upload */}
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
                                        <span>Remove Logo</span>
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
                                            {data.logo?.name || 'Current Factory Logo'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {data.logo ? `${(data.logo.size / 1024).toFixed(1)} KB (New upload)` : 'Saved in storage'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
                                    >
                                        Change Logo
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
                                    placeholder="Leave blank to use owner name"
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
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure machine rows and line output by department.</p>
                            </div>
                        </div>

                        {/* Department Tab Selector */}
                        <div className="pt-2">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
                                {[
                                    { key: 'sewing', label: 'Sewing Department', icon: Scissors },
                                    { key: 'knitting', label: 'Knitting', icon: Cpu },
                                    { key: 'yarn_dyeing', label: 'Yarn Dyeing', icon: Layers },
                                    { key: 'fabric_dyeing', label: 'Fabric Dyeing', icon: Layers },
                                    { key: 'print', label: 'Printing', icon: Sparkles },
                                    { key: 'embroidery', label: 'Embroidery', icon: Sparkles },
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeDepartment === tab.key;
                                    return (
                                        <button
                                            type="button"
                                            key={tab.key}
                                            onClick={() => setActiveDepartment(tab.key as any)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${isActive
                                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content 1: Sewing Department */}
                            {activeDepartment === 'sewing' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 mt-3 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Sewing Line Structure & Capacities
                                        </span>
                                        <span className="text-[11px] text-slate-500">Auto-calculates daily total output</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Number of Sewing Lines</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.production_capacities.sewing?.no_of_lines || ''}
                                                onChange={e => updateSewingField('no_of_lines', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Per Line Capacity / Day</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.production_capacities.sewing?.per_line_capacity || ''}
                                                onChange={e => updateSewingField('per_line_capacity', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Total Daily Capacity</label>
                                            <input
                                                type="number"
                                                readOnly
                                                value={data.production_capacities.sewing?.total_capacity_per_day || 0}
                                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-blue-600 dark:text-blue-400 font-bold focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 dark:text-slate-400 mb-1">Unit of Measure</label>
                                            <input
                                                type="text"
                                                value={data.production_capacities.sewing?.unit || 'Pcs'}
                                                onChange={e => updateSewingField('unit', e.target.value)}
                                                placeholder="Pcs, Sets, Dozen"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content 2..6: Non-Sewing Departments */}
                            {activeDepartment !== 'sewing' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 mt-3 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                                                {activeDepartment.replace('_', ' ')} Machine Roster
                                            </span>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Define machinery rows, counts, and output capacities.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addMachineRow(activeDepartment)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Machine Row</span>
                                        </button>
                                    </div>

                                    {(data.production_capacities[activeDepartment] || []).length === 0 ? (
                                        <div className="py-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                                            No machines registered under this department yet. Click "Add Machine Row" to register machine units.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(data.production_capacities[activeDepartment] || []).map((row, idx) => (
                                                <div key={row.id || idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[11px] text-slate-500 mb-1">Machine Type</label>
                                                        <select
                                                            value={row.machine_type}
                                                            onChange={e => updateMachineRow(activeDepartment, idx, 'machine_type', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                                        >
                                                            {machineTypes.filter(m => m.category === activeDepartment).map(m => (
                                                                <option key={m.id} value={m.name}>{m.name}</option>
                                                            ))}
                                                            <option value="Other">Other / Custom Machinery</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-slate-500 mb-1">No. of Machines</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={row.no_of_machine || ''}
                                                            onChange={e => updateMachineRow(activeDepartment, idx, 'no_of_machine', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-slate-500 mb-1">Daily Cap. / Machine</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={row.capacity_per_machine || ''}
                                                                onChange={e => updateMachineRow(activeDepartment, idx, 'capacity_per_machine', e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                                            />
                                                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{row.unit_type || 'Kg'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-0">
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-slate-400 block">Total Capacity</span>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                                                                {row.total_capacity_per_day} {row.unit_type || 'Kg'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMachineRow(activeDepartment, idx)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                                            title="Delete row"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                    {/* SECTION 4: LEGAL & KYC DOCUMENTS */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Legal & Verification Documents (KYC)</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Trade License, TIN, BIN numbers and verification document files.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    Trade License Number
                                </label>
                                <input
                                    type="text"
                                    value={data.trade_license_no}
                                    onChange={e => setData('trade_license_no', e.target.value)}
                                    placeholder="TRAD/DH/2026/xxxx"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    TIN Certificate Number
                                </label>
                                <input
                                    type="text"
                                    value={data.tin_no}
                                    onChange={e => setData('tin_no', e.target.value)}
                                    placeholder="12-digit e-TIN"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    BIN / VAT Registration
                                </label>
                                <input
                                    type="text"
                                    value={data.bin_no}
                                    onChange={e => setData('bin_no', e.target.value)}
                                    placeholder="001xxxxxx-0101"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>
                        </div>

                        {/* File Uploads Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
                            {[
                                { key: 'trade_license_file', label: 'Trade License File', existing: factory?.trade_license_file },
                                { key: 'tin_file', label: 'TIN Certificate File', existing: factory?.tin_file },
                                { key: 'bin_file', label: 'BIN / VAT Certificate', existing: factory?.bin_file },
                                { key: 'nid_file', label: 'Owner NID Copy', existing: factory?.nid_file },
                            ].map(item => (
                                <div key={item.key} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">{item.label}</span>
                                        {item.existing && (
                                            <a
                                                href={`/storage/${item.existing}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                                            >
                                                <span>View file</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setData(item.key as any, e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                                    />
                                    {(errors as any)[item.key] && (
                                        <p className="text-rose-500 text-[10px]">{(errors as any)[item.key]}</p>
                                    )}
                                </div>
                            ))}
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
                                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    Mark as Verified Industrial Partner
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            href={route('admin.factories.show', user.id)}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Saving Updates...' : 'Update Factory Profile'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
