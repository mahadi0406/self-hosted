import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    ArrowLeft, Send, Smartphone, Users, FileText,
    Zap, Calendar, ChevronRight, ChevronLeft, Check,
    Sparkles,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const steps = ['Setup', 'Audience', 'Content', 'Review'];

const StepIndicator = ({ current }) => (
    <div className="flex items-center gap-0">
        {steps.map((label, i) => (
            <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        i < current  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            : i === current ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 ring-4 ring-zinc-200 dark:ring-zinc-700'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                        {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>{label}</span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`h-px w-8 sm:w-12 mx-2 ${i < current ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

const Create = ({ channels, contactLists, templates }) => {
    const [step, setStep] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        name:        '',
        channel_id:  '',
        template_id: '',
        type:        'instant',
        content:     { body: '' },
        audience:    { list_ids: [] },
        scheduled_at:'',
        ai_goal:     '',
    });

    const selectedChannel  = channels.find(c => c.id == data.channel_id);
    const filteredTemplates = templates.filter(t => !selectedChannel || t.channel === selectedChannel.type);

    const toggleList = (id) => {
        const ids = data.audience.list_ids.includes(id)
            ? data.audience.list_ids.filter(i => i !== id)
            : [...data.audience.list_ids, id];
        setData('audience', { ...data.audience, list_ids: ids });
    };

    const totalRecipients = contactLists
        .filter(l => data.audience.list_ids.includes(l.id))
        .reduce((sum, l) => sum + (l.contacts_count || 0), 0);

    const useTemplate = (template) => {
        setData('template_id', template.id);
        setData('content', { ...data.content, body: template.body });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/campaigns');
    };

    const canNext = () => {
        if (step === 0) return data.name && data.channel_id;
        if (step === 1) return data.audience.list_ids.length > 0;
        if (step === 2) return data.content.body;
        return true;
    };

    return (
        <Layout pageTitle="Create Campaign" pageSection="Messaging">
            <Head title="Create Campaign" />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/campaigns" className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Create Campaign</h1>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-5 py-4">
                    <StepIndicator current={step} />
                </div>

                <form onSubmit={submit}>

                    {/* Step 0 — Setup */}
                    {step === 0 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Campaign Setup</h2>

                            <Field label="Campaign Name" error={errors.name}>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Summer Sale Announcement" className={inputCls} />
                            </Field>

                            <Field label="Channel" description="Select a connected channel to send from" error={errors.channel_id}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {channels.length === 0 ? (
                                        <p className="text-sm text-zinc-400 col-span-2">No connected channels. <Link href="/admin/channels" className="underline text-zinc-600 dark:text-zinc-300">Add a channel</Link> first.</p>
                                    ) : channels.map(c => (
                                        <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            data.channel_id == c.id
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <input type="radio" name="channel_id" value={c.id} checked={data.channel_id == c.id} onChange={() => setData('channel_id', c.id)} className="sr-only" />
                                            {c.type === 'whatsapp'
                                                ? <Smartphone className="w-5 h-5 text-emerald-500 shrink-0" />
                                                : <Send className="w-5 h-5 text-blue-500 shrink-0" />
                                            }
                                            <div>
                                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{c.name}</p>
                                                <p className="text-xs text-zinc-400 capitalize">{c.type}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Campaign Type" error={errors.type}>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'instant',   label: 'Instant',   desc: 'Send immediately',       Icon: Zap,      color: 'text-purple-500' },
                                        { value: 'scheduled', label: 'Scheduled', desc: 'Send at a specific time', Icon: Calendar, color: 'text-amber-500' },
                                    ].map(({ value, label, desc, Icon, color }) => (
                                        <label key={value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            data.type === value
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <input type="radio" name="type" value={value} checked={data.type === value} onChange={() => setData('type', value)} className="sr-only" />
                                            <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
                                                <p className="text-xs text-zinc-400">{desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            {data.type === 'scheduled' && (
                                <Field label="Schedule Date & Time" error={errors.scheduled_at}>
                                    <input type="datetime-local" value={data.scheduled_at} onChange={e => setData('scheduled_at', e.target.value)} className={inputCls} />
                                </Field>
                            )}

                            <Field label="AI Goal" description="Optional — describe your goal so AI can help optimize this campaign">
                                <input type="text" value={data.ai_goal} onChange={e => setData('ai_goal', e.target.value)} placeholder="e.g. Drive purchases for summer sale with urgency" className={inputCls} />
                            </Field>
                        </div>
                    )}

                    {/* Step 1 — Audience */}
                    {step === 1 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Select Audience</h2>
                                {data.audience.list_ids.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                        <Users className="w-3 h-3" /> {totalRecipients.toLocaleString()} recipients
                                    </span>
                                )}
                            </div>
                            {errors['audience.list_ids'] && <p className="text-xs text-red-500">{errors['audience.list_ids']}</p>}

                            {contactLists.length === 0 ? (
                                <p className="text-sm text-zinc-400">No contact lists found. <Link href="/admin/contact-lists/create" className="underline text-zinc-600 dark:text-zinc-300">Create a list</Link> first.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {contactLists.map(l => (
                                        <label key={l.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                            data.audience.list_ids.includes(l.id)
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={data.audience.list_ids.includes(l.id)} onChange={() => toggleList(l.id)} className="rounded" />
                                                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{l.name}</span>
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                                <Users className="w-3 h-3" /> {l.contacts_count}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2 — Content */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Pick Template */}
                            {filteredTemplates.length > 0 && (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Use a Template <span className="text-zinc-400 font-normal text-xs normal-case">(optional)</span></h2>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {filteredTemplates.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => useTemplate(t)}
                                                className={`text-left p-3 rounded-lg border transition-colors ${
                                                    data.template_id === t.id
                                                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.name}</span>
                                                    {data.template_id === t.id && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                                                </div>
                                                <p className="text-xs text-zinc-400 line-clamp-1">{t.body}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message Body */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Message Content</h2>
                                <Field label="Message Body" description="Use {{name}} for contact name personalization" error={errors['content.body']}>
                                    <textarea
                                        value={data.content.body}
                                        onChange={e => setData('content', { ...data.content, body: e.target.value })}
                                        placeholder="Hi {{name}}, we have an exclusive offer just for you..."
                                        rows={6}
                                        className={`${inputCls} resize-none`}
                                    />
                                    <div className="text-right text-xs text-zinc-400 mt-1">{data.content.body.length} chars</div>
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Review */}
                    {step === 3 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Review & Confirm</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Campaign Name', value: data.name },
                                    { label: 'Channel',       value: selectedChannel ? `${selectedChannel.name} (${selectedChannel.type})` : '—' },
                                    { label: 'Type',          value: data.type },
                                    { label: 'Scheduled At',  value: data.scheduled_at || '—' },
                                    { label: 'Recipients',    value: `${totalRecipients.toLocaleString()} contacts` },
                                    { label: 'Lists',         value: `${data.audience.list_ids.length} list(s)` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 capitalize">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Message Preview</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-3 rounded-lg whitespace-pre-wrap">{data.content.body}</p>
                            </div>
                            {data.ai_goal && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">AI Goal</p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 rounded-lg">{data.ai_goal}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Nav Buttons */}
                    <div className="flex items-center justify-between mt-5">
                        <button
                            type="button"
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>

                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canNext()}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create Campaign'}
                            </button>
                        )}
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default Create;
