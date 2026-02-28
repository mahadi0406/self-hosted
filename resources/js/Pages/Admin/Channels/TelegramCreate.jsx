import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, Send, ExternalLink } from "lucide-react";

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

const TelegramCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name:         '',
        bot_token:    '',
        bot_username: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/channels/telegram');
    };

    return (
        <Layout pageTitle="Add Telegram Channel" pageSection="Channels">
            <Head title="Add Telegram Channel" />

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
                        <Send className="w-5 h-5 text-blue-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Connect Telegram</h1>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
                    <Send className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        Create a bot using <strong>@BotFather</strong> on Telegram.
                        Open Telegram, search <strong>@BotFather</strong>, send{' '}
                        <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded font-mono text-xs">/newbot</code>{' '}
                        and follow the steps to get your bot token.
                        {' '}
                        <a href="https://core.telegram.org/bots" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                            Telegram Bot Docs <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-5">Bot Details</h2>
                    <form onSubmit={submit} className="space-y-5">

                        <Field label="Channel Name" description="A friendly label to identify this bot" error={errors.name}>
                            <Input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. Support Bot"
                            />
                        </Field>

                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Telegram Bot Credentials</h3>
                            <div className="space-y-5">

                                <Field label="Bot Token" description="Token provided by @BotFather after creating your bot" error={errors.bot_token}>
                                    <Input
                                        type="password"
                                        value={data.bot_token}
                                        onChange={e => setData('bot_token', e.target.value)}
                                        placeholder="123456789:AAFxxxxxxxxxxxxxxxx"
                                    />
                                </Field>

                                <Field label="Bot Username" description="Your bot's username without the @ symbol" error={errors.bot_username}>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">@</span>
                                        <input
                                            type="text"
                                            value={data.bot_username}
                                            onChange={e => setData('bot_username', e.target.value)}
                                            placeholder="my_blast_bot"
                                            className="w-full pl-7 pr-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                                        />
                                    </div>
                                </Field>

                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {processing ? 'Connecting...' : 'Connect Telegram'}
                            </button>
                            <Link
                                href="/admin/channels"
                                className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default TelegramCreate;
