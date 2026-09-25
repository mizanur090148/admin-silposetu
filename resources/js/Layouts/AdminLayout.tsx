import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Factory,
    Clock,
    Users,
    FileText,
    LogOut,
    CheckCircle,
    AlertCircle,
    Menu,
    X,
    Shield,
    ChevronRight,
    Cpu,
    Sun,
    Moon,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth, pendingCount, flash } = usePage<any>().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Light / Dark Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'dark'; // default to dark
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: LayoutDashboard,
            active: route().current('admin.dashboard') || route().current('admin.home'),
        },
        {
            name: 'Pending Verifications',
            href: route('admin.factories.index') + '?tab=pending',
            icon: Clock,
            active: route().current('admin.factories.*') && (new URLSearchParams(window.location.search).get('tab') === 'pending' || !new URLSearchParams(window.location.search).get('tab')),
            badge: pendingCount > 0 ? pendingCount : null,
            badgeColor: 'bg-amber-500 text-slate-950 font-black',
        },
        {
            name: 'All Factories',
            href: route('admin.factories.index') + '?tab=all',
            icon: Factory,
            active: route().current('admin.factories.*') && new URLSearchParams(window.location.search).get('tab') !== 'pending',
        },
        {
            name: 'Users',
            href: route('admin.users.index'),
            icon: Users,
            active: route().current('admin.users.*'),
        },
        {
            name: 'Machine Types',
            href: route('admin.machine-types.index'),
            icon: Cpu,
            active: route().current('admin.machine-types.*'),
        },
        {
            name: 'Subcontract Posts',
            href: route('admin.posts.index'),
            icon: FileText,
            active: route().current('admin.posts.*'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased transition-colors duration-150">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-sm tracking-wide text-slate-900 dark:text-white">Shilposetu</span>
                                <span className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 dark:border-blue-500/30">
                                    Admin
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Control Center</p>
                        </div>
                    </Link>
                </div>

                {/* Right Profile & Actions */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        type="button"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle Light / Dark theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-600" />
                        )}
                    </button>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{user?.name || 'Administrator'}</span>
                    </div>

                    <Link
                        href={route('admin.logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-4 shrink-0 transition-colors">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                        Main Menu
                    </div>
                    <nav className="space-y-1.5 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                                    item.active
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Pending review quick info card */}
                    {pendingCount > 0 && (
                        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-2 text-xs font-bold mb-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                                <span>{pendingCount} Factories Pending</span>
                            </div>
                            <p className="text-[10px] text-amber-700/90 dark:text-amber-200/80 leading-relaxed">
                                New factory registrations are awaiting review and verification.
                            </p>
                            <Link
                                href={route('admin.factories.index') + '?tab=pending'}
                                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                                View pending list <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </aside>

                {/* Mobile Drawer */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
                        <div className="relative w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col z-10 transition-colors">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">Menu</span>
                                <button onClick={() => setMobileOpen(false)} className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="space-y-1.5 flex-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            item.active
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/70 dark:bg-slate-950 transition-colors">
                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    )}
                    {flash?.importReport && (
                        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">Import Summary:</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                        {flash.importReport.imported} Created
                                    </span>
                                    {flash.importReport.skipped > 0 && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                            {flash.importReport.skipped} Skipped / Flagged
                                        </span>
                                    )}
                                </div>
                            </div>
                            {flash.importReport.errors && flash.importReport.errors.length > 0 && (
                                <div className="mt-2.5 text-xs text-amber-800 dark:text-amber-200/90 max-h-36 overflow-y-auto space-y-1 bg-amber-50/50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20 font-mono">
                                    {flash.importReport.errors.map((err: string, i: number) => (
                                        <div key={i} className="flex items-start gap-1.5">
                                            <span className="text-amber-500">•</span>
                                            <span>{err}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
