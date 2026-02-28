import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Users, Plus, Trash2, Eye, Search,
    Smartphone, Send, Upload, User,
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
        active:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        opted_out: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        blocked:   'text-red-600 bg-red-50 dark:bg-red-900/20',
    };
    return map[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const aiLabelColor = (label) => {
    const map = {
        hot:  'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
        warm: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
        cold: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    };
    return map[label] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const Badge = ({ value, colorFn }) => value ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${colorFn(value)}`}>
        {value.replace('_', ' ')}
    </span>
) : <span className="text-xs text-zinc-400">—</span>;

const getUserInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

const Index = ({ contacts, stats, filters }) => {
    const [search, setSearch]                     = useState(filters?.search || '');
    const [status, setStatus]                     = useState(filters?.status || 'all');
    const [aiLabel, setAiLabel]                   = useState(filters?.ai_label || 'all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedContact, setSelectedContact]   = useState(null);

    const handleSearch = () => {
        const params = {};
        if (search)           params.search   = search;
        if (status !== 'all') params.status   = status;
        if (aiLabel !== 'all') params.ai_label = aiLabel;
        router.get('/admin/contacts', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch(''); setStatus('all'); setAiLabel('all');
        router.get('/admin/contacts', {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (contact) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        router.delete(`/admin/contacts/${contact.id}`, {
            onSuccess: () => toast.success('Contact deleted successfully!'),
            onError:   () => toast.error('Failed to delete contact.'),
        });
    };

    const openDetails = (contact) => {
        setSelectedContact(contact);
        setShowDetailsModal(true);
    };

    return (
        <Layout pageTitle="Contacts" pageSection="Contacts">
            <Head title="Contacts" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Contacts', value: stats.total,     icon: Users },
                            { label: 'Active',         value: stats.active,    icon: Users,  accent: 'text-emerald-600' },
                            { label: 'Opted Out',      value: stats.opted_out, icon: Users },
                            { label: 'Hot Leads 🔥',   value: stats.hot_leads, icon: Users,  accent: 'text-orange-600' },
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
                                    placeholder="Name, phone, email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="opted_out">Opted Out</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">AI Label</label>
                                <select
                                    value={aiLabel}
                                    onChange={e => setAiLabel(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                >
                                    <option value="all">All Labels</option>
                                    <option value="hot">🔥 Hot</option>
                                    <option value="warm">🌡️ Warm</option>
                                    <option value="cold">❄️ Cold</option>
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/contacts/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Contact
                    </Link>
                    <Link
                        href="/admin/contacts/import"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Import CSV
                    </Link>
                </div>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Contact', 'Phone', 'Telegram', 'Status', 'AI Label', 'Last Messaged', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {contacts.data?.length > 0 ? contacts.data.map((c) => (
                                    <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                                                    {getUserInitials(c.name)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</div>
                                                    {c.email && <div className="text-xs text-zinc-400">{c.email}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.phone ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                        <Smartphone className="w-3 h-3" /> {c.phone}
                                                    </span>
                                            ) : <span className="text-xs text-zinc-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.telegram_id ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                        <Send className="w-3 h-3" /> {c.telegram_id}
                                                    </span>
                                            ) : <span className="text-xs text-zinc-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge value={c.status} colorFn={statusColor} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge value={c.ai_engagement_label} colorFn={aiLabelColor} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-zinc-500">{c.last_messaged_at ?? '—'}</div>
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
                                        <td colSpan={7} className="text-center py-12 text-zinc-400 text-sm">
                                            <User className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No contacts found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={contacts}
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
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Contact Details</DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',     value: selectedContact.name },
                                    { label: 'Email',    value: selectedContact.email    || '—' },
                                    { label: 'Phone',    value: selectedContact.phone    || '—' },
                                    { label: 'Telegram', value: selectedContact.telegram_id || '—' },
                                    { label: 'Country',  value: selectedContact.country  || '—' },
                                    { label: 'Language', value: selectedContact.language || '—' },
                                    { label: 'Status',   custom: <Badge value={selectedContact.status} colorFn={statusColor} /> },
                                    { label: 'AI Label', custom: <Badge value={selectedContact.ai_engagement_label} colorFn={aiLabelColor} /> },
                                    { label: 'Last Messaged', value: selectedContact.last_messaged_at || '—' },
                                    { label: 'Created',  value: selectedContact.created_at },
                                ].map(({ label, value, custom }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        {custom ?? <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selectedContact.tags?.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedContact.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{tag}</span>
                                        ))}
                                    </div>
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
