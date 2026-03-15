import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Zap, Plus, Trash2, Eye, Search,
    Smartphone, Send, CheckCircle, PauseCircle,
    Archive, Users, Sparkles, ListOrdered,
    Loader2, AlertTriangle, UserPlus,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";
import { useTranslation } from "@/hooks/useTranslation.jsx";

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

const DeleteConfirmModal = ({ open, onOpenChange, onConfirm, title, description, loading }) => {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {title || 'Delete Confirmation'}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
                        {description || 'Are you sure you want to delete this item? This action cannot be undone.'}
                    </p>
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const Index = ({ sequences, stats, channels, lists, filters }) => {
    const { t } = useTranslation();
    const [search, setSearch]             = useState(filters?.search     || '');
    const [status, setStatus]             = useState(filters?.status     || 'all');
    const [channelId, setChannelId]       = useState(filters?.channel_id || 'all');
    const [showModal, setShowModal]       = useState(false);
    const [selected, setSelected]         = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting]         = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [enrollTarget, setEnrollTarget] = useState(null);
    const [selectedLists, setSelectedLists] = useState([]);
    const [enrolling, setEnrolling]       = useState(false);

    const openEnrollModal = (seq) => {
        setEnrollTarget(seq);
        setSelectedLists([]);
        setShowEnrollModal(true);
    };

    const toggleList = (id) => {
        setSelectedLists(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const confirmEnroll = () => {
        if (!enrollTarget || selectedLists.length === 0) return;
        const targetId = enrollTarget.id;
        const targetName = enrollTarget.name;
        const lists = [...selectedLists];
        setShowEnrollModal(false);
        setEnrollTarget(null);
        setSelectedLists([]);
        setEnrolling(true);
        router.post(
            `/admin/drip-sequences/${targetId}/enroll`,
            { list_ids: lists },
            {
                preserveScroll: true,
                onSuccess: () => { toast.success(`Contacts enrolled into "${targetName}"!`); },
                onError: () => { toast.error('Failed to enroll contacts.'); },
                onFinish: () => { setEnrolling(false); },
            }
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const targetId = deleteTarget.id;
        const targetName = deleteTarget.name;
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeleting(true);
        router.delete(`/admin/drip-sequences/${targetId}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`"${targetName}" deleted!`); },
            onError: () => { toast.error('Failed to delete drip sequence.'); },
            onFinish: () => { setDeleting(false); },
        });
    };

    const enrolledIds    = enrollTarget?.enrolled_list_ids ?? [];
    const availableLists = (lists ?? []).filter(l => !enrolledIds.includes(l.id));
    const allSelected    = availableLists.length > 0 && selectedLists.length === availableLists.length;
    const toggleAll      = () => setSelectedLists(allSelected ? [] : availableLists.map(l => l.id));

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

    const openDeleteModal = (seq) => {
        setDeleteTarget(seq);
        setShowDeleteModal(true);
    };

    return (
        <Layout pageTitle="Drip Sequences" pageSection="Messaging">
            <Head title="Drip Sequences" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: t('drip_sequences.total'),      value: stats.total,      icon: Zap },
                            { label: t('drip_sequences.active'),     value: stats.active,     icon: CheckCircle, accent: 'text-emerald-600' },
                            { label: t('drip_sequences.paused'),     value: stats.paused,     icon: PauseCircle, accent: 'text-amber-600' },
                            { label: t('drip_sequences.ai_created'), value: stats.ai_created, icon: Sparkles,    accent: 'text-purple-600' },
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
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">{t('common.filters')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{t('common.search')}</label>
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
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{t('dashboard.channel')}</label>
                                <select value={channelId} onChange={e => setChannelId(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">{t('common.all_channels')}</option>
                                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{t('common.status')}</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                    <option value="all">{t('common.all_status')}</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleSearch} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                                <Search className="w-4 h-4" /> {t('common.search')}
                            </button>
                            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                {t('common.reset')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Action */}
                <div className="flex flex-wrap gap-2">
                    <Link href="/admin/drip-sequences/create" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> {t('drip_sequences.create_sequence')}
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {[t('drip_sequences.title'), t('dashboard.channel'), t('drip_sequences.steps'), t('drip_sequences.enrolled'), t('common.source'), t('common.status'), t('common.actions')].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {sequences.data?.length > 0 ? sequences.data.map((s) => (
                                    <tr key={s.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setSelected(s); setShowModal(true); }}
                                                className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                                            >
                                                {s.name}
                                            </button>
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
                                                        <Sparkles className="w-3 h-3" /> {t('common.ai')}
                                                    </span>
                                            ) : (
                                                <span className="text-xs text-zinc-500">{t('common.manual')}</span>
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
                                                    onClick={() => openEnrollModal(s)}
                                                    title="Enroll contacts"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(s)}
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
                                            {t('drip_sequences.no_sequences_found')}
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

            <DeleteConfirmModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Drip Sequence"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? All enrolled contacts will be unenrolled. This action cannot be undone.`}
            />

            {/* Enroll Contacts Modal */}
            <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            {t('drip_sequences.enroll_contacts')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-1">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Select contact lists to enroll into <span className="font-medium text-zinc-700 dark:text-zinc-300">"{enrollTarget?.name}"</span>. Only active contacts not already enrolled will be added.
                        </p>
                        {lists && lists.length > 0 ? (
                            <div>
                                {/* Select All (only available lists) */}
                                {availableLists.length > 0 && (
                                    <label className="flex items-center gap-3 px-3 py-2 mb-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="rounded border-zinc-300 dark:border-zinc-600"
                                        />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            {allSelected ? t('drip_sequences.deselect_all') : t('drip_sequences.select_all')}
                                        </span>
                                    </label>
                                )}
                                <div className="space-y-2 max-h-52 overflow-y-auto">
                                    {lists.map(list => {
                                        const isEnrolled = enrolledIds.includes(list.id);
                                        return (
                                            <label
                                                key={list.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                    isEnrolled
                                                        ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/10 cursor-not-allowed'
                                                        : 'border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isEnrolled || selectedLists.includes(list.id)}
                                                    onChange={() => !isEnrolled && toggleList(list.id)}
                                                    disabled={isEnrolled}
                                                    className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{list.name}</p>
                                                    <p className={`text-xs ${isEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                                                        {isEnrolled ? t('drip_sequences.already_enrolled') : `${list.contacts_count ?? 0} active contacts`}
                                                    </p>
                                                </div>
                                                {isEnrolled && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400 text-center py-4">{t('drip_sequences.no_lists_available')}</p>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setShowEnrollModal(false)}
                                disabled={enrolling}
                                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmEnroll}
                                disabled={enrolling || selectedLists.length === 0}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                            >
                                {enrolling
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('drip_sequences.enrolling')}</>
                                    : <><UserPlus className="w-4 h-4" /> {t('drip_sequences.enroll_contacts')}</>
                                }
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t('drip_sequences.sequence_details')}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: t('common.name'),           value: selected.name },
                                    { label: t('dashboard.channel'),     custom: <ChannelBadge type={selected.channel_type} /> },
                                    { label: t('common.status'),         custom: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(selected.status)}`}><StatusIcon status={selected.status} />{selected.status}</span> },
                                    { label: t('drip_sequences.steps'),  value: selected.total_steps },
                                    { label: t('drip_sequences.enrolled'), value: selected.enrollments_count },
                                    { label: t('common.source'),         value: selected.ai_generated ? 'AI Generated' : 'Manual' },
                                    { label: t('common.created'),        value: selected.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selected.description && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('common.description')}</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg">{selected.description}</p>
                                </div>
                            )}
                            {selected.ai_goal && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('drip_sequences.ai_goal')}</p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-2.5 rounded-lg">{selected.ai_goal}</p>
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    {t('common.close')}
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
