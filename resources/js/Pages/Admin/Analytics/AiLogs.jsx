import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router } from '@inertiajs/react';
import {
    History, Search, Eye, CheckCircle, XCircle,
    Sparkles, Bot, Cpu, Hash, ChevronDown, ChevronUp,
    MessageSquare, Zap,
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

const featureConfig = {
    message_writer:   { label: 'Message Writer',   icon: MessageSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    campaign_planner: { label: 'Campaign Planner', icon: Zap,           color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
};

const FeatureBadge = ({ feature }) => {
    const cfg  = featureConfig[feature] ?? { label: feature, icon: Sparkles, color: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800' };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
            <Icon className="w-3 h-3 shrink-0" />
            {cfg.label}
        </span>
    );
};

const AiLogs = ({ logs, stats, feature_counts, filters }) => {
    const [search, setSearch]   = useState(filters?.search    || '');
    const [feature, setFeature] = useState(filters?.feature   || 'all');
    const [status, setStatus]   = useState(filters?.status    || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo]   = useState(filters?.date_to   || '');
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected]   = useState(null);
    const [expandedPrompt, setExpandedPrompt] = useState(false);

    const handleSearch = () => {
        const params = {};
        if (search)           params.search    = search;
        if (feature !== 'all') params.feature  = feature;
        if (status  !== 'all') params.status   = status;
        if (dateFrom)          params.date_from = dateFrom;
        if (dateTo)            params.date_to   = dateTo;
        router.get('/admin/analytics/ai-logs', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setFeature('all'); setStatus('all'); setDateFrom(''); setDateTo('');
        router.get('/admin/analytics/ai-logs', {}, { preserveState: true, preserveScroll: true });
    };

    const openLog = (log) => {
        setSelected(log);
        setExpandedPrompt(false);
        setShowModal(true);
    };

    const successRate = stats.total_calls > 0
        ? Math.round((stats.successful / stats.total_calls) * 100) : 0;

    return (
        <Layout pageTitle="AI Logs" pageSection="Analytics">
            <Head title="AI Logs" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Calls',    value: stats.total_calls?.toLocaleString(),   icon: Hash },
                            { label: 'Successful',     value: stats.successful?.toLocaleString(),    icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'Total Tokens',   value: stats.total_tokens?.toLocaleString(),  icon: Cpu,         accent: 'text-blue-600' },
                            { label: 'Success Rate',   value: `${successRate}%`,                     icon: Sparkles,    accent: successRate >= 90 ? 'text-emerald-600' : 'text-amber-600' },
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

                {/* Feature breakdown */}
                {Object.keys(feature_counts).length > 0 && (
                    <section>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">Usage by Feature</h2>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(feature_counts).map(([feat, count]) => {
                                    const cfg  = featureConfig[feat] ?? { label: feat, icon: Sparkles, color: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800' };
                                    const Icon = cfg.icon;
                                    const pct  = stats.total_calls > 0 ? Math.round((count / stats.total_calls) * 100) : 0;
                                    return (
                                        <div key={feat} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
                                                <Icon className="w-3 h-3" /> {cfg.label}
                                            </span>
                                            <div>
                                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{count}</span>
                                                <span className="text-xs text-zinc-400 ml-1">calls · {pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Filters */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">Filters</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Search Prompt</label>
                                <input
                                    type="text"
                                    placeholder="Search prompt content..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Feature</label>
                                <select value={feature} onChange={e => setFeature(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Features</option>
                                    <option value="message_writer">Message Writer</option>
                                    <option value="campaign_planner">Campaign Planner</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Date From</label>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Date To</label>
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
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Status', 'Feature', 'Model', 'Prompt', 'Tokens In', 'Tokens Out', 'Total', 'Date', 'View'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {logs.data?.length > 0 ? logs.data.map((l) => (
                                    <tr key={l.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            {l.success
                                                ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                : <XCircle    className="w-4 h-4 text-red-500" />
                                            }
                                        </td>
                                        <td className="px-4 py-3"><FeatureBadge feature={l.feature} /></td>
                                        <td className="px-4 py-3">
                                                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                    {l.model?.replace('claude-', '').replace('-20250514', '') ?? '—'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-zinc-500 line-clamp-2 max-w-[200px]">{l.prompt?.slice(0, 120)}</p>
                                        </td>
                                        <td className="px-4 py-3"><span className="text-xs text-zinc-600 dark:text-zinc-400">{l.input_tokens?.toLocaleString()}</span></td>
                                        <td className="px-4 py-3"><span className="text-xs text-zinc-600 dark:text-zinc-400">{l.output_tokens?.toLocaleString()}</span></td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                                    <Cpu className="w-3 h-3" /> {l.total_tokens?.toLocaleString()}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs text-zinc-400">{l.created_at}</span></td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openLog(l)}
                                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-zinc-400 text-sm">
                                            <History className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No AI logs found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination data={logs} onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })} />
                        </div>
                    </div>
                </section>
            </div>

            {/* Log Detail Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">AI Log Detail</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Feature',     custom: <FeatureBadge feature={selected.feature} /> },
                                    { label: 'Status',      custom: selected.success
                                            ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle className="w-3 h-3" /> Success</span>
                                            : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500"><XCircle className="w-3 h-3" /> Failed</span>
                                    },
                                    { label: 'Date',        value: selected.created_at },
                                    { label: 'Model',       value: selected.model },
                                    { label: 'Input Tokens',value: selected.input_tokens?.toLocaleString() },
                                    { label: 'Output Tokens',value: selected.output_tokens?.toLocaleString() },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>

                            {selected.error_message && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Error</p>
                                    <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2.5 rounded-lg font-mono">{selected.error_message}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <button
                                    onClick={() => setExpandedPrompt(e => !e)}
                                    className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider hover:text-zinc-600 transition-colors"
                                >
                                    Prompt {expandedPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                {expandedPrompt && (
                                    <pre className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono max-h-48">{selected.prompt}</pre>
                                )}
                            </div>

                            {selected.response && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Response</p>
                                    <pre className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono max-h-48">{selected.response}</pre>
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

export default AiLogs;
