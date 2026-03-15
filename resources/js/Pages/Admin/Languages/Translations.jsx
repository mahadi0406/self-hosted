import React, { useState, useEffect } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    BookOpen,
    Search,
    Save,
    ArrowLeft,
    Loader2,
    Globe,
    Edit2,
    Check,
    X,
} from "lucide-react";
import Pagination from "@/Components/UI/pagination.jsx";
import { useTranslation } from "@/hooks/useTranslation.jsx";

const Translations = ({ language, translationRows, filters }) => {
    const translations = translationRows;
    const { t } = useTranslation();
    const [search, setSearch]           = useState(filters?.search || '');
    const [edits, setEdits]             = useState({});
    const [editingKey, setEditingKey]   = useState(null);
    const [saving, setSaving]           = useState(false);
    const [dirty, setDirty]             = useState(false);

    // Track unsaved changes count
    const dirtyCount = Object.keys(edits).length;

    useEffect(() => {
        setDirty(dirtyCount > 0);
    }, [dirtyCount]);

    const handleSearch = () => {
        const params = {};
        if (search) params.search = search;
        router.get(`/admin/languages/${language.id}/translations`, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(`/admin/languages/${language.id}/translations`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const startEdit = (translation) => {
        setEditingKey(translation.key);
        if (!edits[translation.key]) {
            setEdits(prev => ({ ...prev, [translation.key]: translation.value }));
        }
    };

    const cancelEdit = (key) => {
        setEditingKey(null);
        // Only remove from edits if unchanged from original
        const original = translations.data?.find(t => t.key === key);
        if (original && edits[key] === original.value) {
            const next = { ...edits };
            delete next[key];
            setEdits(next);
        }
    };

    const handleChange = (key, value) => {
        setEdits(prev => ({ ...prev, [key]: value }));
    };

    const confirmEdit = (key) => {
        setEditingKey(null);
    };

    const handleSaveAll = () => {
        if (dirtyCount === 0) return;
        setSaving(true);
        router.post(`/admin/languages/${language.id}/translations`, { translations: edits }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${dirtyCount} translation(s) saved successfully!`);
                setEdits({});
                setDirty(false);
                setEditingKey(null);
            },
            onError: () => toast.error('Failed to save translations.'),
            onFinish: () => setSaving(false),
        });
    };

    const getDisplayValue = (translation) => {
        return edits[translation.key] !== undefined ? edits[translation.key] : translation.value;
    };

    const isEdited = (key) => edits[key] !== undefined && edits[key] !== (translations.data?.find(t => t.key === key)?.value);

    return (
        <Layout pageTitle="Translations" pageSection="Settings">
            <Head title={`Translations - ${language.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <section>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/languages"
                                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{language.flag || '🌐'}</span>
                                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                        {language.name} Translations
                                    </h1>
                                    <span className="font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                        {language.code}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {translations.total?.toLocaleString()} translation keys
                                    {dirtyCount > 0 && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            · {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={dirtyCount === 0 || saving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('common.save_changes')} {dirtyCount > 0 && `(${dirtyCount})`}
                        </button>
                    </div>
                </section>

                {/* Filters */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">{t('common.search')}</h2>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Search by key or value..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                            />
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                            >
                                <Search className="w-4 h-4" /> {t('common.search')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {t('common.reset')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Translations Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[700px] w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                        {[t('languages.key'), t('languages.value'), t('common.actions')].map((h, i) => (
                                            <th
                                                key={i}
                                                className={`text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap ${i === 1 ? 'w-full' : ''}`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {translations.data?.length > 0 ? translations.data.map((trans) => (
                                        <tr
                                            key={trans.id}
                                            className={`border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 transition-colors ${
                                                isEdited(trans.key)
                                                    ? 'bg-amber-50/50 dark:bg-amber-900/10'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                                            }`}
                                        >
                                            <td className="px-4 py-3 min-w-[200px] max-w-[280px]">
                                                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 break-all">
                                                    {trans.key}
                                                </span>
                                                {isEdited(trans.key) && (
                                                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                        edited
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 w-full">
                                                {editingKey === trans.key ? (
                                                    <textarea
                                                        autoFocus
                                                        value={getDisplayValue(trans)}
                                                        onChange={e => handleChange(trans.key, e.target.value)}
                                                        rows={Math.max(2, Math.ceil(getDisplayValue(trans).length / 80))}
                                                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 resize-y"
                                                    />
                                                ) : (
                                                    <span
                                                        className="text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                                                        onClick={() => startEdit(trans)}
                                                    >
                                                        {getDisplayValue(trans) || <span className="text-zinc-400 italic">empty</span>}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {editingKey === trans.key ? (
                                                        <>
                                                            <button
                                                                onClick={() => confirmEdit(trans.key)}
                                                                title="Done"
                                                                className="p-1.5 rounded-lg border border-green-200 dark:border-green-700 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => cancelEdit(trans.key)}
                                                                title="Cancel"
                                                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEdit(trans)}
                                                            title="Edit"
                                                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-12 text-zinc-400 text-sm">
                                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                                {t('languages.no_translations_found')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                            <Pagination
                                data={translations}
                                onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })}
                            />
                        </div>
                    </div>
                </section>

                {/* Sticky Save Bar */}
                {dirty && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-full shadow-xl">
                            <span className="text-sm font-medium">
                                {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={handleSaveAll}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {t('common.save_changes')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Translations;
