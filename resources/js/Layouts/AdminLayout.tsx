import React, { useState, useEffect, PropsWithChildren } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    Cpu,
    Users,
    Briefcase,
    LogOut,
    Menu,
    X,
    CheckCircle2,
    AlertCircle,
    Sun,
    Moon,
    Radio,
    PackageCheck,
    FileSpreadsheet,
    Handshake,
    Megaphone,
    UserSearch,
    Store,
    MessageSquareText,
    Receipt,
    ClipboardList,
    ClipboardCheck,
    UserCheck,
} from 'lucide-react';
import { PageProps } from '@/types';

interface AdminLayoutProps extends PropsWithChildren {
    title?: string;
}

interface NavItem {
    label: string;
    href: string;
    active: boolean;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth, badges, flash } = usePage<PageProps>().props;
    const currentUrl = usePage().url;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.logout'));
    };

    const navGroups: NavGroup[] = [
        {
            title: 'Overview',
            items: [
                {
                    label: 'Dashboard',
                    href: route('admin.dashboard'),
                    active: currentUrl === '/' || currentUrl.startsWith('/dashboard'),
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: 'Operations & ERP',
            items: [
                {
                    label: 'Subcontract Orders',
                    href: route('admin.orders.index'),
                    active: currentUrl.startsWith('/orders'),
                    icon: ClipboardList,
                },
                {
                    label: 'Floor Production & QC',
                    href: route('admin.floor-erp.index'),
                    active: currentUrl.startsWith('/floor-erp'),
                    icon: ClipboardCheck,
                    badge: badges?.pendingQc || 0,
                },
                {
                    label: 'Billing & Expenses',
                    href: route('admin.bills.index'),
                    active: currentUrl.startsWith('/billing'),
                    icon: Receipt,
                },
                {
                    label: 'Staff & Attendance',
                    href: route('admin.workforce.index'),
                    active: currentUrl.startsWith('/workforce'),
                    icon: UserCheck,
                },
                {
                    label: 'Order Threads',
                    href: route('admin.threads.index'),
                    active: currentUrl.startsWith('/threads'),
                    icon: MessageSquareText,
                    badge: badges?.unreadThreads || 0,
                },
            ],
        },
        {
            title: 'Subcontract Marketplace',
            items: [
                {
                    label: 'Subcontract Posts',
                    href: route('admin.posts.index'),
                    active: currentUrl.startsWith('/posts'),
                    icon: Briefcase,
                },
                {
                    label: 'Free Machine Requests',
                    href: route('admin.free-machine-requests.index'),
                    active: currentUrl.startsWith('/free-machine-requests'),
                    icon: Radio,
                    badge: badges?.newMachineRequests || 0,
                },
            ],
        },
        {
            title: 'Directory & Ecosystem',
            items: [
                {
                    label: 'Suppliers',
                    href: route('admin.suppliers.index'),
                    active: currentUrl.startsWith('/suppliers'),
                    icon: PackageCheck,
                },
                {
                    label: 'Supplier RFQs',
                    href: route('admin.supplier-rfqs.index'),
                    active: currentUrl.startsWith('/supplier-rfqs'),
                    icon: FileSpreadsheet,
                    badge: badges?.newRfqs || 0,
                },
                {
                    label: 'Vendors',
                    href: route('admin.vendors.index'),
                    active: currentUrl.startsWith('/vendors'),
                    icon: Store,
                },
                {
                    label: 'Partners',
                    href: route('admin.partners.index'),
                    active: currentUrl.startsWith('/partners'),
                    icon: Handshake,
                },
            ],
        },
        {
            title: 'Growth & Hiring',
            items: [
                {
                    label: 'Advertisements',
                    href: route('admin.advertisements.index'),
                    active: currentUrl.startsWith('/advertisements'),
                    icon: Megaphone,
                    badge: badges?.pendingAds || 0,
                },
                {
                    label: 'Job Board',
                    href: route('admin.jobs.index'),
                    active: currentUrl.startsWith('/jobs'),
                    icon: UserSearch,
                },
            ],
        },
        {
            title: 'Users & Factories',
            items: [
                {
                    label: 'Users & Accounts',
                    href: route('admin.users.index'),
                    active: currentUrl.startsWith('/users'),
                    icon: Users,
                },
                {
                    label: 'Factories',
                    href: route('admin.factories.index'),
                    active: currentUrl.startsWith('/factories'),
                    icon: Building2,
                },
                {
                    label: 'Factory Machines',
                    href: route('admin.factory-machines.index'),
                    active: currentUrl.startsWith('/factory-machines'),
                    icon: Cpu,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-white">ShilpoSetu</span>
                            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Admin Portal</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 text-slate-400 hover:text-white lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                {group.title}
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                item.active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2.5 truncate">
                                                <Icon className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{item.label}</span>
                                            </span>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/60">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {auth.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{auth.user?.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{auth.user?.email || auth.user?.phone}</p>
                        </div>
                        <form onSubmit={handleLogout}>
                            <button
                                type="submit"
                                title="Log Out"
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-700/60 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {title && <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </header>

                {toast && (
                    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-2">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                                toast.type === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                    : 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                            }`}
                        >
                            {toast.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            )}
                            <span className="flex-1">{toast.message}</span>
                            <button onClick={() => setToast(null)} className="text-current opacity-70 hover:opacity-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}
