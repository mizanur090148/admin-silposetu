import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Shield, Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.login.store'));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-blue-600 selection:text-white">
            <Head title="অ্যাডমিন লগইন - শিল্পসেতু" />

            <div className="w-full max-w-md space-y-6">
                {/* Logo & Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-1">
                        <Shield className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white">শিল্পসেতু অ্যাডমিন কন্ট্রোল</h1>
                    <p className="text-xs text-slate-400">
                        শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটরদের প্রবেশের জন্য সংরক্ষিত
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                অ্যাডমিন ইমেইল (Admin Email)
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@silposetu.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                পাসওয়ার্ড (Password)
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0"
                                />
                                <span>আমাকে মনে রাখুন (Remember me)</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
                        >
                            <span>লগইন করুন (Sign In)</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="text-center text-[11px] text-slate-500">
                    শিল্পসেতু ইন্ডাস্ট্রিয়াল প্ল্যাটফর্ম © {new Date().getFullYear()} — সকল স্বত্ব সংরক্ষিত।
                </div>
            </div>
        </div>
    );
}
