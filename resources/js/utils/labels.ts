export const ROLE_META: Record<string, { label: string; badgeClass: string }> = {
    admin: {
        label: 'Admin',
        badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    fac: {
        label: 'Factory',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    ven: {
        label: 'Vendor',
        badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    sup: {
        label: 'Supplier',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    par: {
        label: 'Partner',
        badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
};

export const PLAN_META: Record<
    string,
    { code: string; name: string; bnName: string; maxMachines: number | null; monthlyTk: number; badgeClass: string }
> = {
    s: {
        code: 's',
        name: 'Starter',
        bnName: 'স্টার্টার',
        maxMachines: 10,
        monthlyTk: 1000,
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    g: {
        code: 'g',
        name: 'Growth',
        bnName: 'গ্রোথ',
        maxMachines: 25,
        monthlyTk: 1500,
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    p: {
        code: 'p',
        name: 'Pro',
        bnName: 'প্রো',
        maxMachines: 60,
        monthlyTk: 2500,
        badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    e: {
        code: 'e',
        name: 'Enterprise',
        bnName: 'এন্টারপ্রাইজ',
        maxMachines: null,
        monthlyTk: 4000,
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    free: {
        code: 'free',
        name: 'Free',
        bnName: 'ফ্রি',
        maxMachines: 5,
        monthlyTk: 0,
        badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
};

export function getPlanMeta(code?: string | null) {
    const key = String(code || '').trim().toLowerCase();

    return (
        PLAN_META[key] || {
            code: key || 'g',
            name: (key || 'G').toUpperCase(),
            bnName: (key || 'G').toUpperCase(),
            maxMachines: null,
            monthlyTk: 0,
            badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        }
    );
}

export function getTrialStatus(trialEndsAt?: string | null): { label: string; cls: string } {
    if (!trialEndsAt) {
        return { label: 'Paid / Active', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
    }

    const diffDays = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        return { label: 'Trial Expired', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' };
    }

    if (diffDays <= 7) {
        return { label: `Trial ${diffDays}d left`, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
    }

    return { label: `Trial (${diffDays}d)`, cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' };
}

export function getOrderStatusMeta(status: string): { key: 'run' | 'wait' | 'done'; label: string; badgeClass: string } {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'done' || normalized === 'completed' || normalized === 'delivered') {
        return {
            key: 'done',
            label: 'Completed',
            badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        };
    }

    if (normalized === 'wait' || normalized === 'pending') {
        return {
            key: 'wait',
            label: 'Waiting Yarn',
            badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        };
    }

    return {
        key: 'run',
        label: 'Running',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
}

export const SUPPLIER_CATEGORY_LABELS: Record<string, string> = {
    mc: 'Machinery (MC)',
    sinker: 'Needles & Sinkers',
    oil: 'Knitting Oil',
    spare: 'Spare Parts',
    elec: 'Electrical Goods',
};

export const JOB_CATEGORY_LABELS: Record<string, string> = {
    op: 'Knitting Operator',
    sup: 'Supervisor',
    tech: 'Technician',
    qc: 'Fabric QC',
    mer: 'Merchandiser',
};

export function parseMachineStatus(status: string): { key: 'idle' | 'run' | 'down'; label: string; badgeClass: string } {
    if (status === 'idle') {
        return {
            key: 'idle',
            label: 'Idle (Free)',
            badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        };
    }

    if (status === 'down') {
        return {
            key: 'down',
            label: 'Down / Maint.',
            badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        };
    }

    return {
        key: 'run',
        label: status.startsWith('run:') ? `Running (${status.slice(4)})` : status,
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
}
