import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    ArrowLeft, Zap, Plus, Trash2, GripVertical,
    Smartphone, Send, ChevronDown, ChevronUp,
    Clock, FileText, Check,
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

const defaultStep = () => ({
    name:        '',
    delay_days:  0,
    delay_hours: 0,
    send_at_time:'',
    template_id: '',
    body:        '',
    open:        true,
});

const StepCard = ({ step, index, total, onChange, onRemove, onToggle, templates, errors }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {/* Step Header */}
        <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors select-none"
            onClick={onToggle}
        >
            <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold shrink-0">
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {step.name || `Step ${index + 1}`}
                </p>
                {!step.open && (
                    <p className="text-xs text-zinc-400">
                        Delay: {step.delay_days}d {step.delay_hours}h
                        {step.send_at_time && ` · Send at ${step.send_at_time}`}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {total > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
                {step.open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
        </div>

        {/* Step Body */}
        {step.open && (
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-100 dark:border-zinc-800">

                <Field label="Step Name" error={errors?.[`steps.${index}.name`]}>
                    <input type="text" value={step.name} onChange={e => onChange('name', e.target.value)} placeholder={`e.g. Welcome Message`} className={inputCls} />
                </Field>

                {/* Delay */}
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Delay Days" error={errors?.[`steps.${index}.delay_days`]}>
                        <div className="relative">
                            <input type="number" min={0} value={step.delay_days} onChange={e => onChange('delay_days', parseInt(e.target.value) || 0)} className={inputCls} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">days</span>
                        </div>
                    </Field>
                    <Field label="Delay Hours" error={errors?.[`steps.${index}.delay_hours`]}>
                        <div className="relative">
                            <input type="number" min={0} max={23} value={step.delay_hours} onChange={e => onChange('delay_hours', parseInt(e.target.value) || 0)} className={inputCls} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">hrs</span>
                        </div>
                    </Field>
                    <Field label="Send At Time" description="Optional">
                        <input type="time" value={step.send_at_time} onChange={e => onChange('send_at_time', e.target.value)} className={inputCls} />
                    </Field>
                </div>

                {/* Template picker */}
                {templates.length > 0 && (
                    <Field label="Use Template" description="Optional — prefills the message body">
                        <select
                            value={step.template_id}
                            onChange={e => {
                                const t = templates.find(t => t.id == e.target.value);
                                onChange('template_id', e.target.value);
                                if (t) onChange('body', t.body);
                            }}
                            className={inputCls}
                        >
                            <option value="">— No template —</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </Field>
                )}

                <Field label="Message Body" description="Use {{name}} for personalization" error={errors?.[`steps.${index}.body`]}>
                    <textarea
                        value={step.body}
                        onChange={e => onChange('body', e.target.value)}
                        placeholder="Hi {{name}}, just checking in..."
                        rows={3}
                        className={`${inputCls} resize-none`}
                    />
                    <div className="text-right text-xs text-zinc-400 mt-0.5">{step.body.length} chars</div>
                </Field>
            </div>
        )}
    </div>
);

const Create = ({ channels, templates }) => {
    const [steps, setSteps] = useState([defaultStep()]);

    const { data, setData, post, processing, errors } = useForm({
        name:        '',
        description: '',
        channel_id:  '',
        ai_goal:     '',
        steps:       [defaultStep()],
    });

    const syncSteps = (updated) => {
        setSteps(updated);
        setData('steps', updated);
    };

    const addStep = () => syncSteps([...steps, defaultStep()]);

    const removeStep = (i) => syncSteps(steps.filter((_, idx) => idx !== i));

    const updateStep = (i, field, value) => {
        const updated = steps.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
        syncSteps(updated);
    };

    const toggleStep = (i) => {
        const updated = steps.map((s, idx) => idx === i ? { ...s, open: !s.open } : s);
        syncSteps(updated);
    };

    const filteredTemplates = templates.filter(t => {
        const ch = channels.find(c => c.id == data.channel_id);
        return !ch || t.channel === ch.type;
    });

    const totalDelay = steps.reduce((sum, s) => sum + (s.delay_days * 24) + s.delay_hours, 0);

    const submit = (e) => {
        e.preventDefault();
        post('/admin/drip-sequences');
    };

    return (
        <Layout pageTitle="Create Drip Sequence" pageSection="Messaging">
            <Head title="Create Drip Sequence" />

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/drip-sequences" className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Create Drip Sequence</h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">

                    {/* Sequence Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Sequence Info</h2>

                        <Field label="Sequence Name" error={errors.name}>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. New Customer Onboarding" className={inputCls} />
                        </Field>

                        <Field label="Description" description="Optional notes about this sequence" error={errors.description}>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="e.g. Sent to all new customers after signup..." rows={2} className={`${inputCls} resize-none`} />
                        </Field>

                        <Field label="Channel" error={errors.channel_id}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {channels.length === 0 ? (
                                    <p className="text-sm text-zinc-400 col-span-2">No connected channels. <Link href="/admin/channels" className="underline text-zinc-600 dark:text-zinc-300">Add one first.</Link></p>
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

                        <Field label="AI Goal" description="Optional — describe what this drip sequence should achieve">
                            <input type="text" value={data.ai_goal} onChange={e => setData('ai_goal', e.target.value)} placeholder="e.g. Guide new users to make their first purchase within 7 days" className={inputCls} />
                        </Field>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Steps <span className="text-zinc-400 font-normal normal-case">({steps.length})</span></h2>
                                {totalDelay > 0 && (
                                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Total duration: {Math.floor(totalDelay / 24)}d {totalDelay % 24}h
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Timeline connector + step cards */}
                        <div className="space-y-3">
                            {steps.map((step, i) => (
                                <div key={i} className="relative">
                                    {/* Timeline line */}
                                    {i < steps.length - 1 && (
                                        <div className="absolute left-[18px] top-full w-px h-3 bg-zinc-200 dark:bg-zinc-700 z-10" />
                                    )}
                                    <StepCard
                                        step={step}
                                        index={i}
                                        total={steps.length}
                                        onChange={(field, value) => updateStep(i, field, value)}
                                        onRemove={() => removeStep(i)}
                                        onToggle={() => toggleStep(i)}
                                        templates={filteredTemplates}
                                        errors={errors}
                                    />
                                </div>
                            ))}
                        </div>

                        {errors.steps && <p className="text-xs text-red-500">{errors.steps}</p>}

                        <button
                            type="button"
                            onClick={addStep}
                            className="w-full py-2.5 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Step
                        </button>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                        >
                            <Zap className="w-4 h-4" />
                            {processing ? 'Creating...' : 'Create Sequence'}
                        </button>
                        <Link href="/admin/drip-sequences" className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </Link>
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default Create;
