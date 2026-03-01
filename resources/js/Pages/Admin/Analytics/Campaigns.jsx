import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router } from '@inertiajs/react';
import {
    BarChart3, Search, Eye, Smartphone, Send,
    TrendingUp, CheckCircle, MailOpen, MessageSquare,
    XCircle, Sparkles,
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

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

const RateBar = ({ value, color }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 w-10 text-right">{value}%</span>
    </div>
);

const Campaigns = ({ analytics, stats, filters }) => {
    const [search, setSearch]           = useState(filters?.search       || '');
    const [channelType, setChannelType] = useState(filters?.channel_type || 'all');
    const [dateFrom, setDateFrom]       = useState(filters?.date_from    || '');
    const [dateTo, setDateTo]           = useState(filters?.date_to      || '');
    const [showModal, setShowModal]     = useState(false);
    const [selected, setSelected]       = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)                params.search       = search;
        if (channelType !== 'all') params.channel_type = channelType;
        if (dateFrom)              params.date_from    = dateFrom;
        if (dateTo)                params.date_to      = dateTo;
        router.get('/admin/analytics/campaigns', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setChannelType('all'); setDateFrom(''); setDateTo('');
        router.get('/admin/analytics/campaigns', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <Layout pageTitle="Campaign Analytics" pageSection="Analytics">
            <Head title="Campaign Analytics" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Campaigns', value: stats.total_campaigns,                       icon: BarChart3 },
                            { label: 'Total Sent',      value: stats.total_sent?.toLocaleString(),          icon: Send,       accent: 'text-blue-600' },
                            { label: 'Avg Delivery',    value: `${stats.avg_delivery}%`,                    icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'Avg Read Rate',   value: `${stats.avg_read}%`,                        icon: MailOpen,   accent: 'text-purple-600' },
                        ].map(({ label, value, icon: Icon, accent }) => (
                            <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className={`text-2xl font-semibold ${accent ?? 'text-zinc-900 dark:text-zinc-100'}`}>{value}</div>
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
                                <select value={channelType} onChange={e => setChannelType(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Channels</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="telegram">Telegram</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">From</label>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">To</label>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600" />
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

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1000px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Campaign', 'Channel', 'Sent', 'Delivered', 'Read', 'Replied', 'Failed', 'Rates', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {analytics.data?.length > 0 ? analytics.data.map((a) => (
                                    <tr key={a.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200 max-w-[160px] truncate">{a.campaign_name}</div>
                                            <div className="text-xs text-zinc-400">{a.recorded_at}</div>
                                        </td>
                                        <td className="px-4 py-3"><ChannelBadge type={a.channel_type} /></td>
                                        <td className="px-4 py-3"><span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{a.sent?.toLocaleString()}</span></td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-emerald-600">{a.delivered?.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">{a.delivery_rate}%</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-purple-600">{a.read?.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">{a.read_rate}%</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-blue-600">{a.replied?.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">{a.reply_rate}%</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-red-500">{a.failed?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-4 py-3 min-w-[140px]">
                                            <div className="space-y-1.5">
                                                <RateBar value={a.delivery_rate} color="bg-emerald-500" />
                                                <RateBar value={a.read_rate}     color="bg-purple-500" />
                                                <RateBar value={a.reply_rate}    color="bg-blue-500" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setSelected(a); setShowModal(true); }}
                                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-zinc-400 text-sm">
                                            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No analytics data found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination data={analytics} onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })} />
                        </div>
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Campaign Analytics</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{selected.campaign_name}</p>
                                <div className="flex items-center gap-2 mt-1"><ChannelBadge type={selected.channel_type} /><span className="text-xs text-zinc-400">{selected.channel_name}</span></div>
                            </div>

                            {/* Metrics grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Sent',     value: selected.sent?.toLocaleString(),      color: 'text-zinc-800 dark:text-zinc-200' },
                                    { label: 'Delivered',value: selected.delivered?.toLocaleString(), color: 'text-emerald-600' },
                                    { label: 'Read',     value: selected.read?.toLocaleString(),      color: 'text-purple-600' },
                                    { label: 'Replied',  value: selected.replied?.toLocaleString(),   color: 'text-blue-600' },
                                    { label: 'Failed',   value: selected.failed?.toLocaleString(),    color: 'text-red-500' },
                                    { label: 'Opted Out',value: selected.opted_out?.toLocaleString(), color: 'text-orange-500' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className={`text-lg font-bold ${color}`}>{value}</div>
                                        <div className="text-xs text-zinc-400">{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Rates */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Performance Rates</p>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Delivery Rate', value: selected.delivery_rate, color: 'bg-emerald-500' },
                                        { label: 'Read Rate',     value: selected.read_rate,     color: 'bg-purple-500' },
                                        { label: 'Reply Rate',    value: selected.reply_rate,    color: 'bg-blue-500' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-500">{label}</span>
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{value}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            {selected.ai_recommendations?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-500" /> AI Recommendations
                                    </p>
                                    <ul className="space-y-1.5">
                                        {selected.ai_recommendations.map((rec, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-2 rounded-lg">
                                                <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />{rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Close</button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Campaigns;
