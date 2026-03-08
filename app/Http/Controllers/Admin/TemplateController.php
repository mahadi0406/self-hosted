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


    public function submit(Template $template): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($template->channel !== 'whatsapp') {
            $template->update(['status' => 'approved']);
            return redirect()->back()->with('success', 'Template approved.');
        }

        $channel     = \App\Models\Channel::where('type', 'whatsapp')->first();
        $credentials = $channel->credentials;
        $token       = $credentials['access_token'] ?? null;
        $wabaId      = $credentials['waba_id'] ?? null;

        if (!$token || !$wabaId) {
            return redirect()->back()->with('error', 'WhatsApp credentials missing.');
        }

        $components = [];

        if ($template->header) {
            $cleanHeader = preg_replace('/[\x{1F000}-\x{1FFFF}|\x{2600}-\x{27FF}|\x{FE00}-\x{FEFF}|\x{1F900}-\x{1F9FF}|\x{1FA00}-\x{1FA9F}]/u', '', $template->header);
            $cleanHeader = preg_replace('/[\n\r\*\_\~]/u', '', $cleanHeader);
            $cleanHeader = trim($cleanHeader);

            if ($cleanHeader) {
                $components[] = [
                    'type'   => 'HEADER',
                    'format' => 'TEXT',
                    'text'   => $cleanHeader,
                ];
            }
        }

        $components[] = [
            'type' => 'BODY',
            'text' => $template->body,
        ];

        if ($template->footer) {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $template->footer,
            ];
        }

        if (!empty($template->buttons)) {
            $formattedButtons = collect($template->buttons)
                ->map(function ($button) {
                    $type = strtoupper($button['type'] ?? '');

                    return match ($type) {
                        'QUICK_REPLY' => [
                            'type' => 'QUICK_REPLY',
                            'text' => $button['text'],
                        ],
                        'URL' => [
                            'type' => 'URL',
                            'text' => $button['text'],
                            'url'  => $button['url'],
                        ],
                        'PHONE_NUMBER' => [
                            'type'         => 'PHONE_NUMBER',
                            'text'         => $button['text'],
                            'phone_number' => $button['phone_number'],
                        ],
                        default => null,
                    };
                })
                ->filter()
                ->values()
                ->toArray();

            if (!empty($formattedButtons)) {
                $components[] = [
                    'type'    => 'BUTTONS',
                    'buttons' => $formattedButtons,
                ];
            }
        }


        $payload = [
            'name'       => strtolower(str_replace([' ', '-'], '_', $template->name)),
            'language'   => $template->language,
            'category'   => 'MARKETING',
            'components' => $components,
        ];

        \Illuminate\Support\Facades\Log::info('Template payload: ' . json_encode($payload));

        $response = \Illuminate\Support\Facades\Http::withToken($token)
            ->post("https://graph.facebook.com/v19.0/{$wabaId}/message_templates", $payload);

        \Illuminate\Support\Facades\Log::info('Template submit response: ' . $response->body());

        if ($response->successful() && $response->json('id')) {
            $template->update([
                'status'               => 'approved',
                'whatsapp_template_id' => $response->json('id'),
            ]);

            return redirect()->back()->with('success', 'Template submitted to WhatsApp successfully.');
        }

        $errorMessage = $response->json('error.message') ?? 'Unknown error';
        $template->update([
            'status'           => 'rejected',
            'rejection_reason' => $errorMessage,
        ]);

        return redirect()->back()->with('error', "Submission failed: {$errorMessage}");
    }
}
