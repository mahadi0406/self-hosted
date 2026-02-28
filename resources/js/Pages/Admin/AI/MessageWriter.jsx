import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Sparkles, Smartphone, Send, Copy,
    Check, RefreshCw, Loader2, Shield,
    ChevronDown, ChevronUp, History,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";

const Field = ({ label, description, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
    </div>
);

const ComplianceBar = ({ score }) => {
    const color = score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';
    const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Review needed';
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Compliance</span>
                <span className={score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}>{score}% · {label}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
};

const VariantCard = ({ variant, channel }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(variant.body);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold">{variant.variant}</div>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{variant.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{variant.character_count} chars</span>
                    <button
                        onClick={copy}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                </div>
            </div>

            {/* Message preview bubble */}
            <div className="p-4">
                <div className={`rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed max-w-sm ${
                    channel === 'whatsapp'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-zinc-800 dark:text-zinc-200'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-zinc-800 dark:text-zinc-200'
                }`}>
                    {variant.body}
                </div>
                <div className="mt-3">
                    <ComplianceBar score={variant.compliance_score} />
                </div>
            </div>
        </div>
    );
};

const MessageWriter = ({ recent_logs }) => {
    const [form, setForm] = useState({
        business_type: '',
        goal:          '',
        tone:          'friendly',
        channel:       'whatsapp',
        language:      'en',
        include_emoji: true,
        include_cta:   true,
    });

    const [loading, setLoading]   = useState(false);
    const [variants, setVariants] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const generate = async () => {
        if (!form.business_type || !form.goal) {
            toast.error('Please fill in Business Type and Goal.');
            return;
        }
        setLoading(true);
        setVariants([]);
        try {
            const res = await axios.post('/admin/ai/message-writer/generate', form);
            setVariants(res.data.variants || []);
            toast.success('3 message variants generated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const tones = [
        { value: 'friendly',     label: '😊 Friendly' },
        { value: 'professional', label: '💼 Professional' },
        { value: 'urgent',       label: '⚡ Urgent' },
        { value: 'casual',       label: '👋 Casual' },
        { value: 'formal',       label: '🎩 Formal' },
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'Arabic' },
        { value: 'hi', label: 'Hindi' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'bn', label: 'Bengali' },
        { value: 'id', label: 'Indonesian' },
    ];

    return (
        <Layout pageTitle="AI Message Writer" pageSection="AI Features">
            <Head title="AI Message Writer" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Page Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">AI Message Writer</h1>
                        <p className="text-xs text-zinc-400">Generate 3 optimized message variants instantly using AI</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-3 h-3" /> AI
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Form — 2 cols */}
                    <div className="lg:col-span-2 space-y-5">

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Message Settings</h2>

                            <Field label="Channel">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'whatsapp', label: 'WhatsApp', Icon: Smartphone, color: 'text-emerald-500' },
                                        { value: 'telegram', label: 'Telegram', Icon: Send,       color: 'text-blue-500' },
                                    ].map(({ value, label, Icon, color }) => (
                                        <label key={value} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                            form.channel === value
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <input type="radio" name="channel" value={value} checked={form.channel === value} onChange={() => set('channel', value)} className="sr-only" />
                                            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Business Type" description="e.g. E-commerce, Restaurant, Gym">
                                <input type="text" value={form.business_type} onChange={e => set('business_type', e.target.value)} placeholder="e.g. Online clothing store" className={inputCls} />
                            </Field>

                            <Field label="Goal" description="What should this message achieve?">
                                <textarea
                                    value={form.goal}
                                    onChange={e => set('goal', e.target.value)}
                                    placeholder="e.g. Promote our 50% summer sale and drive purchases before Sunday"
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>

                            <Field label="Tone">
                                <div className="grid grid-cols-1 gap-1.5">
                                    {tones.map(t => (
                                        <label key={t.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                                            form.tone === t.value
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <input type="radio" name="tone" value={t.value} checked={form.tone === t.value} onChange={() => set('tone', t.value)} className="sr-only" />
                                            {t.label}
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Language">
                                    <select value={form.language} onChange={e => set('language', e.target.value)} className={inputCls}>
                                        {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </Field>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Options</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.include_emoji} onChange={e => set('include_emoji', e.target.checked)} className="rounded" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Include emojis</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.include_cta} onChange={e => set('include_cta', e.target.checked)} className="rounded" />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Include call-to-action</span>
                                </label>
                            </div>

                            <button
                                onClick={generate}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                            >
                                {loading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                    : <><Sparkles className="w-4 h-4" /> Generate 3 Variants</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Output — 3 cols */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3 animate-pulse">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6" />
                                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-4/6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Generated variants */}
                        {!loading && variants.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {variants.length} variants generated
                                    </p>
                                    <button
                                        onClick={generate}
                                        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                    </button>
                                </div>
                                {variants.map(v => (
                                    <VariantCard key={v.variant} variant={v} channel={form.channel} />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && variants.length === 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center py-16 px-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                                    <Sparkles className="w-7 h-7 text-purple-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ready to write</p>
                                <p className="text-xs text-zinc-400 max-w-xs">Fill in your business type and goal, then click Generate to get 3 AI-crafted message variants.</p>

                                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
                                    {[
                                        { icon: Sparkles, label: '3 Variants',     sub: 'Per generation' },
                                        { icon: Shield,   label: 'Compliance',     sub: 'Score per variant' },
                                        { icon: Send,     label: 'Copy & Use',     sub: 'One click copy' },
                                    ].map(({ icon: Icon, label, sub }) => (
                                        <div key={label} className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                            <Icon className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
                                            <p className="text-xs text-zinc-400">{sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent History */}
                        {recent_logs?.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowHistory(h => !h)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <History className="w-4 h-4 text-zinc-400" />
                                        Recent Generations ({recent_logs.length})
                                    </div>
                                    {showHistory ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                </button>
                                {showHistory && (
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                        {recent_logs.map(log => (
                                            <div key={log.id} className="px-4 py-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${log.success ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {log.success ? <Check className="w-3 h-3" /> : '✕'} {log.success ? 'Success' : 'Failed'}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">{log.created_at}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-1">{log.prompt?.slice(0, 100)}...</p>
                                                <p className="text-xs text-zinc-400 mt-0.5">{log.input_tokens + log.output_tokens} tokens used</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MessageWriter;
