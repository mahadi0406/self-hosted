<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactList;
use App\Models\DripEnrollment;
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

        $paginator   = $query->withCount('enrollments')->latest()->paginate(15)->withQueryString();
        $sequenceIds = $paginator->pluck('id');

        $enrolledBySequence = DB::table('contact_list_contact')
            ->join('drip_enrollments', function ($join) use ($sequenceIds) {
                $join->on('contact_list_contact.contact_id', '=', 'drip_enrollments.contact_id')
                     ->whereIn('drip_enrollments.drip_sequence_id', $sequenceIds);
            })
            ->select('drip_enrollments.drip_sequence_id', 'contact_list_contact.contact_list_id')
            ->distinct()
            ->get()
            ->groupBy('drip_sequence_id')
            ->map(fn($items) => $items->pluck('contact_list_id')->unique()->values()->toArray());

        $sequences = $paginator->through(fn($s) => [
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
            'enrolled_list_ids'  => $enrolledBySequence->get($s->id, []),
        ]);

        $stats = [
            'total'      => DripSequence::count(),
            'active'     => DripSequence::where('status', 'active')->count(),
            'paused'     => DripSequence::where('status', 'paused')->count(),
            'ai_created' => DripSequence::where('ai_generated', true)->count(),
        ];

        $channels = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();

        $lists = ContactList::select('id', 'name', 'contacts_count')->get();

        return Inertia::render('Admin/DripSequences/Index', [
            'sequences' => $sequences,
            'stats'     => $stats,
            'channels'  => $channels,
            'lists'     => $lists,
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

    public function enroll(Request $request, DripSequence $dripSequence): RedirectResponse
    {
        $request->validate([
            'list_ids'   => 'required|array|min:1',
            'list_ids.*' => 'exists:contact_lists,id',
        ]);

        $listIds = array_map('intval', (array) $request->list_ids);
        $contactIds = Contact::whereIn('id', function ($q) use ($listIds) {
            $q->select('contact_id')
                ->from('contact_list_contact')
                ->whereIn('contact_list_id', $listIds);
        })
            ->where('status', 'active')
            ->pluck('id');

        $alreadyEnrolled = DripEnrollment::where('drip_sequence_id', $dripSequence->id)
            ->whereIn('contact_id', $contactIds)
            ->pluck('contact_id')
            ->flip();

        $now      = now();
        $enrolled = 0;

        foreach ($contactIds as $contactId) {
            if ($alreadyEnrolled->has($contactId)) continue;

            DripEnrollment::create([
                'drip_sequence_id' => $dripSequence->id,
                'contact_id'       => $contactId,
                'status'           => 'active',
                'enrolled_at'      => $now,
            ]);
            $enrolled++;
        }

        return redirect()->route('admin.drip-sequences.index')
            ->with('success', "{$enrolled} contact(s) enrolled into \"{$dripSequence->name}\".");
    }

    public function destroy(DripSequence $dripSequence): RedirectResponse
    {
        $dripSequence->delete();

        return redirect()->back()
            ->with('success', 'Drip sequence deleted successfully.');
    }
}
