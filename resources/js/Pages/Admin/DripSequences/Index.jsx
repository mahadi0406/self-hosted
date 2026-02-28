import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Zap, Plus, Trash2, Eye, Search,
    Smartphone, Send, CheckCircle, PauseCircle,
    Archive, Users, Sparkles, ListOrdered,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

const statusColor = (status) => ({
    active:   'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    paused:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    archived: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
}[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800');

const StatusIcon = ({ status }) => ({
    active:   <CheckCircle className="w-3 h-3 shrink-0" />,
    paused:   <PauseCircle className="w-3 h-3 shrink-0" />,
    archived: <Archive className="w-3 h-3 shrink-0" />,
}[status] ?? null);

const ChannelBadge = ({ type }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        type === 'whatsapp'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
            : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    }`}>
        {type === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Send className="w-3 h-3" />}
        {type === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
    </span>
);

const Index = ({ sequences, stats, channels, filters }) => {
    const [search, setSearch]       = useState(filters?.search     || '');
    const [status, setStatus]       = useState(filters?.status     || 'all');
    const [channelId, setChannelId] = useState(filters?.channel_id || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected]   = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)              params.search     = search;
        if (status !== 'all')    params.status     = status;
        if (channelId !== 'all') params.channel_id = channelId;
        router.get('/admin/drip-sequences', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setStatus('all'); setChannelId('all');
        router.get('/admin/drip-sequences', {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (seq) => {
        if (!confirm('Are you sure you want to delete this drip sequence?')) return;
        router.delete(`/admin/drip-sequences/${seq.id}`, {
            onSuccess: () => toast.success('Drip sequence deleted!'),
            onError:   () => toast.error('Failed to delete drip sequence.'),
        });
    };

    return (
        <Layout pageTitle="Drip Sequences" pageSection="Messaging">
            <Head title="Drip Sequences" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total',       value: stats.total,      icon: Zap },
                            { label: 'Active',      value: stats.active,     icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'Paused',      value: stats.paused,     icon: PauseCircle, accent: 'text-amber-600' },
                            { label: 'AI Created',  value: stats.ai_created, icon: Sparkles,    accent: 'text-purple-600' },
                        ].map(({ label, value, icon: Icon, accent }) => (
                            <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                                    {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
                                </div>
                                <div className={`text-2xl font-semibold ${accent ?? 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {value?.toLocaleString?.() ?? value}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Filters */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">Filters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Channel</label>
                                <select value={channelId} onChange={e => setChannelId(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Channels</option>
                                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleSearch} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                                <Search className="w-4 h-4" /> Search
                            </button>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                Reset
                            </button>
                        </div>
                    </div>
                </section>

                {/* Action */}
                <div className="flex flex-wrap gap-2">
                    <Link href="/admin/drip-sequences/create" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Create Sequence
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Sequence', 'Channel', 'Steps', 'Enrolled', 'Source', 'Status', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {sequences.data?.length > 0 ? sequences.data.map((s) => (
                                    <tr key={s.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</div>
                                            {s.description && <div className="text-xs text-zinc-400 line-clamp-1 max-w-[180px]">{s.description}</div>}
                                            <div className="text-xs text-zinc-400">{s.created_at}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <ChannelBadge type={s.channel_type} />
                                                <div className="text-xs text-zinc-400">{s.channel_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                                                    <ListOrdered className="w-3 h-3 text-zinc-400" />
                                                    {s.total_steps}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                                                    <Users className="w-3 h-3 text-zinc-400" />
                                                    {s.enrollments_count}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {s.ai_generated ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20">
                                                        <Sparkles className="w-3 h-3" /> AI
                                                    </span>
                                            ) : (
                                                <span className="text-xs text-zinc-500">Manual</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(s.status)}`}>
                                                    <StatusIcon status={s.status} />
                                                    {s.status}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => { setSelected(s); setShowModal(true); }}
                                                    title="View details"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s)}
                                                    title="Delete"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-zinc-400 text-sm">
                                            <Zap className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No drip sequences found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={sequences}
                                onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Sequence Details</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',     value: selected.name },
                                    { label: 'Channel',  custom: <ChannelBadge type={selected.channel_type} /> },
                                    { label: 'Status',   custom: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(selected.status)}`}><StatusIcon status={selected.status} />{selected.status}</span> },
                                    { label: 'Steps',    value: selected.total_steps },
                                    { label: 'Enrolled', value: selected.enrollments_count },
                                    { label: 'Source',   value: selected.ai_generated ? 'AI Generated' : 'Manual' },
                                    { label: 'Created',  value: selected.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selected.description && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg">{selected.description}</p>
                                </div>
                            )}
                            {selected.ai_goal && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">AI Goal</p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-2.5 rounded-lg">{selected.ai_goal}</p>
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Index;
