import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router } from '@inertiajs/react';
import { Link } from "@inertiajs/react";
import { toast } from 'sonner';
import {
    Radio,
    Plus,
    Trash2,
    Eye,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    Smartphone,
    Send,
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
        connected:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        disconnected: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        error:        'text-red-600 bg-red-50 dark:bg-red-900/20',
    };
    return map[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const StatusIcon = ({ status }) => {
    if (status === 'connected')    return <CheckCircle className="w-3 h-3 shrink-0" />;
    if (status === 'error')        return <AlertCircle className="w-3 h-3 shrink-0" />;
    return <XCircle className="w-3 h-3 shrink-0" />;
};

const Badge = ({ status }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(status)}`}>
        <StatusIcon status={status} />
        {status}
    </span>
);

const ChannelType = ({ type }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        type === 'whatsapp'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
            : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    }`}>
        {type === 'whatsapp'
            ? <Smartphone className="w-3 h-3" />
            : <Send className="w-3 h-3" />
        }
        {type === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
    </span>
);

const Index = ({ channels, stats, filters }) => {
    const [search, setSearch]               = useState(filters?.search || '');
    const [type, setType]                   = useState(filters?.type || 'all');
    const [status, setStatus]               = useState(filters?.status || 'all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedChannel, setSelectedChannel]   = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)       params.search = search;
        if (type   !== 'all') params.type   = type;
        if (status !== 'all') params.status = status;
        router.get('/admin/channels', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setType('all'); setStatus('all');
        router.get('/admin/channels', {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (channel) => {
        if (!confirm('Are you sure you want to delete this channel?')) return;
        router.delete(`/admin/channels/${channel.id}`, {
            onSuccess: () => toast.success('Channel deleted successfully!'),
            onError:   () => toast.error('Failed to delete channel.'),
        });
    };

    const openDetails = (channel) => {
        setSelectedChannel(channel);
        setShowDetailsModal(true);
    };

    return (
        <Layout pageTitle="Channels" pageSection="Channels">
            <Head title="Channels" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Channels',  value: stats.total,       icon: Radio },
                            { label: 'Connected',       value: stats.connected,   icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'WhatsApp',        value: stats.whatsapp,    icon: Smartphone },
                            { label: 'Telegram',        value: stats.telegram,    icon: Send },
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
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by name, phone..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Type</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                >
                                    <option value="all">All Types</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="telegram">Telegram</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                >
                                    <option value="all">All Status</option>
                                    <option value="connected">Connected</option>
                                    <option value="disconnected">Disconnected</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                                >
                                    <Search className="w-4 h-4" /> Search
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Add Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/channels/whatsapp/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add WhatsApp
                    </Link>
                    <Link
                        href="/admin/channels/telegram/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Telegram
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[700px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Name', 'Type', 'Identifier', 'Status', 'Last Verified', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {channels.data?.length > 0 ? channels.data.map((c) => (
                                    <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</div>
                                            <div className="text-xs text-zinc-400">{c.created_at}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ChannelType type={c.type} />
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                    {c.type === 'whatsapp' ? c.phone_number : c.bot_username ?? '—'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge status={c.status} />
                                            {c.error_message && (
                                                <div className="text-xs text-red-400 mt-1 max-w-[150px] truncate">{c.error_message}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-zinc-500">{c.last_verified_at ?? '—'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => openDetails(c)}
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
                                        <td colSpan={6} className="text-center py-12 text-zinc-400 text-sm">
                                            <Radio className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No channels found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={channels}
                                onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Channel Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedChannel && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',          value: selectedChannel.name },
                                    { label: 'Type',          custom: <ChannelType type={selectedChannel.type} /> },
                                    { label: 'Status',        custom: <Badge status={selectedChannel.status} /> },
                                    { label: 'Phone Number',  value: selectedChannel.phone_number || '—' },
                                    { label: 'Bot Username',  value: selectedChannel.bot_username || '—' },
                                    { label: 'Last Verified', value: selectedChannel.last_verified_at || '—' },
                                    { label: 'Created',       value: selectedChannel.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? (
                                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 break-all">{value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {selectedChannel.error_message && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Error Message</p>
                                    <p className="text-xs break-all bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2.5 rounded-lg text-red-600 dark:text-red-400">
                                        {selectedChannel.error_message}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
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
