import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Send, Plus, Trash2, Eye, Search,
    Smartphone, CheckCircle, Clock,
    Play, XCircle, Calendar, Users,
    Zap, BarChart3,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

const statusColor = (status) => {
    const map = {
        draft:     'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        scheduled: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        running:   'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        failed:    'text-red-600 bg-red-50 dark:bg-red-900/20',
        paused:    'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    };
    return map[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const StatusIcon = ({ status }) => {
    const map = {
        draft:     <Clock className="w-3 h-3 shrink-0" />,
        scheduled: <Calendar className="w-3 h-3 shrink-0" />,
        running:   <Play className="w-3 h-3 shrink-0" />,
        completed: <CheckCircle className="w-3 h-3 shrink-0" />,
        failed:    <XCircle className="w-3 h-3 shrink-0" />,
    };
    return map[status] ?? null;
};

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

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        type === 'instant'
            ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
            : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    }`}>
        {type === 'instant' ? <Zap className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
        {type}
    </span>
);

const Index = ({ campaigns, stats, channels, filters }) => {
    const [search, setSearch]       = useState(filters?.search     || '');
    const [status, setStatus]       = useState(filters?.status     || 'all');
    const [channelId, setChannelId] = useState(filters?.channel_id || 'all');
    const [type, setType]           = useState(filters?.type       || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected]   = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)            params.search     = search;
        if (status !== 'all')  params.status     = status;
        if (channelId !== 'all') params.channel_id = channelId;
        if (type !== 'all')    params.type       = type;
        router.get('/admin/campaigns', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setStatus('all'); setChannelId('all'); setType('all');
        router.get('/admin/campaigns', {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (campaign) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        router.delete(`/admin/campaigns/${campaign.id}`, {
            onSuccess: () => toast.success('Campaign deleted successfully!'),
            onError:   () => toast.error('Failed to delete campaign.'),
        });
    };

    return (
        <Layout pageTitle="Campaigns" pageSection="Messaging">
            <Head title="Campaigns" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total',     value: stats.total,     icon: Send },
                            { label: 'Running',   value: stats.running,   icon: Play,        accent: 'text-blue-600' },
                            { label: 'Completed', value: stats.completed, icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'Scheduled', value: stats.scheduled, icon: Calendar,    accent: 'text-amber-600' },
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by campaign name..."
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
                                    {channels.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="running">Running</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Types</option>
                                    <option value="instant">Instant</option>
                                    <option value="scheduled">Scheduled</option>
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
                    <Link href="/admin/campaigns/create" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Create Campaign
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Campaign', 'Channel', 'Type', 'Recipients', 'Scheduled', 'Status', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {campaigns.data?.length > 0 ? campaigns.data.map((c) => (
                                    <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</div>
                                            <div className="text-xs text-zinc-400">{c.created_at}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <ChannelBadge type={c.channel_type} />
                                                <div className="text-xs text-zinc-400">{c.channel_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <TypeBadge type={c.type} />
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                                                    <Users className="w-3 h-3 text-zinc-400" />
                                                    {c.total_recipients?.toLocaleString()}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-zinc-500">{c.scheduled_at ?? '—'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(c.status)}`}>
                                                    <StatusIcon status={c.status} />
                                                    {c.status}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={`/admin/analytics/campaigns?campaign_id=${c.id}`}
                                                    title="View analytics"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    <BarChart3 className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => { setSelected(c); setShowModal(true); }}
                                                    title="View details"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c)}
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
                                            <Send className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No campaigns found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={campaigns}
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
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Campaign Details</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',       value: selected.name },
                                    { label: 'Channel',    custom: <ChannelBadge type={selected.channel_type} /> },
                                    { label: 'Type',       custom: <TypeBadge type={selected.type} /> },
                                    { label: 'Status',     custom: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(selected.status)}`}><StatusIcon status={selected.status} />{selected.status}</span> },
                                    { label: 'Recipients', value: selected.total_recipients?.toLocaleString() },
                                    { label: 'Scheduled',  value: selected.scheduled_at ?? '—' },
                                    { label: 'Started',    value: selected.started_at   ?? '—' },
                                    { label: 'Completed',  value: selected.completed_at ?? '—' },
                                    { label: 'Created',    value: selected.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selected.ai_goal && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">AI Goal</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-2.5 rounded-lg">{selected.ai_goal}</p>
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
