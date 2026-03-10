import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    List,
    Plus,
    Trash2,
    Eye,
    Search,
    Users,
    FolderOpen,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import Pagination from "@/Components/UI/pagination.jsx";

const DeleteConfirmModal = ({ open, onOpenChange, onConfirm, title, description, loading }) => (
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
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

const Index = ({ lists, stats, filters }) => {
    const [search, setSearch]                     = useState(filters?.search || '');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal]   = useState(false);
    const [selectedList, setSelectedList]         = useState(null);
    const [deleting, setDeleting]                 = useState(false);

    const handleSearch = () => {
        const params = {};
        if (search) params.search = search;
        router.get('/admin/contact-lists', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/admin/contact-lists', {}, { preserveState: true, preserveScroll: true });
    };

    const openDeleteModal = (list) => {
        setSelectedList(list);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedList) return;
        const list = selectedList;
        flushSync(() => {
            setShowDeleteModal(false);
            setSelectedList(null);
        });
        setDeleting(true);
        router.delete(`/admin/contact-lists/${list.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Contact list deleted successfully!'),
            onError:   () => toast.error('Failed to delete contact list.'),
            onFinish:  () => setDeleting(false),
        });
    };

    const openDetails = (list) => {
        setSelectedList(list);
        setShowDetailsModal(true);
    };

    return (
        <Layout pageTitle="Contact Lists" pageSection="Contacts">
            <Head title="Contact Lists" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Lists',    value: stats.total,    icon: List },
                            { label: 'Total Contacts', value: stats.contacts, icon: Users },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                                    {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
                                </div>
                                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
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
                            <div className="flex items-end gap-2 md:col-span-2 md:justify-end">
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                                >
                                    <Search className="w-4 h-4" /> Search
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Reset
                                </button>
                                <Link
                                    href="/admin/contact-lists/create"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Create List
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[600px] w-full text-sm">
                                <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    {['Name', 'Description', 'Contacts', 'Created', 'Actions'].map((h, i) => (
                                        <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {lists.data?.length > 0 ? lists.data.map((l) => (
                                    <tr key={l.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                    <FolderOpen className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <div className="font-medium text-zinc-800 dark:text-zinc-200">{l.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="text-xs text-zinc-500 line-clamp-1 max-w-[200px] block">
                                                    {l.description || '—'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20">
                                                    <Users className="w-3 h-3" />
                                                    {l.contacts_count.toLocaleString()}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-zinc-500">{l.created_at}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => openDetails(l)}
                                                    title="View details"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(l)}
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
                                        <td colSpan={5} className="text-center py-12 text-zinc-400 text-sm">
                                            <List className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            No contact lists found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={lists}
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
                title="Delete Contact List"
                description={`Are you sure you want to delete "${selectedList?.name}"? All contacts in this list will be unlinked. This action cannot be undone.`}
            />

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Contact List Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedList && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Name',     value: selectedList.name },
                                    { label: 'Contacts', value: selectedList.contacts_count.toLocaleString() },
                                    { label: 'Created',  value: selectedList.created_at },
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>
                                    </div>
                                ))}
                            </div>
                            {selectedList.description && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-lg">
                                        {selectedList.description}
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
