import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Cpu,
    FileText,
    Flame,
    Layers,
    MapPin,
    PlusCircle,
    Search,
    ShieldCheck,
    Sparkles,
    UploadCloud
} from 'lucide-react';
import { KnittingType } from '@/types';

interface FactoryItem {
    id: number;
    user_id: number;
    business_name: string;
    district: string;
    address?: string | null;
    contact_person?: string | null;
    phone?: string | null;
    is_verified: boolean;
}

interface Props {
    factories: FactoryItem[];
    knittingTypes: KnittingType[];
    selectedFactoryId?: number | null;
}

const COMMON_MACHINE_TYPES = [
    'Circular Knitting Machine (Single Jersey)',
    'Circular Knitting Machine (Rib / Interlock)',
    'Circular Knitting Machine (3-End Fleece / Terry)',
    'Circular Knitting Machine (Pique & Lacoste)',
    'Circular Knitting Machine (Auto Stripe / Engineered)',
    'Circular Knitting Machine (Jacquard / Open Width)',
    'Flatbed Collar & Cuff Knitting Machine',
    'Computerized Flat Knitting Machine (Sweater)',
    'Seamless Body Size Knitting Machine',
    'Warp Knitting / Tricot Machine',
];

const COMMON_DISTRICTS = [
    'Gazipur',
    'Dhaka',
    'Narayanganj',
    'Ashulia',
    'Savar',
    'Tongi',
    'Chattogram',
    'Tangail',
    'Mymensingh',
    'Cumilla',
    'Narsingdi',
    'Sylhet',
    'Bhaluka',
];

export default function Create({ factories, knittingTypes, selectedFactoryId }: Props) {
    const [factorySearch, setFactorySearch] = useState('');

    const defaultFactory = useMemo(() => {
        if (selectedFactoryId) {
            return factories.find((f) => f.id === selectedFactoryId) || factories[0] || null;
        }
        return factories[0] || null;
    }, [factories, selectedFactoryId]);

    const initialCategory = knittingTypes[0]?.slug || 'single-jersey';

    const { data, setData, post, processing, errors } = useForm({
        factory_id: defaultFactory ? String(defaultFactory.id) : '',
        post_type: 'DEMAND' as 'DEMAND' | 'SUPPLY',
        category: initialCategory,
        title: '',
        target_quantity: 5000,
        unit: 'kg',
        target_rate: '',
        rate_negotiable: true,
        deadline: '',
        district: defaultFactory ? defaultFactory.district || 'Gazipur' : 'Gazipur',
        address: defaultFactory ? defaultFactory.address || '' : '',
        description: '',
        is_urgent: false,
        specs: {
            machine_type: 'Circular Knitting Machine (Single Jersey)',
            gauge_diameter: '24G / 30"',
            machine_qty: 6,
            capacity_per_machine: 350,
            total_capacity: 2100,
            fabric_gsm: '160 - 200 GSM',
            yarn_count: '30s/1 Combed Cotton',
        } as Record<string, any>,
    });

    const activeFactory = useMemo(() => {
        return factories.find((f) => String(f.id) === String(data.factory_id)) || null;
    }, [factories, data.factory_id]);

    const filteredFactories = useMemo(() => {
        if (!factorySearch.trim()) return factories;
        const q = factorySearch.toLowerCase();
        return factories.filter(
            (f) =>
                f.business_name.toLowerCase().includes(q) ||
                (f.district && f.district.toLowerCase().includes(q)) ||
                (f.contact_person && f.contact_person.toLowerCase().includes(q)) ||
                (f.phone && f.phone.includes(q))
        );
    }, [factories, factorySearch]);

    const handleFactoryChange = (newFactoryId: string) => {
        setData((prev) => {
            const matched = factories.find((f) => String(f.id) === newFactoryId);
            return {
                ...prev,
                factory_id: newFactoryId,
                district: matched?.district || prev.district,
                address: matched?.address || prev.address,
            };
        });
    };

    const handleSpecChange = (field: string, val: any) => {
        setData('specs', {
            ...data.specs,
            [field]: val,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.posts.store'));
    };

    return (
        <AdminLayout title="Post Subcontract Order for Factory">
            <Head title="Create Subcontract Post for Factory - Shilposetu Admin" />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                {/* Top Breadcrumb & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <Link href={route('admin.posts.index')} className="hover:text-blue-600 transition flex items-center gap-1">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Subcontract Orders</span>
                            </Link>
                            <span>/</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Admin Publisher</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Post Subcontract on Behalf of a Factory</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                Live Marketplace Feed
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Publish an extra order demand or idle capacity post directly to the platform feed. The post will appear under the selected factory's profile.
                        </p>
                    </div>

                    <Link
                        href={route('admin.posts.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cancel & Return</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: Target Factory Selection */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    1. Select Target Factory (Post Author)
                                </h2>
                            </div>
                            <span className="text-[11px] text-slate-400">
                                {factories.length} Registered Factories
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Choose Factory Unit <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.factory_id}
                                    onChange={(e) => handleFactoryChange(e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition"
                                >
                                    <option value="" disabled>-- Select a Factory --</option>
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.business_name} ({f.district || 'Location N/A'}) {f.is_verified ? '✓ Verified' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.factory_id && (
                                    <p className="text-[11px] text-rose-500 mt-1">{errors.factory_id}</p>
                                )}
                            </div>

                            {/* Active Factory Summary Card */}
                            {activeFactory ? (
                                <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-xl flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {activeFactory.business_name}
                                            </span>
                                            {activeFactory.is_verified ? (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-full">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                                            <p className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                <span>{activeFactory.district} • {activeFactory.address || 'Address not listed'}</span>
                                            </p>
                                            <p className="text-slate-500">
                                                Contact: {activeFactory.contact_person || 'N/A'} {activeFactory.phone ? `(${activeFactory.phone})` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-blue-600 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 shrink-0">
                                        ID: #{activeFactory.id}
                                    </span>
                                </div>
                            ) : (
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-center">
                                    Select a factory above to preview verification details
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: Order Core Information */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                2. Order Information & Commercial Terms
                            </h2>
                            <span className="text-[11px] text-slate-400">Required fields marked with *</span>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Post / Order Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Requirement for 25,000 Kg Single Jersey 100% Cotton 24G Knitting"
                                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition"
                            />
                            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Fabric Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Knitting Category <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition"
                                >
                                    {knittingTypes.map((kt) => (
                                        <option key={kt.id} value={kt.slug}>
                                            {kt.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-[11px] text-rose-500 mt-1">{errors.category}</p>}
                            </div>

                            {/* Target Quantity & Unit */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Quantity <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={data.target_quantity}
                                        onChange={(e) => setData('target_quantity', parseInt(e.target.value) || 0)}
                                        className="w-2/3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 transition"
                                    />
                                    <select
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        className="w-1/3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition"
                                    >
                                        <option value="kg">Kg</option>
                                        <option value="pcs">Pcs</option>
                                        <option value="yards">Yards</option>
                                        <option value="lbs">Lbs</option>
                                        <option value="rolls">Rolls</option>
                                        <option value="meters">Meters</option>
                                    </select>
                                </div>
                                {errors.target_quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.target_quantity}</p>}
                            </div>

                            {/* Target Rate */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Rate (BDT / Unit)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.target_rate}
                                        onChange={(e) => setData('target_rate', e.target.value)}
                                        placeholder="e.g. 45.00"
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 absolute right-2.5 top-2.5">
                                        ৳
                                    </span>
                                </div>
                                <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.rate_negotiable}
                                        onChange={(e) => setData('rate_negotiable', e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500 text-xs"
                                    />
                                    <span>Rate is negotiable</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                            {/* Deadline */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Delivery Deadline / Target Date
                                </label>
                                <input
                                    type="date"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    District / Region <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.district}
                                    onChange={(e) => setData('district', e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold transition"
                                >
                                    {COMMON_DISTRICTS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Factory Address / Industrial Zone
                                </label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g. Konabari, Gazipur"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Urgent Badge Toggle */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="inline-flex items-center gap-2 p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs font-semibold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_urgent}
                                    onChange={(e) => setData('is_urgent', e.target.checked)}
                                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                                />
                                <Flame className="w-4 h-4 text-rose-500" />
                                <span>Mark as Urgent Priority (Displays Flame badge and tops urgent feeds)</span>
                            </label>
                        </div>
                    </div>

                    {/* SECTION 3: Technical Specifications */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <Cpu className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    3. Machinery & Fabric Specifications (Technical Specs)
                                </h2>
                            </div>
                            <span className="text-[11px] text-slate-400">Helps factories match machinery</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Machine Type Required
                                </label>
                                <select
                                    value={data.specs.machine_type || ''}
                                    onChange={(e) => handleSpecChange('machine_type', e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                >
                                    {COMMON_MACHINE_TYPES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Gauge & Diameter
                                </label>
                                <input
                                    type="text"
                                    value={data.specs.gauge_diameter || ''}
                                    onChange={(e) => handleSpecChange('gauge_diameter', e.target.value)}
                                    placeholder="e.g. 24G / 30 Inch"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Fabric GSM / Weight
                                </label>
                                <input
                                    type="text"
                                    value={data.specs.fabric_gsm || ''}
                                    onChange={(e) => handleSpecChange('fabric_gsm', e.target.value)}
                                    placeholder="e.g. 180 - 200 GSM"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Yarn Count & Composition
                                </label>
                                <input
                                    type="text"
                                    value={data.specs.yarn_count || ''}
                                    onChange={(e) => handleSpecChange('yarn_count', e.target.value)}
                                    placeholder="e.g. 30s/1 Combed Cotton"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Required Machine Count
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={data.specs.machine_qty || ''}
                                    onChange={(e) => handleSpecChange('machine_qty', parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 4"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Daily Capacity (Kg/day)
                                </label>
                                <input
                                    type="number"
                                    value={data.specs.total_capacity || ''}
                                    onChange={(e) => handleSpecChange('total_capacity', parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 1500"
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Detailed Description & Work Scope */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                4. Detailed Description & Quality Terms <span className="text-rose-500">*</span>
                            </h2>
                            <span className="text-[11px] text-slate-400">Visible to bidding factories</span>
                        </div>

                        <div>
                            <textarea
                                required
                                rows={5}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe the order in detail: yarn supply arrangement, tolerance rate, sample approval process, payment/delivery terms, QA lab testing requirements, inspection guidelines..."
                                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium transition"
                            />
                            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                        <Link
                            href={route('admin.posts.index')}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                            Cancel and discard
                        </Link>

                        <button
                            type="submit"
                            disabled={processing || !data.factory_id}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{processing ? 'Publishing Subcontract Post...' : 'Publish Subcontract Post to Live Feed'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
