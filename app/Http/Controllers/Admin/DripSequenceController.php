<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DripSequence;
use App\Models\DripStep;
use App\Models\Channel;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class DripSequenceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DripSequence::with('channel');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('channel_id') && $request->channel_id !== 'all') {
            $query->where('channel_id', $request->channel_id);
        }

        $sequences = $query->withCount('enrollments')->latest()->paginate(15)->withQueryString()
            ->through(fn($s) => [
                'id'                 => $s->id,
                'name'               => $s->name,
                'description'        => $s->description,
                'channel_name'       => $s->channel->name,
                'channel_type'       => $s->channel->type,
                'status'             => $s->status,
                'total_steps'        => $s->total_steps,
                'enrollments_count'  => $s->enrollments_count,
                'ai_generated'       => $s->ai_generated,
                'ai_goal'            => $s->ai_goal,
                'created_at'         => $s->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'      => DripSequence::count(),
            'active'     => DripSequence::where('status', 'active')->count(),
            'paused'     => DripSequence::where('status', 'paused')->count(),
            'ai_created' => DripSequence::where('ai_generated', true)->count(),
        ];

        $channels = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();

        return Inertia::render('Admin/DripSequences/Index', [
            'sequences' => $sequences,
            'stats'     => $stats,
            'channels'  => $channels,
            'filters'   => $request->only(['search', 'status', 'channel_id']),
        ]);
    }

    public function create(): Response
    {
        $channels  = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();
        $templates = Template::where('status', 'approved')->select('id', 'name', 'channel', 'body')->get();

        return Inertia::render('Admin/DripSequences/Create', [
            'channels'  => $channels,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'channel_id'       => 'required|exists:channels,id',
            'ai_goal'          => 'nullable|string|max:500',
            'steps'            => 'required|array|min:1',
            'steps.*.name'     => 'required|string|max:255',
            'steps.*.delay_days'  => 'required|integer|min:0',
            'steps.*.delay_hours' => 'required|integer|min:0|max:23',
            'steps.*.body'        => 'required|string',
            'steps.*.template_id' => 'nullable|exists:templates,id',
        ]);

        DB::transaction(function () use ($request) {
            $sequence = DripSequence::create([
                'name'        => $request->name,
                'description' => $request->description,
                'channel_id'  => $request->channel_id,
                'status'      => 'active',
                'ai_generated'=> false,
                'ai_goal'     => $request->ai_goal,
                'total_steps' => count($request->steps),
            ]);

            foreach ($request->steps as $i => $step) {
                DripStep::create([
                    'drip_sequence_id' => $sequence->id,
                    'step_order'       => $i + 1,
                    'name'             => $step['name'],
                    'delay_days'       => $step['delay_days'],
                    'delay_hours'      => $step['delay_hours'],
                    'send_at_time'     => $step['send_at_time'] ?? null,
                    'template_id'      => $step['template_id'] ?? null,
                    'content'          => ['body' => $step['body']],
                ]);
            }
        });

        return redirect()->route('admin.drip-sequences.index')
            ->with('success', 'Drip sequence created successfully.');
    }

    public function destroy(DripSequence $dripSequence): RedirectResponse
    {
        $dripSequence->delete();

        return redirect()->route('admin.drip-sequences.index')
            ->with('success', 'Drip sequence deleted successfully.');
    }
}
