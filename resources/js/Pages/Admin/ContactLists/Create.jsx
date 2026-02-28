import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft, List } from "lucide-react";

const Field = ({ label, description, error, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">{label}</label>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const Create = () => {
    const { data, setData, post, processing, errors } = useForm({
        name:        '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/contact-lists');
    };

    return (
        <Layout pageTitle="Create Contact List" pageSection="Contacts">
            <Head title="Create Contact List" />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/contact-lists"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <List className="w-5 h-5 text-zinc-500" />
                        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Create Contact List</h1>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-5">List Details</h2>
                    <form onSubmit={submit} className="space-y-5">

                        <Field label="List Name" description="A clear name for this contact group" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. VIP Customers, Newsletter Subscribers"
                                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                            />
                        </Field>

                        <Field label="Description" description="Optional notes about who is in this list" error={errors.description}>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="e.g. Customers who purchased more than $100..."
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 resize-none"
                            />
                        </Field>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium transition-colors"
                            >
                                <List className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create List'}
                            </button>
                            <Link
                                href="/admin/contact-lists"
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

export default Create;
