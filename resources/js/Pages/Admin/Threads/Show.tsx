import React, { FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckCheck, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { MessageThreadRow } from '@/types';

interface Props {
    thread: MessageThreadRow;
}

export default function Show({ thread }: Props) {
    const messages = thread.messages_json || [];

    const form = useForm({
        message: '',
    });

    const submitReply = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.message.trim()) {
            return;
        }
        form.post(route('admin.threads.reply', thread.id), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AdminLayout title={thread.title}>
            <Head title={`Thread: ${thread.thread_code}`} />

            <div className="max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.threads.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Threads
                    </Link>

                    <div className="flex items-center gap-2">
                        {thread.unread_count > 0 && (
                            <button
                                type="button"
                                onClick={() => router.post(route('admin.threads.read', thread.id), {}, { preserveScroll: true })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> Mark Read ({thread.unread_count})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(`Delete thread ${thread.thread_code}?`)) {
                                    router.delete(route('admin.threads.destroy', thread.id));
                                }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>

                {/* Thread Header */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                        <span className="font-mono font-bold text-blue-600">{thread.thread_code}</span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{thread.title}</h2>
                        <p className="text-slate-500 mt-1">
                            Factory: <span className="font-semibold">{thread.factory?.name || thread.factory_code}</span> · Party:{' '}
                            <span className="font-semibold">{thread.party_code}</span>
                        </p>
                    </div>
                    {thread.order && (
                        <Link
                            href={route('admin.orders.show', thread.order.id)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold text-blue-600"
                        >
                            Order {thread.order.order_no} →
                        </Link>
                    )}
                </div>

                {/* Message Timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    {messages.map((msg, idx) => {
                        const isSystem = msg.s === 'sys' || msg.who === 'sys';
                        const isVendor = msg.s === 'ven' || msg.who === 'me';

                        return (
                            <div
                                key={idx}
                                className={`p-3.5 rounded-xl text-xs border ${
                                    isSystem
                                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                                        : isVendor
                                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                                        {isSystem && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                                        {msg.n || (isSystem ? 'ShilpoSetu Admin' : msg.s.toUpperCase())}
                                        <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900 text-[10px] uppercase font-mono text-slate-500">
                                            {msg.s}
                                        </span>
                                    </span>
                                    <span className="text-[11px] text-slate-400">{msg.t || '—'}</span>
                                </div>
                                {msg.txt && <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line">{msg.txt}</p>}
                                {!msg.txt && msg.voice && <p className="text-slate-500 italic">[Voice message attached]</p>}
                                {!msg.txt && msg.photo && <p className="text-slate-500 italic">[Photo attached]</p>}
                                {!msg.txt && msg.file && <p className="text-slate-500 italic">[File attached]</p>}
                            </div>
                        );
                    })}

                    {messages.length === 0 && <p className="text-center text-xs text-slate-400 py-8">No messages in this thread yet.</p>}
                </div>

                {/* Admin System Reply Box */}
                <form
                    onSubmit={submitReply}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs"
                >
                    <label className="block font-bold text-slate-900 dark:text-white">
                        Send Official SilpoSetu Admin Message (`sys` broadcast into thread)
                    </label>
                    <textarea
                        rows={3}
                        required
                        value={form.data.message}
                        onChange={(e) => form.setData('message', e.target.value)}
                        placeholder="Write support response or arbitration note visible to both factory & vendor..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    {form.errors.message && <p className="text-rose-500 text-[11px]">{form.errors.message}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Send className="w-3.5 h-3.5" /> Send System Reply
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
