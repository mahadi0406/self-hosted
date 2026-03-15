import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, Smartphone, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation.jsx";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Input = ({ type = 'text', ...props }) => (
    <input
        type={type}
        {...props}
        className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
    />
);

const WhatsappCreate = () => {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name:         '',
        phone_number: '',
        credentials: {
            access_token: '',
            waba_id:      '',
            phone_id:     '',
        },
    });

    const set = (field, value) => setData('credentials', { ...data.credentials, [field]: value });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/channels/whatsapp');
    };

    return (
        <Layout pageTitle={t('channels.add_whatsapp')} pageSection={t('nav.channels')}>
            <Head title={t('channels.add_whatsapp')} />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/channels"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{t('channels.connect_whatsapp')}</h1>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
                    <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        You need a <strong>Meta Business Account</strong> and a <strong>WhatsApp Business App</strong>.
                        Get your credentials from the{' '}
                        <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                            Meta Developer Portal <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-5">{t('channels.channel_details_section')}</h2>
                    <form onSubmit={submit} className="space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label={t('channels.channel_name')} description={t('channels.channel_name_wa_desc')} error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Main WhatsApp"
                                />
                            </Field>

                            <Field label={t('channels.phone_number')} description={t('channels.phone_number_desc')} error={errors.phone_number}>
                                <Input
                                    value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)}
                                    placeholder="+1234567890"
                                />
                            </Field>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">{t('channels.meta_credentials')}</h3>
                            <div className="space-y-5">

                                <Field label={t('channels.access_token')} description={t('channels.access_token_desc')} error={errors['credentials.access_token']}>
                                    <Input
                                        type="password"
                                        value={data.credentials.access_token}
                                        onChange={e => set('access_token', e.target.value)}
                                        placeholder="EAAxxxxxxxx..."
                                    />
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label={t('channels.waba_id')} description={t('channels.waba_id_desc')} error={errors['credentials.waba_id']}>
                                        <Input
                                            value={data.credentials.waba_id}
                                            onChange={e => set('waba_id', e.target.value)}
                                            placeholder="1234567890"
                                        />
                                    </Field>

                                    <Field label={t('channels.phone_number_id')} description={t('channels.phone_number_id_desc')} error={errors['credentials.phone_id']}>
                                        <Input
                                            value={data.credentials.phone_id}
                                            onChange={e => set('phone_id', e.target.value)}
                                            placeholder="1234567890"
                                        />
                                    </Field>
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                            >
                                <Smartphone className="w-4 h-4" />
                                {processing ? t('common.connecting') : t('channels.connect_whatsapp')}
                            </button>
                            <Link
                                href="/admin/channels"
                                className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default WhatsappCreate;
