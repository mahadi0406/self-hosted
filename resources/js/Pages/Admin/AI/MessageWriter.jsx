import React, { useState, useCallback } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Sparkles, Smartphone, Send, Copy,
    Check, RefreshCw, Loader2, Shield,
    ChevronDown, ChevronUp, History, AlertCircle,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";
const inputErrorCls = "w-full px-3 py-2 text-sm border border-red-500 dark:border-red-500 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600";

function Field({ label, description = null, children, error = null }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
            {description && <p className="text-xs text-zinc-400">{description}</p>}
            {children}
            <div className="min-h-[20px]">
                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{error}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

function ComplianceBar({ score }) {
    let color = 'bg-red-500';
    let label = 'Review needed';

    if (score >= 90) {
        color = 'bg-emerald-500';
        label = 'Excellent';
    } else if (score >= 70) {
        color = 'bg-amber-500';
        label = 'Good';
    }

    let textColor = 'text-red-600';
    if (score >= 90) {
        textColor = 'text-emerald-600';
    } else if (score >= 70) {
        textColor = 'text-amber-600';
    }

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Compliance</span>
                <span className={textColor}>{score}% · {label}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

function VariantCard({ variant, channel }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(() => {
        navigator.clipboard.writeText(variant.body);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    }, [variant.body]);

    const bubbleClass = channel === 'whatsapp'
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-zinc-800 dark:text-zinc-200'
        : 'bg-blue-50 dark:bg-blue-900/20 text-zinc-800 dark:text-zinc-200';

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                        {variant.variant}
                    </div>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{variant.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{variant.character_count} chars</span>
                    <button
                        type="button"
                        onClick={copy}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className={`rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed max-w-sm ${bubbleClass}`}>
                    {variant.body}
                </div>
                <div className="mt-3">
                    <ComplianceBar score={variant.compliance_score} />
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
    );
}

function EmptyState() {
    const features = [
        { icon: Sparkles, label: '3 Variants', sub: 'Per generation' },
        { icon: Shield, label: 'Compliance', sub: 'Score per variant' },
        { icon: Send, label: 'Copy & Use', sub: 'One click copy' },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ready to write</p>
            <p className="text-xs text-zinc-400 max-w-xs">
                Fill in your business type and goal, then click Generate to get 3 AI-crafted message variants.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
                {features.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <Icon className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
                        <p className="text-xs text-zinc-400">{sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VariantsList({ variants, channel, onRegenerate }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {variants.length} variants generated
                </p>
                <button
                    type="button"
                    onClick={onRegenerate}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                </button>
            </div>
            {variants.map((v) => (
                <VariantCard key={v.variant} variant={v} channel={channel} />
            ))}
        </div>
    );
}

function RecentHistory({ logs, showHistory, onToggle }) {
    if (!logs || logs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span>Recent Generations ({logs.length})</span>
                </div>
                {showHistory ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
            </button>
            {showHistory && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {logs.map((log) => (
                        <div key={log.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${log.success ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {log.success ? <Check className="w-3 h-3" /> : <span>✕</span>}
                                    <span>{log.success ? 'Success' : 'Failed'}</span>
                                </span>
                                <span className="text-xs text-zinc-400">{log.created_at}</span>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-1">
                                {log.prompt?.slice(0, 100)}...
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {log.input_tokens + log.output_tokens} tokens used
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const TONES = [
    { value: 'friendly', label: '😊 Friendly' },
    { value: 'professional', label: '💼 Professional' },
    { value: 'urgent', label: '⚡ Urgent' },
    { value: 'casual', label: '👋 Casual' },
    { value: 'formal', label: '🎩 Formal' },
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'bn', label: 'Bengali' },
    { value: 'id', label: 'Indonesian' },
];

const CHANNELS = [
    { value: 'whatsapp', label: 'WhatsApp', Icon: Smartphone, color: 'text-emerald-500' },
    { value: 'telegram', label: 'Telegram', Icon: Send, color: 'text-blue-500' },
];

export default function MessageWriter({ recent_logs = [] }) {
    const [form, setForm] = useState({
        business_type: '',
        goal: '',
        tone: 'friendly',
        channel: 'whatsapp',
        language: 'en',
        include_emoji: true,
        include_cta: true,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [apiError, setApiError] = useState('');

    const updateField = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        setApiError('');
    }, []);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!form.business_type.trim()) {
            newErrors.business_type = 'Business type is required';
        } else if (form.business_type.length > 100) {
            newErrors.business_type = 'Must be less than 100 characters';
        }

        if (!form.goal.trim()) {
            newErrors.goal = 'Goal is required';
        } else if (form.goal.length > 300) {
            newErrors.goal = 'Must be less than 300 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form.business_type, form.goal]);

    const generate = useCallback(async () => {
        setApiError('');

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setVariants([]);

        try {
            const res = await axios.post('/admin/ai/message-writer/generate', form);
            const data = res.data.variants || [];
            setVariants(data);
            toast.success('3 message variants generated!');
        } catch (err) {
            const response = err.response;

            if (response?.status === 422 && response?.data?.errors) {
                const serverErrors = {};
                Object.keys(response.data.errors).forEach((key) => {
                    serverErrors[key] = response.data.errors[key][0];
                });
                setErrors(serverErrors);
                toast.error('Please fix the validation errors');
            } else if (response?.data?.error) {
                setApiError(response.data.error);
                toast.error(response.data.error);
            } else {
                setApiError('An unexpected error occurred. Please try again.');
                toast.error('Failed to generate. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [form, validateForm]);

    const toggleHistory = useCallback(() => {
        setShowHistory((prev) => !prev);
    }, []);

    const hasVariants = variants.length > 0;

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
                        <Sparkles className="w-3 h-3" />
                        <span>AI</span>
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Form — 2 cols */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Message Settings
                            </h2>

                            {/* API Error Alert */}
                            {apiError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                                            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{apiError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Channel Selection */}
                            <Field label="Channel" error={errors.channel}>
                                <div className="grid grid-cols-2 gap-2">
                                    {CHANNELS.map(({ value, label, Icon, color }) => {
                                        const isSelected = form.channel === value;
                                        const hasError = Boolean(errors.channel);

                                        let borderClass = 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800';
                                        if (isSelected) {
                                            borderClass = 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800';
                                        } else if (hasError) {
                                            borderClass = 'border-red-300 dark:border-red-700 hover:bg-zinc-50 dark:hover:bg-zinc-800';
                                        }

                                        return (
                                            <label
                                                key={value}
                                                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${borderClass}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="channel"
                                                    value={value}
                                                    checked={isSelected}
                                                    onChange={() => updateField('channel', value)}
                                                    className="sr-only"
                                                />
                                                <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Business Type */}
                            <Field label="Business Type" description="e.g. E-commerce, Restaurant, Gym" error={errors.business_type}>
                                <input
                                    type="text"
                                    value={form.business_type}
                                    onChange={(e) => updateField('business_type', e.target.value)}
                                    placeholder="e.g. Online clothing store"
                                    className={errors.business_type ? inputErrorCls : inputCls}
                                    maxLength={100}
                                />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-xs ${form.business_type.length > 90 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                        {form.business_type.length}/100
                                    </span>
                                </div>
                            </Field>

                            {/* Goal */}
                            <Field label="Goal" description="What should this message achieve?" error={errors.goal}>
                                <textarea
                                    value={form.goal}
                                    onChange={(e) => updateField('goal', e.target.value)}
                                    placeholder="e.g. Promote our 50% summer sale and drive purchases before Sunday"
                                    rows={3}
                                    className={`${errors.goal ? inputErrorCls : inputCls} resize-none`}
                                    maxLength={300}
                                />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-xs ${form.goal.length > 270 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                        {form.goal.length}/300
                                    </span>
                                </div>
                            </Field>

                            {/* Tone */}
                            <Field label="Tone" error={errors.tone}>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {TONES.map((t) => {
                                        const isSelected = form.tone === t.value;
                                        const hasError = Boolean(errors.tone);

                                        let className = 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800';
                                        if (isSelected) {
                                            className = 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100';
                                        } else if (hasError) {
                                            className = 'border-red-300 dark:border-red-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800';
                                        }

                                        return (
                                            <label
                                                key={t.value}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${className}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tone"
                                                    value={t.value}
                                                    checked={isSelected}
                                                    onChange={() => updateField('tone', t.value)}
                                                    className="sr-only"
                                                />
                                                <span>{t.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Language */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Language" error={errors.language}>
                                    <select
                                        value={form.language}
                                        onChange={(e) => updateField('language', e.target.value)}
                                        className={errors.language ? inputErrorCls : inputCls}
                                    >
                                        {LANGUAGES.map((l) => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Options</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.include_emoji}
                                        onChange={(e) => updateField('include_emoji', e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Include emojis</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.include_cta}
                                        onChange={(e) => updateField('include_cta', e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Include call-to-action</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={generate}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Generate 3 Variants</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output — 3 cols */}
                    <div className="lg:col-span-3 space-y-4">
                        {loading && <LoadingSkeleton />}

                        {!loading && hasVariants && (
                            <VariantsList
                                variants={variants}
                                channel={form.channel}
                                onRegenerate={generate}
                            />
                        )}

                        {!loading && !hasVariants && <EmptyState />}

                        <RecentHistory
                            logs={recent_logs}
                            showHistory={showHistory}
                            onToggle={toggleHistory}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
