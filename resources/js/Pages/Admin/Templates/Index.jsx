import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    FileText, Plus, Trash2, Eye, Search,
    Smartphone, Send, Sparkles, CheckCircle,
    Clock, XCircle, Star,
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
        approved: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        draft:    'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    };
    return map[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const StatusIcon = ({ status }) => {
    if (status === 'approved') return <CheckCircle className="w-3 h-3 shrink-0" />;
    if (status === 'rejected') return <XCircle className="w-3 h-3 shrink-0" />;
    return <Clock className="w-3 h-3 shrink-0" />;
};

const Badge = ({ value, colorFn, icon: Icon }) => value ? (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${colorFn(value)}`}>
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        {value.replace('_', ' ')}
    </span>
) : <span className="text-xs text-zinc-400">—</span>;

const ChannelBadge = ({ channel }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        channel === 'whatsapp'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
            : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    }`}>
        {channel === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Send className="w-3 h-3" />}
        {channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
    </span>
);

const ComplianceScore = ({ score }) => {
    if (!score) return <span className="text-xs text-zinc-400">—</span>;
    const color = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
    return <span className={`text-xs font-semibold ${color}`}>{score}%</span>;
};

const Index = ({ templates, stats, filters }) => {
    const [search, setSearch]                     = useState(filters?.search  || '');
    const [channel, setChannel]                   = useState(filters?.channel || 'all');
    const [status, setStatus]                     = useState(filters?.status  || 'all');
    const [source, setSource]                     = useState(filters?.source  || 'all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)           params.search  = search;
        if (channel !== 'all') params.channel = channel;
        if (status  !== 'all') params.status  = status;
        if (source  !== 'all') params.source  = source;
        router.get('/admin/templates', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setChannel('all'); setStatus('all'); setSource('all');
        router.get('/admin/templates', {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (template) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        router.delete(`/admin/templates/${template.id}`, {
            onSuccess: () => toast.success('Template deleted successfully!'),
            onError:   () => toast.error('Failed to delete template.'),
        });
    };

    const openDetails = (template) => {
        setSelectedTemplate(template);
        setShowDetailsModal(true);
    };

    return (
        <Layout pageTitle="Templates" pageSection="Messaging">
            <Head title="Templates" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Templates', value: stats.total,        icon: FileText },
                            { label: 'Approved',        value: stats.approved,     icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: 'Drafts',          value: stats.draft,        icon: Clock,       accent: 'text-amber-600' },
                            { label: 'AI Generated',    value: stats.ai_generated, icon: Sparkles,    accent: 'text-purple-600' },
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
                                    placeholder="Search by name or body..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Channel</label>
                                <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Channels</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="telegram">Telegram</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="draft">Draft</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Source</label>
                                <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">All Sources</option>
                                    <option value="manual">Manual</option>
                                    <option value="ai_generated">AI Generated</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleSearch} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
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
                    <Link
                        href="/admin/templates/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Create Template
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Name', 'Channel', 'Body', 'Source', 'AI Score', 'Usage', 'Status', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {templates.data?.length > 0 ? templates.data.map((t) => (
                                    <tr key={t.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200">{t.name}</div>
                                            <div className="text-xs text-zinc-400">{t.language?.toUpperCase()}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ChannelBadge channel={t.channel} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-zinc-500 line-clamp-2 max-w-[200px]">{t.body}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {t.source === 'ai_generated' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20">
                                                        <Sparkles className="w-3 h-3" /> AI
                                                    </span>
                                            ) : (
                                                <span className="text-xs text-zinc-500">Manual</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ComplianceScore score={t.ai_compliance_score} />
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                                    <Star className="w-3 h-3 text-zinc-300" />
                                                    {t.usage_count}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(t.status)}`}>
                                                    <StatusIcon status={t.status} />
                                                    {t.status}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => openDetails(t)}
                                                    title="View details"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t)}
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
                                        <td colSpan={8} className="text-center py-12 text-zinc-400 text-sm">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No templates found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={templates}
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
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Template Details</DialogTitle>
                    </DialogHeader>
                    {selectedTemplate && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',     value: selectedTemplate.name },
                                    { label: 'Language', value: selectedTemplate.language?.toUpperCase() },
                                    { label: 'Channel',  custom: <ChannelBadge channel={selectedTemplate.channel} /> },
                                    { label: 'Status',   custom: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(selectedTemplate.status)}`}><StatusIcon status={selectedTemplate.status} />{selectedTemplate.status}</span> },
                                    { label: 'Source',   value: selectedTemplate.source?.replace('_', ' ') },
                                    { label: 'AI Score', custom: <ComplianceScore score={selectedTemplate.ai_compliance_score} /> },
                                    { label: 'Usage',    value: `${selectedTemplate.usage_count} times` },
                                    { label: 'Created',  value: selectedTemplate.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selectedTemplate.header && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Header</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg">{selectedTemplate.header}</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Body</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg whitespace-pre-wrap">{selectedTemplate.body}</p>
                            </div>
                            {selectedTemplate.footer && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Footer</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg">{selectedTemplate.footer}</p>
                                </div>
                            )}
                            {selectedTemplate.rejection_reason && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rejection Reason</p>
                                    <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2.5 rounded-lg">{selectedTemplate.rejection_reason}</p>
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
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
