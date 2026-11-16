import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckCircle2, Factory, MapPin, Sparkles, Trash2, XCircle } from 'lucide-react';
import { SubcontractPost } from '@/types';
import { formatDeadline } from '@/utils/date';

interface MatchItem {
    factory_id: number;
    factory_code: string;
    factory_name: string;
    factory_area: string | null;
    score: number;
    match_reason: string;
}

interface Props {
    post: SubcontractPost;
    matches: MatchItem[];
}

const QUOTE_BADGE: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function Show({ post, matches }: Props) {
    const updatePostStatus = (status: string) => {
        router.post(route('admin.posts.status', post.id), { status }, { preserveScroll: true });
    };

    const updateQuotationStatus = (quotationId: number, status: string) => {
        router.post(route('admin.posts.quotations.status', [post.id, quotationId]), { status }, { preserveScroll: true });
    };

    const handleDeletePost = () => {
        if (!confirm(`Delete subcontract post "${post.title}" permanently?`)) {
            return;
        }
        router.delete(route('admin.posts.destroy', post.id));
    };

    return (
        <AdminLayout title="Subcontract Post Details">
            <Head title={post.title} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.posts.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Posts
                    </Link>

                    <div className="flex items-center gap-2 text-xs">
                        <select
                            value={post.status}
                            onChange={(e) => updatePostStatus(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                            <option value="open">Status: Open</option>
                            <option value="awarded">Status: Awarded</option>
                            <option value="closed">Status: Closed</option>
                            <option value="cancelled">Status: Cancelled</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleDeletePost}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Post
                        </button>
                    </div>
                </div>

                {/* Main Post Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                        post.post_type === 'work_offer'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                    }`}
                                >
                                    {post.post_type === 'work_offer' ? 'Work Offer' : 'Machine Available'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 uppercase">
                                    {post.status}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{post.title}</h2>
                            {post.location && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3.5 h-3.5" /> {post.location}
                                </p>
                            )}
                        </div>

                        <div className="text-right text-xs">
                            <p className="text-slate-500">Quantity</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {Number(post.quantity_kg).toLocaleString()} kg
                            </p>
                            <p className="text-slate-500 mt-0.5">
                                {post.target_rate_tk ? `Target: ৳${post.target_rate_tk}/kg` : 'Target Rate: Negotiable'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                            <p className="text-[11px] text-slate-500">Fabric Type</p>
                            <p className="font-semibold">{post.fabric_type}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">GSM</p>
                            <p className="font-semibold">{post.gsm || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Dia</p>
                            <p className="font-semibold">{post.dia ? `${post.dia}"` : '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Gauge</p>
                            <p className="font-semibold">{post.gauge ? `GG ${post.gauge}` : '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Yarn Count</p>
                            <p className="font-semibold">{post.yarn_count || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Deadline</p>
                            <p className="font-semibold">{post.delivery_deadline ? formatDeadline(post.delivery_deadline) : '—'}</p>
                        </div>
                    </div>

                    {post.description && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                            {post.description}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-6 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <span className="text-slate-500">Factory: </span>
                            {post.factory ? (
                                <Link href={route('admin.factories.show', post.factory.id)} className="font-semibold text-blue-600 hover:underline">
                                    {post.factory.code} — {post.factory.name}
                                </Link>
                            ) : (
                                <span className="text-slate-400">Not linked</span>
                            )}
                        </div>
                        <div>
                            <span className="text-slate-500">Posted By: </span>
                            <span className="font-semibold">
                                {post.user ? `${post.user.name} (${post.user.phone})` : 'System'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quotations */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Quotations ({post.quotations?.length ?? 0})
                        </h3>

                        <div className="space-y-3">
                            {(post.quotations || []).map((q) => (
                                <div
                                    key={q.id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white">{q.bidder_name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${QUOTE_BADGE[q.status] || ''}`}>
                                                {q.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500">
                                            {q.bidder_phone || 'No phone'}
                                            {q.factory ? ` • ${q.factory.code} — ${q.factory.name}` : ''}
                                        </p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            ৳{q.offered_rate_tk}/kg • {q.estimated_days} days • {q.allocated_machines} machines
                                        </p>
                                        {q.note && <p className="text-slate-600 dark:text-slate-400">{q.note}</p>}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                        {q.status !== 'accepted' && (
                                            <button
                                                type="button"
                                                onClick={() => updateQuotationStatus(q.id, 'accepted')}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                                            </button>
                                        )}
                                        {q.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                onClick={() => updateQuotationStatus(q.id, 'rejected')}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        )}
                                        {q.status !== 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => updateQuotationStatus(q.id, 'pending')}
                                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                                            >
                                                Pending
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(post.quotations?.length ?? 0) === 0 && (
                                <p className="text-xs text-slate-400 py-6 text-center">No quotations submitted yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Matching Factories */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" /> Matching Factories
                        </h3>

                        {post.post_type === 'work_offer' ? (
                            <div className="space-y-2.5 text-xs">
                                {matches.map((m) => (
                                    <Link
                                        key={m.factory_id}
                                        href={route('admin.factories.show', m.factory_id)}
                                        className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                                <Factory className="w-3.5 h-3.5 text-blue-600" />
                                                {m.factory_code}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                Score {m.score}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">{m.factory_name}</p>
                                        <p className="text-[11px] text-slate-500">{m.factory_area || 'Area N/A'}</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">{m.match_reason}</p>
                                    </Link>
                                ))}
                                {matches.length === 0 && (
                                    <p className="text-slate-400 text-center py-6">No matching factories found based on machine specs.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Matching suggestions apply to Work Offer posts.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
