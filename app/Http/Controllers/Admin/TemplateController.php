<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Template::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('body', 'like', "%{$request->search}%");
        }

        if ($request->filled('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        $templates = $query->latest()->paginate(15)->withQueryString()
            ->through(fn($t) => [
                'id'                  => $t->id,
                'name'                => $t->name,
                'channel'             => $t->channel,
                'language'            => $t->language,
                'body'                => $t->body,
                'header'              => $t->header,
                'footer'              => $t->footer,
                'buttons'             => $t->buttons,
                'source'              => $t->source,
                'ai_tone'             => $t->ai_tone,
                'ai_compliance_score' => $t->ai_compliance_score,
                'status'              => $t->status,
                'rejection_reason'    => $t->rejection_reason,
                'usage_count'         => $t->usage_count,
                'created_at'          => $t->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'        => Template::count(),
            'approved'     => Template::where('status', 'approved')->count(),
            'draft'        => Template::where('status', 'draft')->count(),
            'ai_generated' => Template::where('source', 'ai_generated')->count(),
        ];

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates,
            'stats'     => $stats,
            'filters'   => $request->only(['search', 'channel', 'status', 'source']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Templates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'channel'  => 'required|in:whatsapp,telegram',
            'language' => 'required|string|max:10',
            'body'     => 'required|string',
            'header'   => 'nullable|string',
            'footer'   => 'nullable|string',
            'buttons'  => 'nullable|array',
            'ai_tone'  => 'nullable|string',
        ]);

        Template::create([
            'name'     => $request->name,
            'channel'  => $request->channel,
            'language' => $request->language,
            'body'     => $request->body,
            'header'   => $request->header,
            'footer'   => $request->footer,
            'buttons'  => $request->buttons ?? [],
            'source'   => 'manual',
            'status'   => 'draft',
        ]);

        return redirect()->route('admin.templates.index')
            ->with('success', 'Template created successfully.');
    }

    public function destroy(Template $template): RedirectResponse
    {
        $template->delete();

        return redirect()->route('admin.templates.index')
            ->with('success', 'Template deleted successfully.');
    }
}
