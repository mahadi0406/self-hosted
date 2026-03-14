<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\DripStep;
use App\Models\Setting;
use App\Models\Template;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

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
            'pending'      => Template::where('status', 'pending')->count(),
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
            'status'   => $request->channel === 'telegram' ? 'approved' : 'draft',
        ]);

        return redirect()->route('admin.templates.index')->with('success', 'Template created successfully.');
    }

    public function destroy(Template $template): RedirectResponse
    {
        // Null out template references — both columns are nullable in schema
        $template->campaigns()->update(['template_id' => null]);
        DripStep::where('template_id', $template->id)->update(['template_id' => null]);

        $template->delete();

        return redirect()->back();
    }

    public function submit(Request $request, Template $template): JsonResponse
    {
        if ($template->channel !== 'whatsapp') {
            $template->update(['status' => 'approved']);
            return response()->json(['message' => 'Template approved.', 'status' => 'approved']);
        }

        $channel     = Channel::where('type', 'whatsapp')->first();
        $credentials = $channel?->credentials ?? [];
        $token       = $credentials['access_token'] ?? null;
        $wabaId      = $credentials['waba_id'] ?? null;

        if (!$token || !$wabaId) {
            return response()->json(['error' => 'WhatsApp credentials missing. Check Settings.'], 422);
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

        Log::info('Template payload: ' . json_encode($payload));

        $apiVersion = Setting::get('whatsapp_api_version', 'v19.0');
        $response = Http::withToken($token)
            ->post("https://graph.facebook.com/{$apiVersion}/{$wabaId}/message_templates", $payload);

        Log::info('Template submit response: ' . $response->body());

        if ($response->successful() && $response->json('id')) {
            $waStatus    = strtoupper($response->json('status') ?? 'PENDING');
            $localStatus = match ($waStatus) {
                'APPROVED'          => 'approved',
                'REJECTED'          => 'rejected',
                default             => 'pending',
            };

            $template->update([
                'status'               => $localStatus,
                'whatsapp_template_id' => $response->json('id'),
                'rejection_reason'     => $waStatus === 'REJECTED'
                    ? ($response->json('rejection_reason') ?? 'Rejected by WhatsApp. Please review content and resubmit.')
                    : null,
            ]);

            $message = match ($localStatus) {
                'approved' => 'Template approved by WhatsApp!',
                'rejected' => 'Template rejected by WhatsApp. See rejection reason and resubmit.',
                default    => 'Template submitted for review. WhatsApp will review it shortly.',
            };

            return response()->json(['message' => $message, 'status' => $localStatus]);
        }

        $errorMessage = $response->json('error.message') ?? 'Unknown error from WhatsApp API.';
        $template->update([
            'status'           => 'rejected',
            'rejection_reason' => $errorMessage,
        ]);

        return response()->json(['error' => "Submission failed: {$errorMessage}"], 422);
    }


    public function syncStatus(Template $template): JsonResponse
    {
        if ($template->channel !== 'whatsapp') {
            return response()->json(['error' => 'Only applicable to WhatsApp templates.'], 400);
        }

        if (!$template->whatsapp_template_id) {
            return response()->json(['error' => 'Template has not been submitted to WhatsApp yet.'], 400);
        }

        $channel     = Channel::where('type', 'whatsapp')->first();
        $credentials = $channel?->credentials ?? [];
        $token       = $credentials['access_token'] ?? null;
        $wabaId      = $credentials['waba_id'] ?? null;

        if (!$token || !$wabaId) {
            return response()->json(['error' => 'WhatsApp credentials missing.'], 422);
        }

        $templateName = strtolower(str_replace([' ', '-'], '_', $template->name));

        $apiVersion = Setting::get('whatsapp_api_version', 'v19.0');
        $response = Http::withToken($token)
            ->get("https://graph.facebook.com/{$apiVersion}/{$wabaId}/message_templates", [
                'name'   => $templateName,
                'fields' => 'id,status,rejection_reason',
            ]);

        Log::info("Template sync status response for #{$template->id}: " . $response->body());

        if ($response->successful()) {
            $data = $response->json('data') ?? [];
            $waTemplate = collect($data)->firstWhere('id', $template->whatsapp_template_id)
                ?? ($data[0] ?? null);

            if ($waTemplate) {
                $waStatus    = strtoupper($waTemplate['status'] ?? 'PENDING');
                $localStatus = match ($waStatus) {
                    'APPROVED' => 'approved',
                    'REJECTED' => 'rejected',
                    default    => 'pending',
                };

                $template->update([
                    'status'           => $localStatus,
                    'rejection_reason' => $waStatus === 'REJECTED'
                        ? ($waTemplate['rejection_reason'] ?? 'Rejected by WhatsApp.')
                        : null,
                ]);

                return response()->json([
                    'message' => "Status synced: {$waStatus}",
                    'status'  => $localStatus,
                ]);
            }
        }

        return response()->json(['error' => 'Could not fetch template status from WhatsApp.'], 422);
    }
}
