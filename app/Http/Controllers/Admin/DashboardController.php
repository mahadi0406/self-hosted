<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignMessage;
use App\Models\Contact;
use App\Models\Channel;
use App\Models\InboxMessage;
use App\Models\AiLog;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $statistics = [
            'total_contacts'     => Contact::count(),
            'active_contacts'    => Contact::where('status', 'active')->count(),
            'total_campaigns'    => Campaign::count(),
            'running_campaigns'  => Campaign::where('status', 'running')->count(),
            'connected_channels' => Channel::where('status', 'connected')->count(),
            'unread_inbox'       => InboxMessage::where('is_read', false)->where('direction', 'inbound')->count(),
        ];

        $campaignStats = [
            'total'     => Campaign::count(),
            'completed' => Campaign::where('status', 'completed')->count(),
            'scheduled' => Campaign::where('status', 'scheduled')->count(),
            'failed'    => Campaign::where('status', 'failed')->count(),
        ];

        $messageStats = [
            'sent'      => CampaignMessage::where('status', 'sent')->count(),
            'delivered' => CampaignMessage::where('status', 'delivered')->count(),
            'read'      => CampaignMessage::where('status', 'read')->count(),
            'failed'    => CampaignMessage::where('status', 'failed')->count(),
        ];

        $aiStats = [
            'total_calls'    => AiLog::count(),
            'successful'     => AiLog::where('success', true)->count(),
            'total_tokens'   => AiLog::sum('input_tokens') + AiLog::sum('output_tokens'),
        ];

        $days = collect(range(29, 0))->map(fn($i) => Carbon::now()->subDays($i)->toDateString());

        $sentByDay = CampaignMessage::selectRaw('DATE(sent_at) as date, COUNT(*) as count')
            ->where('sent_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        $inboundByDay = InboxMessage::selectRaw('DATE(received_at) as date, COUNT(*) as count')
            ->where('direction', 'inbound')
            ->where('received_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->pluck('count', 'date');

        $chartData = $days->map(fn($date) => [
            'date'     => Carbon::parse($date)->format('M d'),
            'sent'     => (int) ($sentByDay[$date] ?? 0),
            'inbound'  => (int) ($inboundByDay[$date] ?? 0),
        ])->values();

        $recentCampaigns = Campaign::with('channel')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'channel_name'     => $c->channel->name,
                'channel_type'     => $c->channel->type,
                'status'           => $c->status,
                'total_recipients' => $c->total_recipients,
                'created_at'       => $c->created_at->format('Y-m-d H:i'),
            ]);

        $recentInbox = InboxMessage::with('contact', 'channel')
            ->where('direction', 'inbound')
            ->latest('received_at')
            ->take(8)
            ->get()
            ->map(fn($m) => [
                'id'           => $m->id,
                'contact_name' => $m->contact->name,
                'channel_type' => $m->channel->type,
                'body'         => $m->body,
                'ai_intent'    => $m->ai_intent,
                'is_read'      => $m->is_read,
                'received_at'  => $m->received_at->format('Y-m-d H:i'),
            ]);

        $recentContacts = Contact::latest()
            ->take(8)
            ->get()
            ->map(fn($c) => [
                'id'     => $c->id,
                'name'   => $c->name,
                'phone'  => $c->phone,
                'status' => $c->status,
                'ai_engagement_label' => $c->ai_engagement_label,
                'created_at' => $c->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'statistics'      => $statistics,
            'campaign_stats'  => $campaignStats,
            'message_stats'   => $messageStats,
            'ai_stats'        => $aiStats,
            'chart_data'      => $chartData,
            'recent_campaigns'=> $recentCampaigns,
            'recent_inbox'    => $recentInbox,
            'recent_contacts' => $recentContacts,
        ]);
    }
}
