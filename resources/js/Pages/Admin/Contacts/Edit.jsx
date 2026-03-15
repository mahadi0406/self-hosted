import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation.jsx";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Input = ({ ...props }) => (
    <input
        {...props}
        className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
    />
);

const Edit = ({ contact, lists }) => {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name:        contact.name ?? '',
        phone:       contact.phone ?? '',
        telegram_id: contact.telegram_id ?? '',
        email:       contact.email ?? '',
        country:     contact.country ?? '',
        language:    contact.language ?? 'en',
        tags:        Array.isArray(contact.tags) ? contact.tags.join(', ') : (contact.tags ?? ''),
        status:      contact.status ?? 'active',
        list_ids:    contact.list_ids ?? [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/contacts/${contact.id}`);
    };

    const toggleList = (id) => {
        const ids = data.list_ids.includes(id)
            ? data.list_ids.filter(i => i !== id)
            : [...data.list_ids, id];
        setData('list_ids', ids);
    };

    return (
        <Layout pageTitle={t('contacts.edit_contact')} pageSection={t('nav.contacts')}>
            <Head title={t('contacts.edit_contact')} />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/contacts"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{t('contacts.edit_contact')}</h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{t('contacts.basic_info')}</h2>

                        <Field label={t('contacts.full_name')} error={errors.name}>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="John Doe" />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label={t('contacts.phone_number')} description={t('contacts.phone_whatsapp_desc')} error={errors.phone}>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+1234567890" />
                            </Field>
                            <Field label={t('contacts.telegram_id')} description={t('contacts.telegram_id_desc')} error={errors.telegram_id}>
                                <Input value={data.telegram_id} onChange={e => setData('telegram_id', e.target.value)} placeholder="123456789" />
                            </Field>
                        </div>

                        <Field label={t('contacts.email')} error={errors.email}>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="john@example.com" />
                        </Field>
                    </div>

                    {/* Extra Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{t('contacts.extra_info')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label={t('contacts.country')} description={t('contacts.country_desc')} error={errors.country}>
                                <Input value={data.country} onChange={e => setData('country', e.target.value)} placeholder="US" />
                            </Field>
                            <Field label={t('contacts.language')} description={t('contacts.language_desc')} error={errors.language}>
                                <Input value={data.language} onChange={e => setData('language', e.target.value)} placeholder="en" />
                            </Field>
                        </div>

                        <Field label={t('contacts.tags')} description={t('contacts.tags_desc')} error={errors.tags}>
                            <Input value={data.tags} onChange={e => setData('tags', e.target.value)} placeholder="vip, customer, lead" />
                        </Field>

                        <Field label={t('common.status')} error={errors.status}>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                            >
                                <option value="active">{t('contacts.status_active')}</option>
                                <option value="opted_out">{t('contacts.status_opted_out')}</option>
                                <option value="unsubscribed">{t('contacts.status_unsubscribed')}</option>
                            </select>
                        </Field>
                    </div>

                    {/* Lists */}
                    {lists.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{t('contacts.contact_lists_section')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {lists.map(list => (
                                    <label
                                        key={list.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                                            data.list_ids.includes(list.id)
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.list_ids.includes(list.id)}
                                            onChange={() => toggleList(list.id)}
                                            className="rounded"
                                        />
                                        {list.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            {processing ? t('common.saving') : t('contacts.update_contact')}
                        </button>
                        <Link
                            href="/admin/contacts"
                            className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Edit;
