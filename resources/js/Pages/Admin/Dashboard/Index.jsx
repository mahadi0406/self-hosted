import React from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "@inertiajs/react";
import { Users, Send, Radio, Inbox, Sparkles, MessageSquare, CheckCircle, XCircle } from "lucide-react";

const Stat = ({ label, value, icon: Icon, trend }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
            {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
        </div>
        <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
        {trend && <div className="mt-1 text-xs text-zinc-400">{trend}</div>}
    </div>
);

const statusColor = (status) => {
    const map = {
        completed:  'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        running:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        scheduled:  'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        active:     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        paused:     'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        failed:     'text-red-600 bg-red-50 dark:bg-red-900/20',
        draft:      'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        opted_out:  'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        blocked:    'text-red-600 bg-red-50 dark:bg-red-900/20',
        hot:        'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
        warm:       'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
        cold:       'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        inquiry:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        complaint:  'text-red-600 bg-red-50 dark:bg-red-900/20',
        purchase:   'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        unsubscribe:'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
        unknown:    'text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
    };
    return map[status] ?? 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800';
};

const Badge = ({ status }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(status)}`}>
        {status?.replace('_', ' ')}
    </span>
);

const ChannelIcon = ({ type }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        type === 'whatsapp' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
    }`}>
        {type === 'whatsapp' ? '📱 WA' : '✈️ TG'}
    </span>
);

const SectionHeader = ({ title, href }) => (
    <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{title}</h2>
        {href && (
            <Link href={href} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                View all →
            </Link>
        )}
    </div>
);

const Table = ({ heads, rows }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {heads.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={heads.length} className="px-4 py-6 text-center text-xs text-zinc-400">No data yet</td>
                </tr>
            ) : rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3">{cell}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-sm text-xs">
            <p className="font-medium text-zinc-600 dark:text-zinc-400 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
            ))}
        </div>
    );
};

const Dashboard = ({
   statistics,
   campaign_stats,
   message_stats,
   ai_stats,
   chart_data,
   recent_campaigns,
   recent_inbox,
   recent_contacts,
}) => {
    return (
        <Layout pageTitle="Dashboard" pageSection="Home">
            <div className="space-y-8 max-w-7xl mx-auto">

                {/* Overview */}
                <section>
                    <SectionHeader title="Overview" />
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <Stat label="Total Contacts"      value={statistics.total_contacts.toLocaleString()}     icon={Users} />
                        <Stat label="Active Contacts"     value={statistics.active_contacts.toLocaleString()}    icon={Users} />
                        <Stat label="Total Campaigns"     value={statistics.total_campaigns.toLocaleString()}    icon={Send} />
                        <Stat label="Running Campaigns"   value={statistics.running_campaigns.toLocaleString()}  icon={Send} />
                        <Stat label="Connected Channels"  value={statistics.connected_channels.toLocaleString()} icon={Radio} />
                        <Stat label="Unread Inbox"        value={statistics.unread_inbox.toLocaleString()}        icon={Inbox} />
                    </div>
                </section>

                {/* Message Stats */}
                <section>
                    <SectionHeader title="Message Delivery" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Stat label="Sent"      value={message_stats.sent.toLocaleString()}      icon={Send} />
                        <Stat label="Delivered" value={message_stats.delivered.toLocaleString()} icon={CheckCircle} />
                        <Stat label="Read"      value={message_stats.read.toLocaleString()}      icon={MessageSquare} />
                        <Stat label="Failed"    value={message_stats.failed.toLocaleString()}    icon={XCircle} />
                    </div>
                </section>

                {/* AI Stats */}
                <section>
                    <SectionHeader title="AI Usage" href="/admin/analytics/ai-logs" />
                    <div className="grid grid-cols-3 gap-4">
                        <Stat label="Total AI Calls"   value={ai_stats.total_calls.toLocaleString()}  icon={Sparkles} />
                        <Stat label="Successful"       value={ai_stats.successful.toLocaleString()}   icon={Sparkles} />
                        <Stat label="Tokens Used"      value={ai_stats.total_tokens.toLocaleString()} icon={Sparkles} />
                    </div>
                </section>

                {/* Chart */}
                {chart_data?.length > 0 && (
                    <section>
                        <SectionHeader title="30-Day Overview" />
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={chart_data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="sent"    name="Sent"    stroke="#10b981" strokeWidth={1.5} dot={false} />
                                    <Line type="monotone" dataKey="inbound" name="Inbound" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex gap-4 mt-3 justify-center">
                                {[['Sent', '#10b981'], ['Inbound', '#3b82f6']].map(([name, color]) => (
                                    <span key={name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <span className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Recent Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Recent Campaigns */}
                    <section>
                        <SectionHeader title="Recent Campaigns" href="/admin/campaigns" />
                        <Table
                            heads={['Campaign', 'Channel', 'Recipients', 'Status']}
                            rows={(recent_campaigns ?? []).map(c => [
                                <div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</div>
                                    <div className="text-xs text-zinc-400">{c.created_at}</div>
                                </div>,
                                <ChannelIcon type={c.channel_type} />,
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">{c.total_recipients.toLocaleString()}</span>,
                                <Badge status={c.status} />,
                            ])}
                        />
                    </section>

                    {/* Recent Inbox */}
                    <section>
                        <SectionHeader title="Recent Inbox" href="/admin/inbox" />
                        <Table
                            heads={['Contact', 'Message', 'Intent', 'Channel']}
                            rows={(recent_inbox ?? []).map(m => [
                                <div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{m.contact_name}</div>
                                    <div className="text-xs text-zinc-400">{m.received_at}</div>
                                </div>,
                                <span className="text-xs text-zinc-500 truncate max-w-[120px] block">{m.body}</span>,
                                m.ai_intent ? <Badge status={m.ai_intent} /> : <span className="text-xs text-zinc-400">—</span>,
                                <ChannelIcon type={m.channel_type} />,
                            ])}
                        />
                    </section>

                    {/* Recent Contacts */}
                    <section>
                        <SectionHeader title="Recent Contacts" href="/admin/contacts" />
                        <Table
                            heads={['Contact', 'Phone', 'Status', 'AI Label']}
                            rows={(recent_contacts ?? []).map(c => [
                                <div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</div>
                                    <div className="text-xs text-zinc-400">{c.created_at}</div>
                                </div>,
                                <span className="text-xs text-zinc-500">{c.phone ?? '—'}</span>,
                                <Badge status={c.status} />,
                                c.ai_engagement_label
                                    ? <Badge status={c.ai_engagement_label} />
                                    : <span className="text-xs text-zinc-400">—</span>,
                            ])}
                        />
                    </section>

                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
