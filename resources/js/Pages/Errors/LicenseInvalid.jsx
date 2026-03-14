import React from 'react';
import { ShieldX, ExternalLink, Mail } from 'lucide-react';

export default function LicenseInvalid({ purchase_code, licensed_domain, support_url }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center shadow-sm">

                    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
                        <ShieldX className="w-8 h-8 text-red-500" />
                    </div>

                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        License Invalid
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                        Your license could not be verified. This may be due to an invalid purchase
                        code, domain mismatch, or the license being deactivated.
                    </p>

                    {(purchase_code || licensed_domain) && (
                        <div className="text-left bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mb-6 space-y-2">
                            {purchase_code && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400">Purchase Code</span>
                                    <span className="font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">
                                        {purchase_code}
                                    </span>
                                </div>
                            )}
                            {licensed_domain && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400">Licensed Domain</span>
                                    <span className="font-mono text-zinc-600 dark:text-zinc-300">{licensed_domain}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <a
                            href={support_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Contact Support
                        </a>
                        <a
                            href="mailto:support@kloudinnovation.com"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
