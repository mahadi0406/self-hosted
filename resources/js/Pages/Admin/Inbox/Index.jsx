import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Inbox, Search, Eye, Smartphone, Send,
    MessageSquare, Sparkles, CheckCheck,
    Circle, ShoppingCart, AlertTriangle,
    HelpCircle, Ban, Clock,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

const intentConfig = {
    inquiry:     { label: 'Inquiry',     color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',       icon: HelpCircle },
    complaint:   { label: 'Complaint',   color: 'text-red-600 bg-red-50 dark:bg-red-900/20',          icon: AlertTriangle },
    purchase:    { label: 'Purchase',    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: ShoppingCart },
    spam:        { label: 'Spam',        color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800',          icon: Ban },
    unsubscribe: { label: 'Unsub',       color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', icon: Ban },
    unknown:     { label: 'Unknown',     color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800',          icon: Circle },
};

const IntentBadge = ({ intent }) => {
    if (!intent) return <span className="text-xs text-zinc-400">—</span>;
    const cfg = intentConfig[intent] ?? intentConfig.unknown;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
            <Icon className="w-3 h-3 shrink-0" />
            {cfg.label}
        </span>
    );
};

const ChannelBadge = ({ type }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        type === 'whatsapp'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
            : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    }`}>
        {type === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Send className="w-3 h-3" />}
        {type === 'whatsapp' ? 'WA' : 'TG'}
    </span>
);

const getUserInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

const Index = ({ messages, stats, channels, filters }) => {
    const [search, setSearch]     = useState(filters?.search     || '');
    const [channelId, setChannelId] = useState(filters?.channel_id || 'all');
    const [aiIntent, setAiIntent] = useState(filters?.ai_intent  || 'all');
    const [isRead, setIsRead]     = useState(filters?.is_read    || 'all');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected]   = useState(null);
    const [markingRead, setMarkingRead] = useState(false);

    const handleSearch = () => {
        const params = {};
        if (search)              params.search     = search;
        if (channelId !== 'all') params.channel_id = channelId;
        if (aiIntent  !== 'all') params.ai_intent  = aiIntent;
        if (isRead    !== 'all') params.is_read    = isRead;
        router.get('/admin/inbox', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setChannelId('all'); setAiIntent('all'); setIsRead('all');
        router.get('/admin/inbox', {}, { preserveState: true, preserveScroll: true });
    };

    const openMessage = async (msg) => {
        setSelected(msg);
        setShowModal(true);
        if (!msg.is_read) {
            try {
                await axios.patch(`/admin/inbox/${msg.id}/read`);
                router.reload({ only: ['messages', 'stats'] });
            } catch (_) {}
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingRead(true);
        try {
            await axios.post('/admin/inbox/mark-all-read');
            toast.success('All messages marked as read');
            router.reload({ only: ['messages', 'stats'] });
        } catch (_) {
            toast.error('Failed to mark messages as read');
        } finally {
            setMarkingRead(false);
        }
    };

    return (
        <Layout pageTitle="Inbox" pageSection="Messaging">
            <Head title="Inbox" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Inbound',  value: stats.total_inbound,  icon: Inbox },
                            { label: 'Unread',         value: stats.unread,         icon: Circle,    accent: stats.unread > 0 ? 'text-red-600' : undefined },
                            { label: 'Today',          value: stats.today,          icon: Clock,     accent: 'text-blue-600' },
                            { label: 'AI Classified',  value: stats.ai_classified,  icon: Sparkles,  accent: 'text-purple-600' },
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
                                    placeholder="Search by contact or message..."
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
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">AI Intent</label>
                                <select value={aiIntent} onChange={e => setAiIntent(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Intents</option>
                                    <option value="inquiry">Inquiry</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="purchase">Purchase</option>
                                    <option value="spam">Spam</option>
                                    <option value="unsubscribe">Unsubscribe</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Read Status</label>
                                <select value={isRead} onChange={e => setIsRead(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Messages</option>
                                    <option value="unread">Unread</option>
                                    <option value="read">Read</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={handleSearch} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                                <Search className="w-4 h-4" /> Search
                            </button>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                Reset
                            </button>
                            {stats.unread > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={markingRead}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors ml-auto"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    {markingRead ? 'Marking...' : `Mark all read (${stats.unread})`}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['', 'Contact', 'Message', 'Channel', 'AI Intent', 'AI Reply', 'Time', 'Action'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {messages.data?.length > 0 ? messages.data.map((m) => (
                                    <tr
                                        key={m.id}
                                        className={`border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${
                                            !m.is_read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                                        }`}
                                        onClick={() => openMessage(m)}
                                    >
                                        {/* Unread dot */}
                                        <td className="pl-4 py-3 w-4">
                                            {!m.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </td>

                                        {/* Contact */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                                                    {getUserInitials(m.contact_name)}
                                                </div>
                                                <div>
                                                    <div className={`font-medium truncate max-w-[120px] ${!m.is_read ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        {m.contact_name}
                                                    </div>
                                                    {m.contact_phone && <div className="text-xs text-zinc-400">{m.contact_phone}</div>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Message */}
                                        <td className="px-4 py-3">
                                            <p className={`text-xs line-clamp-2 max-w-[200px] ${!m.is_read ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-500'}`}>
                                                {m.body || `[${m.type}]`}
                                            </p>
                                        </td>

                                        {/* Channel */}
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <ChannelBadge type={m.channel_type} />
                                                <div className="text-xs text-zinc-400">{m.channel_name}</div>
                                            </div>
                                        </td>

                                        {/* AI Intent */}
                                        <td className="px-4 py-3">
                                            <IntentBadge intent={m.ai_intent} />
                                        </td>

                                        {/* AI Suggested Reply */}
                                        <td className="px-4 py-3">
                                            {m.ai_suggested_reply ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                                                        <Sparkles className="w-3 h-3" /> Ready
                                                    </span>
                                            ) : <span className="text-xs text-zinc-400">—</span>}
                                        </td>

                                        {/* Time */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-zinc-500">{m.received_at}</div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => openMessage(m)}
                                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-zinc-400 text-sm">
                                            <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No messages found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={messages}
                                onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Message Detail Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Message Details</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Contact',  value: selected.contact_name },
                                    { label: 'Phone',    value: selected.contact_phone || '—' },
                                    { label: 'Channel',  custom: <ChannelBadge type={selected.channel_type} /> },
                                    { label: 'AI Intent',custom: <IntentBadge intent={selected.ai_intent} /> },
                                    { label: 'Type',     value: selected.type },
                                    { label: 'Read',     value: selected.is_read ? 'Yes' : 'No' },
                                    { label: 'Received', value: selected.received_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Message Body */}
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Message</p>
                                <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg p-3">
                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{selected.body || `[${selected.type} message]`}</p>
                                </div>
                            </div>

                            {/* AI Suggested Reply */}
                            {selected.ai_suggested_reply && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-500" /> AI Suggested Reply
                                    </p>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-3">
                                        <p className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap">{selected.ai_suggested_reply}</p>
                                    </div>
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
