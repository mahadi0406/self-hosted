<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use App\Models\Channel;
use App\Models\ContactList;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Campaign::with('channel');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('channel_id') && $request->channel_id !== 'all') {
            $query->where('channel_id', $request->channel_id);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $campaigns = $query->latest()->paginate(15)->withQueryString()
            ->through(fn($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'channel_name'     => $c->channel->name,
                'channel_type'     => $c->channel->type,
                'type'             => $c->type,
                'status'           => $c->status,
                'total_recipients' => $c->total_recipients,
                'scheduled_at'     => $c->scheduled_at?->format('Y-m-d H:i'),
                'started_at'       => $c->started_at?->format('Y-m-d H:i'),
                'completed_at'     => $c->completed_at?->format('Y-m-d H:i'),
                'ai_goal'          => $c->ai_goal,
                'created_at'       => $c->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'     => Campaign::count(),
            'running'   => Campaign::where('status', 'running')->count(),
            'completed' => Campaign::where('status', 'completed')->count(),
            'scheduled' => Campaign::where('status', 'scheduled')->count(),
        ];

        $channels = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();
        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns,
            'stats'     => $stats,
            'channels'  => $channels,
            'filters'   => $request->only(['search', 'status', 'channel_id', 'type']),
        ]);
    }

    public function create(): Response
    {
        $channels      = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();
        $contactLists  = ContactList::select('id', 'name', 'contacts_count')->get();
        $templates     = Template::where('status', 'approved')->select('id', 'name', 'channel', 'body')->get();

        return Inertia::render('Admin/Campaigns/Create', [
            'channels'     => $channels,
            'contactLists' => $contactLists,
            'templates'    => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'channel_id'        => 'required|exists:channels,id',
            'template_id'       => 'nullable|exists:templates,id',
            'type'              => 'required|in:instant,scheduled',
            'content'           => 'required|array',
            'content.body'      => 'required|string',
            'audience'          => 'required|array',
            'audience.list_ids' => 'required|array|min:1',
            'scheduled_at'      => 'nullable|required_if:type,scheduled|date|after:now',
            'ai_goal'           => 'nullable|string|max:500',
        ]);

        $listIds = $request->input('audience.list_ids');

        try {
           DB::transaction(function () use ($validated, $listIds) {
                $totalRecipients = ContactList::whereIn('id', $listIds)
                    ->sum('contacts_count');

                $campaign = Campaign::create([
                    'name'             => $validated['name'],
                    'channel_id'       => $validated['channel_id'],
                    'template_id'      => $validated['template_id'] ?? null,
                    'type'             => $validated['type'],
                    'content'          => $validated['content'],
                    'audience'         => $validated['audience'],
                    'status'           => $validated['type'] === 'scheduled' ? 'scheduled' : 'running',
                    'scheduled_at'     => $validated['scheduled_at'] ?? null,
                    'ai_goal'          => $validated['ai_goal'] ?? null,
                    'total_recipients' => $totalRecipients,
                ]);

                if ($validated['type'] === 'instant') {
                    SendCampaignJob::dispatch($campaign);
                }

                return $campaign;
           });

           return redirect()->route('admin.campaigns.index')->with('success', 'Campaign created successfully.');

        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create campaign. Please try again.');
        }
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        $campaign->delete();
        return redirect()->back()->with('success', 'Campaign deleted successfully.');
    }
}
