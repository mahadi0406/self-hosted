<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignAnalytic;
use App\Models\AiLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function campaigns(Request $request): Response
    {
        $query = CampaignAnalytic::with('campaign.channel');

        if ($request->filled('search')) {
            $query->whereHas('campaign', fn($q) =>
            $q->where('name', 'like', "%{$request->search}%")
            );
        }

        if ($request->filled('channel_type') && $request->channel_type !== 'all') {
            $query->whereHas('campaign.channel', fn($q) =>
            $q->where('type', $request->channel_type)
            );
        }

        if ($request->filled('date_from')) {
            $query->whereDate('recorded_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('recorded_at', '<=', $request->date_to);
        }

        $analytics = $query->latest('recorded_at')->paginate(15)->withQueryString()
            ->through(fn($a) => [
                'id'               => $a->id,
                'campaign_id'      => $a->campaign_id,
                'campaign_name'    => $a->campaign->name,
                'channel_type'     => $a->campaign->channel->type,
                'channel_name'     => $a->campaign->channel->name,
                'sent'             => $a->sent,
                'delivered'        => $a->delivered,
                'read'             => $a->read,
                'replied'          => $a->replied,
                'failed'           => $a->failed,
                'opted_out'        => $a->opted_out,
                'delivery_rate'    => $a->sent > 0 ? round(($a->delivered / $a->sent) * 100, 1) : 0,
                'read_rate'        => $a->delivered > 0 ? round(($a->read / $a->delivered) * 100, 1) : 0,
                'reply_rate'       => $a->delivered > 0 ? round(($a->replied / $a->delivered) * 100, 1) : 0,
                'ai_recommendations' => $a->ai_recommendations,
                'recorded_at'      => $a->recorded_at->format('Y-m-d H:i'),
            ]);

        // Overall stats
        $totals = CampaignAnalytic::selectRaw('
            SUM(sent) as total_sent,
            SUM(delivered) as total_delivered,
            SUM(`read`) as total_read,
            SUM(`replied`) as total_replied,
            SUM(failed) as total_failed
        ')->first();

        $stats = [
            'total_campaigns' => Campaign::count(),
            'total_sent'      => $totals->total_sent ?? 0,
            'avg_delivery'    => $totals->total_sent > 0
                ? round(($totals->total_delivered / $totals->total_sent) * 100, 1) : 0,
            'avg_read'        => $totals->total_delivered > 0
                ? round(($totals->total_read / $totals->total_delivered) * 100, 1) : 0,
        ];

        return Inertia::render('Admin/Analytics/Campaigns', [
            'analytics' => $analytics,
            'stats'     => $stats,
            'filters'   => $request->only(['search', 'channel_type', 'date_from', 'date_to']),
        ]);
    }

    public function aiLogs(Request $request): Response
    {
        $query = AiLog::query();

        if ($request->filled('search')) {
            $query->where('prompt', 'like', "%{$request->search}%");
        }

        if ($request->filled('feature') && $request->feature !== 'all') {
            $query->where('feature', $request->feature);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('success', $request->status === 'success');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate(20)->withQueryString()
            ->through(fn($l) => [
                'id'            => $l->id,
                'feature'       => $l->feature,
                'model'         => $l->model,
                'prompt'        => $l->prompt,
                'response'      => $l->response,
                'input_tokens'  => $l->input_tokens,
                'output_tokens' => $l->output_tokens,
                'total_tokens'  => $l->input_tokens + $l->output_tokens,
                'success'       => $l->success,
                'error_message' => $l->error_message,
                'created_at'    => $l->created_at->format('Y-m-d H:i'),
            ]);

        $totals = AiLog::selectRaw('
            COUNT(*) as total_calls,
            SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
            SUM(input_tokens + output_tokens) as total_tokens,
            COUNT(DISTINCT feature) as features_used
        ')->first();

        $stats = [
            'total_calls'   => $totals->total_calls   ?? 0,
            'successful'    => $totals->successful     ?? 0,
            'total_tokens'  => $totals->total_tokens   ?? 0,
            'features_used' => $totals->features_used  ?? 0,
        ];

        $featureCounts = AiLog::selectRaw('feature, COUNT(*) as count')
            ->groupBy('feature')
            ->pluck('count', 'feature');

        return Inertia::render('Admin/Analytics/AiLogs', [
            'logs'           => $logs,
            'stats'          => $stats,
            'feature_counts' => $featureCounts,
            'filters'        => $request->only(['search', 'feature', 'status', 'date_from', 'date_to']),
        ]);
    }
}
