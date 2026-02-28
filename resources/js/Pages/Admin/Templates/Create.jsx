import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, FileText, Plus, X, Smartphone, Send } from "lucide-react";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600";

const Create = () => {
    const [buttons, setButtons] = useState([]);
    const [buttonInput, setButtonInput] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name:     '',
        channel:  'whatsapp',
        language: 'en',
        header:   '',
        body:     '',
        footer:   '',
        buttons:  [],
        ai_tone:  '',
    });

    const addButton = () => {
        if (!buttonInput.trim()) return;
        const updated = [...buttons, buttonInput.trim()];
        setButtons(updated);
        setData('buttons', updated);
        setButtonInput('');
    };

    const removeButton = (i) => {
        const updated = buttons.filter((_, idx) => idx !== i);
        setButtons(updated);
        setData('buttons', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/templates');
    };

    // Live preview
    const preview = {
        header: data.header,
        body:   data.body,
        footer: data.footer,
        buttons,
    };

    return (
        <Layout pageTitle="Create Template" pageSection="Messaging">
            <Head title="Create Template" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/templates" className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Create Template</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Form — 3 cols */}
                    <form onSubmit={submit} className="lg:col-span-3 space-y-5">

                        {/* Basic */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Template Info</h2>

                            <Field label="Template Name" error={errors.name}>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Welcome Message" className={inputCls} />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Channel" error={errors.channel}>
                                    <select value={data.channel} onChange={e => setData('channel', e.target.value)} className={inputCls}>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="telegram">Telegram</option>
                                    </select>
                                </Field>
                                <Field label="Language" error={errors.language}>
                                    <select value={data.language} onChange={e => setData('language', e.target.value)} className={inputCls}>
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
                        </div>

                        {/* Content */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-5">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Content</h2>

                            <Field label="Header" description="Optional — shown above the body" error={errors.header}>
                                <input type="text" value={data.header} onChange={e => setData('header', e.target.value)} placeholder="e.g. 🎉 Special Offer!" className={inputCls} />
                            </Field>

                            <Field label="Body" description="Main message. Use {{1}}, {{2}} for variables" error={errors.body}>
                                <textarea
                                    value={data.body}
                                    onChange={e => setData('body', e.target.value)}
                                    placeholder="Hi {{1}}, we have a special offer just for you..."
                                    rows={5}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>

                            <Field label="Footer" description="Optional — shown below the body" error={errors.footer}>
                                <input type="text" value={data.footer} onChange={e => setData('footer', e.target.value)} placeholder="e.g. Reply STOP to unsubscribe" className={inputCls} />
                            </Field>
                        </div>

                        {/* Buttons */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Quick Reply Buttons <span className="text-zinc-400 font-normal normal-case text-xs">(optional, max 3)</span></h2>

                            {buttons.length < 3 && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={buttonInput}
                                        onChange={e => setButtonInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addButton())}
                                        placeholder="Button label"
                                        className={`${inputCls} flex-1`}
                                    />
                                    <button type="button" onClick={addButton} className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {buttons.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {buttons.map((btn, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm">
                                            {btn}
                                            <button type="button" onClick={() => removeButton(i)} className="hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors">
                                <FileText className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Template'}
                            </button>
                            <Link href="/admin/templates" className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                Cancel
                            </Link>
                        </div>

                    </form>

                    {/* Live Preview — 2 cols */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6 space-y-3">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider px-1">Live Preview</h2>

                            {/* Phone mockup */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    {data.channel === 'whatsapp'
                                        ? <><Smartphone className="w-4 h-4 text-emerald-500" /><span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">WhatsApp Preview</span></>
                                        : <><Send className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Telegram Preview</span></>
                                    }
                                </div>

                                <div className={`rounded-xl p-3 space-y-2 text-sm max-w-[90%] ${
                                    data.channel === 'whatsapp'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'bg-blue-50 dark:bg-blue-900/20'
                                }`}>
                                    {preview.header && (
                                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{preview.header}</p>
                                    )}
                                    {preview.body ? (
                                        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-xs leading-relaxed">{preview.body}</p>
                                    ) : (
                                        <p className="text-zinc-300 dark:text-zinc-600 italic text-xs">Your message body will appear here...</p>
                                    )}
                                    {preview.footer && (
                                        <p className="text-zinc-400 text-xs">{preview.footer}</p>
                                    )}
                                </div>

                                {preview.buttons.length > 0 && (
                                    <div className="mt-2 space-y-1.5 max-w-[90%]">
                                        {preview.buttons.map((btn, i) => (
                                            <div key={i} className={`text-center py-1.5 px-3 rounded-lg text-xs font-medium border ${
                                                data.channel === 'whatsapp'
                                                    ? 'border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                            }`}>
                                                {btn}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 text-right">
                                    <span className="text-xs text-zinc-400">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Character count */}
                            <div className="text-xs text-zinc-400 px-1 flex justify-between">
                                <span>Body characters</span>
                                <span className={data.body.length > 1024 ? 'text-red-500' : ''}>{data.body.length} / 1024</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Create;
