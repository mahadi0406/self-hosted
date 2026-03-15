import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Globe,
    Plus,
    Trash2,
    Edit2,
    BookOpen,
    Loader2,
    AlertTriangle,
    Check,
    Star,
    EyeOff,
    Eye,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { useTranslation } from "@/hooks/useTranslation.jsx";

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

const AddLanguageModal = ({ open, onOpenChange }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ code: '', name: '', native_name: '', flag: '', is_active: true });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        router.post('/admin/languages', form, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Language added successfully!');
                onOpenChange(false);
                setForm({ code: '', name: '', native_name: '', flag: '', is_active: true });
            },
            onError: (errs) => {
                setErrors(errs);
                toast.error('Failed to add language.');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const field = (label, key, placeholder, type = 'text') => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            />
            {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('languages.create_language')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {field(t('languages.code'), 'code', 'e.g. fr, de, ar')}
                    {field(t('languages.name'), 'name', 'e.g. French')}
                    {field(t('languages.native_name'), 'native_name', 'e.g. Français')}
                    {field(t('languages.flag'), 'flag', 'e.g. 🇫🇷')}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                            className="rounded border-zinc-300"
                        />
                        <label htmlFor="is_active" className="text-sm text-zinc-700 dark:text-zinc-300">{t('languages.is_active')}</label>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {t('languages.create_language')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const EditLanguageModal = ({ open, onOpenChange, language }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        name: language?.name || '',
        native_name: language?.native_name || '',
        flag: language?.flag || '',
        is_active: language?.is_active ?? true,
        is_default: language?.is_default ?? false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        if (language) {
            setForm({
                name: language.name,
                native_name: language.native_name,
                flag: language.flag || '',
                is_active: language.is_active,
                is_default: language.is_default,
            });
        }
    }, [language]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        router.put(`/admin/languages/${language.id}`, form, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Language updated successfully!');
                onOpenChange(false);
            },
            onError: (errs) => {
                setErrors(errs);
                toast.error('Failed to update language.');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const field = (label, key, placeholder) => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
            <input
                type="text"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            />
            {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('languages.edit_language')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {field(t('languages.name'), 'name', 'e.g. French')}
                    {field(t('languages.native_name'), 'native_name', 'e.g. Français')}
                    {field(t('languages.flag'), 'flag', 'e.g. 🇫🇷')}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                className="rounded border-zinc-300"
                            />
                            {t('languages.is_active')}
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <input
                                type="checkbox"
                                checked={form.is_default}
                                onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                                className="rounded border-zinc-300"
                            />
                            {t('languages.set_default')}
                        </label>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {t('common.save_changes')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const Index = ({ languages }) => {
    const { t } = useTranslation();
    const [showAddModal, setShowAddModal]       = useState(false);
    const [showEditModal, setShowEditModal]     = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLang, setSelectedLang]       = useState(null);
    const [deleting, setDeleting]               = useState(false);

    const openEdit = (lang) => { setSelectedLang(lang); setShowEditModal(true); };
    const openDelete = (lang) => { setSelectedLang(lang); setShowDeleteModal(true); };

    const confirmDelete = () => {
        if (!selectedLang) return;
        const id = selectedLang.id;
        const name = selectedLang.name;
        setShowDeleteModal(false);
        setSelectedLang(null);
        setDeleting(true);
        router.delete(`/admin/languages/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(`"${name}" deleted successfully!`),
            onError: () => toast.error('Failed to delete language.'),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <Layout pageTitle="Languages" pageSection="Settings">
            <Head title="Languages" />

            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Header */}
                <section>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('languages.title')}</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {t('languages.description')}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> {t('languages.create_language')}
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: t('languages.title'),      value: languages.length, icon: Globe },
                            { label: t('languages.active_badge'), value: languages.filter(l => l.is_active).length, icon: Eye },
                            { label: t('languages.is_default'), value: languages.filter(l => l.is_default).length, icon: Star },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                                    {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
                                </div>
                                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Table */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[700px] w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                        {[t('languages.name'), t('languages.code'), t('languages.native_name'), t('languages.translations'), t('common.status'), t('common.actions')].map((h, i) => (
                                            <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {languages.length > 0 ? languages.map((lang) => (
                                        <tr key={lang.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{lang.flag || '🌐'}</span>
                                                    <div>
                                                        <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                                            {lang.name}
                                                            {lang.is_default && (
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                                                    <Star className="w-3 h-3" /> {t('languages.default_badge')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {lang.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-sm">
                                                {lang.native_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20">
                                                    <BookOpen className="w-3 h-3" />
                                                    {lang.translations_count?.toLocaleString() ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {lang.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20">
                                                        <Eye className="w-3 h-3" /> {t('languages.active_badge')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                                                        <EyeOff className="w-3 h-3" /> {t('languages.inactive_badge')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={`/admin/languages/${lang.id}/translations`}
                                                        title="Edit Translations"
                                                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                    >
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(lang)}
                                                        title="Edit"
                                                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {!lang.is_default && (
                                                        <button
                                                            onClick={() => openDelete(lang)}
                                                            title="Delete"
                                                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-zinc-400 text-sm">
                                                <Globe className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                                {t('languages.no_languages_found')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            <AddLanguageModal open={showAddModal} onOpenChange={setShowAddModal} />
            <EditLanguageModal open={showEditModal} onOpenChange={setShowEditModal} language={selectedLang} />
            <DeleteConfirmModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Language"
                description={`Are you sure you want to delete "${selectedLang?.name}"? All translations for this language will also be deleted. This action cannot be undone.`}
            />
        </Layout>
    );
};

export default Index;
