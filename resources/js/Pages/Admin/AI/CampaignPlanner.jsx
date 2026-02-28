import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Bot, Sparkles, Smartphone, Send, Loader2,
    Calendar, Target, Users, TrendingUp, Clock,
    Lightbulb, AlertTriangle, Copy, Check,
    ChevronDown, ChevronUp, History, RefreshCw,
    Zap, Radio, MessageSquare, Bell,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";

const Field = ({ label, description, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
    </div>
);

const stepTypeConfig = {
    broadcast:   { label: 'Broadcast',   color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',       icon: Radio },
    follow_up:   { label: 'Follow Up',   color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: MessageSquare },
    reminder:    { label: 'Reminder',    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',     icon: Bell },
    engagement:  { label: 'Engagement',  color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',  icon: Zap },
};

const StepTypeBadge = ({ type }) => {
    const cfg = stepTypeConfig[type] ?? stepTypeConfig.broadcast;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
            <Icon className="w-3 h-3 shrink-0" /> {cfg.label}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
            <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className={`text-xl font-bold ${accent ?? 'text-zinc-900 dark:text-zinc-100'}`}>{value}</div>
        {sub && <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>}
    </div>
);

const StepCard = ({ step, channel }) => {
    const [copied, setCopied] = useState(false);
    const [open, setOpen]     = useState(step.step <= 3);

    const copy = () => {
        navigator.clipboard.writeText(step.message);
        setCopied(true);
        toast.success('Message copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    step.step === 1 ? 'bg-purple-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                }`}>
                    {step.step}
                </div>
                <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 mt-1" />
            </div>

            {/* Card */}
            <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-3">
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setOpen(o => !o)}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-zinc-400 shrink-0">Day {step.day}</span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{step.title}</span>
                        <StepTypeBadge type={step.type} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-400 hidden sm:block">{step.send_time}</span>
                        {open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                </div>

                {open && (
                    <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
                        <p className="text-xs text-zinc-400"><span className="font-medium text-zinc-500">Objective:</span> {step.objective}</p>

                        {/* Message bubble */}
                        <div className={`rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed relative group ${
                            channel === 'whatsapp'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-zinc-800 dark:text-zinc-200'
                                : 'bg-blue-50 dark:bg-blue-900/20 text-zinc-800 dark:text-zinc-200'
                        }`}>
                            {step.message}
                            <button
                                onClick={copy}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 transition-all"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {step.send_time}</span>
                            <span>{step.message.length} chars</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CampaignPlanner = ({ recent_logs, channels, contact_lists }) => {
    const [form, setForm] = useState({
        business_type:  '',
        goal:           '',
        channel:        'whatsapp',
        duration_days:  7,
        audience_size:  1000,
        tone:           'friendly',
        language:       'en',
        campaign_type:  'drip',
    });

    const [loading, setLoading]       = useState(false);
    const [plan, setPlan]             = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const generate = async () => {
        if (!form.business_type || !form.goal) {
            toast.error('Please fill in Business Type and Goal.');
            return;
        }
        setLoading(true);
        setPlan(null);
        try {
            const res = await axios.post('/admin/ai/campaign-planner/generate', form);
            setPlan(res.data.plan);
            toast.success('Campaign plan generated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyAll = () => {
        if (!plan) return;
        const text = plan.steps.map(s => `Day ${s.day} - ${s.title}\n${s.message}`).join('\n\n---\n\n');
        navigator.clipboard.writeText(text);
        toast.success('All messages copied!');
    };

    return (
        <Layout pageTitle="AI Campaign Planner" pageSection="AI Features">
            <Head title="AI Campaign Planner" />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Page Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">AI Campaign Planner</h1>
                        <p className="text-xs text-zinc-400">Generate a full multi-day campaign with messages, timing & strategy</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-3 h-3" /> AI
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Form — 2 cols */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Campaign Settings</h2>

                            {/* Channel */}
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

                            <Field label="Business Type">
                                <input type="text" value={form.business_type} onChange={e => set('business_type', e.target.value)} placeholder="e.g. Fashion e-commerce store" className={inputCls} />
                            </Field>

                            <Field label="Campaign Goal" description="What do you want to achieve?">
                                <textarea
                                    value={form.goal}
                                    onChange={e => set('goal', e.target.value)}
                                    placeholder="e.g. Re-engage inactive customers and drive 20% more sales in the next 7 days"
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>

                            {/* Campaign Type */}
                            <Field label="Campaign Type">
                                <div className="space-y-2">
                                    {[
                                        { value: 'drip',      label: 'Drip Sequence',  desc: 'Automated follow-up steps',   Icon: Zap },
                                        { value: 'broadcast', label: 'Broadcast',      desc: 'One-time blast to all',       Icon: Radio },
                                        { value: 'mixed',     label: 'Mixed Strategy', desc: 'Broadcast + drip combo',      Icon: Sparkles },
                                    ].map(({ value, label, desc, Icon }) => (
                                        <label key={value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            form.campaign_type === value
                                                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}>
                                            <input type="radio" name="campaign_type" value={value} checked={form.campaign_type === value} onChange={() => set('campaign_type', value)} className="sr-only" />
                                            <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
                                                <p className="text-xs text-zinc-400">{desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            {/* Duration & Audience */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Duration (days)">
                                    <input type="number" min={1} max={90} value={form.duration_days} onChange={e => set('duration_days', parseInt(e.target.value) || 1)} className={inputCls} />
                                </Field>
                                <Field label="Audience Size">
                                    <input type="number" min={1} value={form.audience_size} onChange={e => set('audience_size', parseInt(e.target.value) || 1)} className={inputCls} />
                                </Field>
                            </div>

                            {/* Tone & Language */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Tone">
                                    <select value={form.tone} onChange={e => set('tone', e.target.value)} className={inputCls}>
                                        <option value="friendly">😊 Friendly</option>
                                        <option value="professional">💼 Professional</option>
                                        <option value="urgent">⚡ Urgent</option>
                                        <option value="casual">👋 Casual</option>
                                        <option value="formal">🎩 Formal</option>
                                    </select>
                                </Field>
                                <Field label="Language">
                                    <select value={form.language} onChange={e => set('language', e.target.value)} className={inputCls}>
                                        <option value="en">English</option>
                                        <option value="ar">Arabic</option>
                                        <option value="hi">Hindi</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="pt">Portuguese</option>
                                        <option value="bn">Bengali</option>
                                        <option value="id">Indonesian</option>
                                    </select>
                                </Field>
                            </div>

                            <button
                                onClick={generate}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                            >
                                {loading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Planning campaign...</>
                                    : <><Bot className="w-4 h-4" /> Generate Campaign Plan</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Output — 3 cols */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Loading */}
                        {loading && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 animate-pulse space-y-2">
                                            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
                                            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
                                        </div>
                                    ))}
                                </div>
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                                        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                                            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-40" />
                                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Plan output */}
                        {!loading && plan && (
                            <div className="space-y-5">

                                {/* Overview */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{plan.campaign_name}</h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{plan.overview}</p>
                                        </div>
                                        <button onClick={generate} className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 shrink-0 transition-colors">
                                            <RefreshCw className="w-3 h-3" /> Redo
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <StatCard icon={Users}      label="Est. Reach"   value={plan.estimated_reach?.toLocaleString()}      accent="text-blue-600" />
                                    <StatCard icon={TrendingUp} label="Open Rate"    value={`${plan.expected_open_rate}%`}                accent="text-emerald-600" />
                                    <StatCard icon={MessageSquare} label="Reply Rate" value={`${plan.expected_reply_rate}%`}             accent="text-purple-600" />
                                    <StatCard icon={Calendar}   label="Steps"        value={plan.steps?.length}                          />
                                </div>

                                {/* Best send times */}
                                {plan.best_send_times?.length > 0 && (
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Best Times</span>
                                        {plan.best_send_times.map((t, i) => (
                                            <span key={i} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{t}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Steps timeline */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Campaign Steps</h3>
                                        <button onClick={copyAll} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                                            <Copy className="w-3.5 h-3.5" /> Copy all messages
                                        </button>
                                    </div>
                                    <div>
                                        {plan.steps?.map((step) => (
                                            <StepCard key={step.step} step={step} channel={form.channel} />
                                        ))}
                                    </div>
                                </div>

                                {/* Tips & Warnings */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {plan.tips?.length > 0 && (
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
                                            <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Tips
                                            </h3>
                                            <ul className="space-y-2">
                                                {plan.tips.map((tip, i) => (
                                                    <li key={i} className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {plan.warnings?.length > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                                            <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Warnings
                                            </h3>
                                            <ul className="space-y-2">
                                                {plan.warnings.map((w, i) => (
                                                    <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
                                                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !plan && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center py-16 px-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                                    <Bot className="w-7 h-7 text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ready to plan</p>
                                <p className="text-xs text-zinc-400 max-w-xs">Describe your business and goal. The AI will build a complete day-by-day campaign with messages, timing, and strategy.</p>
                                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                                    {[
                                        { icon: Calendar,    label: 'Full Schedule', sub: 'Day-by-day plan' },
                                        { icon: Target,      label: 'Strategy',      sub: 'Tips & warnings' },
                                        { icon: TrendingUp,  label: 'Projections',   sub: 'Open & reply rates' },
                                        { icon: Copy,        label: 'Copy Ready',    sub: 'All messages' },
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

                        {/* History */}
                        {recent_logs?.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowHistory(h => !h)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <History className="w-4 h-4 text-zinc-400" />
                                        Recent Plans ({recent_logs.length})
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
                                                <p className="text-xs text-zinc-400 mt-0.5">{(log.input_tokens + log.output_tokens).toLocaleString()} tokens</p>
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

export default CampaignPlanner;
