import React, { useState } from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Head, usePage } from '@inertiajs/react';
import { Copy, Check, Terminal, Clock } from 'lucide-react';
import { useTranslation } from "@/hooks/useTranslation.jsx";

const CodeBlock = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <pre className="bg-zinc-900 dark:bg-black text-emerald-400 text-sm rounded-lg p-4 pr-12 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">
                {code}
            </pre>
            <button
                onClick={copy}
                className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors"
                title="Copy"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
};

const Section = ({ icon: Icon, title, accent, children }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 ${accent}`}>
            <Icon className="w-4 h-4" />
            <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div className="p-5 space-y-5">{children}</div>
    </div>
);

const Label = ({ children }) => (
    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{children}</p>
);

const Automations = ({ basePath }) => {
    const { t } = useTranslation();
    const appPath = basePath || '/var/www/your-project';

    return (
        <Layout pageTitle={t('automations.title')} pageSection="Settings">
            <Head title="Automations" />

            <div className="max-w-3xl space-y-6">

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Both the <strong className="text-zinc-700 dark:text-zinc-300">Scheduler</strong> (cron) and <strong className="text-zinc-700 dark:text-zinc-300">Queue Worker</strong> must be running for campaigns, drip sequences, and inbox classification to work.
                </p>

                {/* ── CPANEL ── */}
                <Section icon={Clock} title="cPanel Hosting" accent="text-blue-600 dark:text-blue-400">

                    <div>
                        <Label>Step 1 — Cron Job (Scheduler)</Label>
                        <p className="text-xs text-zinc-400 mb-2">Add this in cPanel → Cron Jobs → Set to <strong>Every Minute</strong></p>
                        <CodeBlock code={`* * * * * /usr/local/bin/php ${appPath}/artisan schedule:run >> /dev/null 2>&1`} />
                    </div>

                    <div>
                        <Label>Step 2 — Queue Worker</Label>
                        <p className="text-xs text-zinc-400 mb-2">cPanel does not support persistent processes. Add a second cron to keep the queue running:</p>
                        <CodeBlock code={`* * * * * /usr/local/bin/php ${appPath}/artisan queue:work --stop-when-empty --tries=3 --timeout=60 >> /dev/null 2>&1`} />
                        <p className="text-xs text-zinc-400 mt-2">This starts a short-lived worker every minute that processes all pending jobs then exits. It's the cPanel-compatible approach.</p>
                    </div>

                </Section>

                {/* ── VPS ── */}
                <Section icon={Terminal} title="VPS / Dedicated Server" accent="text-purple-600 dark:text-purple-400">

                    <div>
                        <Label>Step 1 — Cron Job (Scheduler)</Label>
                        <p className="text-xs text-zinc-400 mb-2">Add this via <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">crontab -e</code></p>
                        <CodeBlock code={`* * * * * cd ${appPath} && php artisan schedule:run >> /dev/null 2>&1`} />
                    </div>

                    <div>
                        <Label>Step 2 — Queue Worker via Supervisor</Label>
                        <p className="text-xs text-zinc-400 mb-2">Create <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">/etc/supervisor/conf.d/blastbot-worker.conf</code></p>
                        <CodeBlock code={`[program:blastbot-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${appPath}/artisan queue:work database --sleep=3 --tries=3 --timeout=60
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/blastbot-worker.log
stopwaitsecs=3600`} />
                    </div>

                    <div>
                        <Label>Step 3 — Start Supervisor</Label>
                        <CodeBlock code={`sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start blastbot-worker:*`} />
                    </div>

                    <div>
                        <Label>After Deploying Updates</Label>
                        <CodeBlock code={`php ${appPath}/artisan queue:restart`} />
                    </div>

                </Section>

                {/* ── Scheduled Commands ── */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Scheduled Commands</h3>
                    <div className="space-y-2">
                        {[
                            { cmd: 'campaigns:dispatch-scheduled', freq: 'Every minute',    desc: 'Sends scheduled campaigns' },
                            { cmd: 'drip:dispatch-steps',          freq: 'Every 5 minutes', desc: 'Fires due drip steps' },
                            { cmd: 'inbox:classify-messages',      freq: 'Every 2 minutes', desc: 'AI-classifies inbound messages' },
                            { cmd: 'telegram:register-webhooks',   freq: 'Hourly',          desc: 'Re-registers Telegram webhooks' },
                            { cmd: 'contacts:sync-counts',         freq: 'Daily 03:00',     desc: 'Syncs contact list counts' },
                            { cmd: 'logs:cleanup',                 freq: 'Daily 02:00',     desc: 'Cleans up old AI logs' },
                        ].map(({ cmd, freq, desc }) => (
                            <div key={cmd} className="flex items-center gap-3 text-xs">
                                <code className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded font-mono w-64 shrink-0">{cmd}</code>
                                <span className="text-zinc-400 w-28 shrink-0">{freq}</span>
                                <span className="text-zinc-500">{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Automations;
