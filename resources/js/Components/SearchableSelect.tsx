import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableOption {
    value: string | number;
    label: string;
    subLabel?: string;
    category?: string;
}

interface SearchableSelectProps {
    options: SearchableOption[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    error,
    required = false,
    disabled = false,
    id,
    className = '',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Selected option object
    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Filter options based on search query
    const filteredOptions = options.filter((opt) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const matchLabel = opt.label.toLowerCase().includes(query);
        const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(query) : false;
        const matchCat = opt.category ? opt.category.toLowerCase().includes(query) : false;
        return matchLabel || matchSub || matchCat;
    });

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        } else if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleSelect = (val: string | number) => {
        onChange(String(val));
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Main Trigger Button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-left transition-all ${
                    error
                        ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500'
                        : isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex-1 min-w-0 pr-2">
                    {selectedOption ? (
                        <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.subLabel && (
                                <span className="text-[10px] text-slate-400 truncate">
                                    ({selectedOption.subLabel})
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {selectedOption && !required && (
                        <span
                            role="button"
                            onClick={handleClear}
                            className="p-0.5 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                            title="Clear"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
                    />
                </div>
            </button>

            {/* Hidden field for standard HTML form requirement if any */}
            {required && (
                <input
                    type="text"
                    value={value ? String(value) : ''}
                    required
                    onChange={() => {}}
                    tabIndex={-1}
                    className="sr-only"
                    aria-hidden="true"
                />
            )}

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search Field */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-slate-400">
                                <p className="font-semibold text-slate-600 dark:text-slate-400">No machine types match</p>
                                <p className="text-[11px] mt-0.5 text-slate-400">"{searchTerm}"</p>
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="truncate">{opt.label}</span>
                                                {opt.category && (
                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                                        {opt.category}
                                                    </span>
                                                )}
                                            </div>
                                            {opt.subLabel && (
                                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                                                    {opt.subLabel}
                                                </p>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="w-4 h-4 text-blue-600 shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
        </div>
    );
}
