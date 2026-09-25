import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationLink } from '@/types';

interface PaginationProps {
    links?: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
    perPage?: number;
    onPerPageChange?: (perPage: number) => void;
    itemName?: string;
    className?: string;
}

export default function Pagination({
    links = [],
    from,
    to,
    total = 0,
    perPage,
    onPerPageChange,
    itemName = 'records',
    className = '',
}: PaginationProps) {
    if (total === 0) return null;

    // Helper to format HTML entity labels like &laquo; Previous or Next &raquo;
    const formatLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('laquo')) {
            return (
                <span className="flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                </span>
            );
        }
        if (label.includes('Next') || label.includes('raquo')) {
            return (
                <span className="flex items-center gap-1">
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </span>
            );
        }
        return label;
    };

    return (
        <div className={`border-t border-slate-200 dark:border-slate-800 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
            {/* Counter text and optional perPage selector */}
            <div className="flex flex-wrap items-center gap-3">
                <div>
                    {from !== null && from !== undefined && to !== null && to !== undefined ? (
                        <span>
                            Showing <span className="font-semibold text-slate-900 dark:text-white">{from}</span> to{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">{to}</span> of{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</span> {itemName}
                        </span>
                    ) : (
                        <span>
                            Total <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</span> {itemName}
                        </span>
                    )}
                </div>

                {onPerPageChange && perPage && (
                    <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[11px] text-slate-400">Per page:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 py-1 px-2 focus:outline-none focus:border-blue-500 shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination Links list */}
            {links.length > 3 && (
                <nav className="flex items-center gap-1 flex-wrap justify-center sm:justify-end" aria-label="Pagination Navigation">
                    {links.map((link, index) => {
                        const isPrev = index === 0;
                        const isNext = index === links.length - 1;
                        const disabled = !link.url;

                        if (disabled) {
                            return (
                                <span
                                    key={index}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 cursor-not-allowed select-none ${
                                        isPrev || isNext ? 'px-3' : ''
                                    }`}
                                >
                                    {formatLabel(link.label)}
                                </span>
                            );
                        }

                        if (link.active) {
                            return (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 border border-blue-600 shadow-sm shadow-blue-600/25 select-none"
                                >
                                    {formatLabel(link.label)}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url!}
                                preserveScroll
                                preserveState
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition ${
                                    isPrev || isNext ? 'px-3' : ''
                                }`}
                            >
                                {formatLabel(link.label)}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
