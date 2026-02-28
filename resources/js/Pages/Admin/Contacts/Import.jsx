import React, { useState, useRef } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, Users } from "lucide-react";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Import = ({ lists }) => {
    const fileRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview]   = useState(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        file:     null,
        list_ids: [],
    });

    const toggleList = (id) => {
        const ids = data.list_ids.includes(id)
            ? data.list_ids.filter(i => i !== id)
            : [...data.list_ids, id];
        setData('list_ids', ids);
    };

    const handleFile = (file) => {
        if (!file) return;
        setData('file', file);

        // CSV preview (first 5 rows)
        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split('\n').filter(Boolean).slice(0, 6);
            const rows  = lines.map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
            setPreview(rows);
        };
        reader.readAsText(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) handleFile(file);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/contacts/import');
    };

    const downloadSample = () => {
        const csv     = 'name,phone,telegram_id,email,country,language\nJohn Doe,+1234567890,,john@example.com,US,en\nJane Smith,,987654321,jane@example.com,GB,en';
        const blob    = new Blob([csv], { type: 'text/csv' });
        const url     = URL.createObjectURL(blob);
        const a       = document.createElement('a');
        a.href        = url;
        a.download    = 'contacts_sample.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Layout pageTitle="Import Contacts" pageSection="Contacts">
            <Head title="Import Contacts" />

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
                        <Upload className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Import Contacts</h1>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
                    <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <p>CSV must include at least a <strong>phone</strong> or <strong>telegram_id</strong> column. Duplicates are skipped automatically.</p>
                        <p>Supported columns: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded font-mono text-xs">name, phone, telegram_id, email, country, language</code></p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">

                    {/* Upload Zone */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">CSV File</h2>
                            <button
                                type="button"
                                onClick={downloadSample}
                                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" /> Download Sample
                            </button>
                        </div>

                        <div
                            onDrop={onDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                dragOver
                                    ? 'border-zinc-400 bg-zinc-50 dark:bg-zinc-800'
                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={e => handleFile(e.target.files[0])}
                                className="hidden"
                            />
                            {data.file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{data.file.name}</p>
                                    <p className="text-xs text-zinc-400">{(data.file.size / 1024).toFixed(1)} KB — click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-zinc-300" />
                                    <p className="text-sm text-zinc-500">Drag & drop your CSV here, or <span className="text-zinc-700 dark:text-zinc-300 underline">browse</span></p>
                                    <p className="text-xs text-zinc-400">Max file size: 10MB</p>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}

                        {/* Upload Progress */}
                        {progress && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Uploading...</span>
                                    <span>{progress.percentage}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                                    <div
                                        className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full transition-all"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CSV Preview */}
                    {preview && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Preview (first 5 rows)</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                                        {preview[0]?.map((h, i) => (
                                            <th key={i} className="text-left px-4 py-2 text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {preview.slice(1).map((row, i) => (
                                        <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                                            {row.map((cell, j) => (
                                                <td key={j} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{cell || '—'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Lists */}
                    {lists.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Add to Lists <span className="text-zinc-400 font-normal normal-case text-xs">(optional)</span></h2>
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
                            disabled={processing || !data.file}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            {processing ? 'Importing...' : 'Import Contacts'}
                        </button>
                        <Link
                            href="/admin/contacts"
                            className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Import;
