<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiLog;
use App\Models\Setting;
use App\Models\Channel;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AiCampaignPlannerController extends Controller
{
    public function index(): Response
    {
        $recentLogs = AiLog::where('feature', 'campaign_planner')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'prompt' => $l->prompt,
                'response' => $l->response,
                'input_tokens' => $l->input_tokens,
                'output_tokens' => $l->output_tokens,
                'success' => $l->success,
                'created_at' => $l->created_at->format('Y-m-d H:i'),
            ]);

        $channels = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();
        $contactLists = ContactList::select('id', 'name', 'contacts_count')->get();

        return Inertia::render('Admin/AI/CampaignPlanner', [
            'recent_logs' => $recentLogs,
            'channels' => $channels,
            'contact_lists' => $contactLists,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        try {
            set_time_limit(90);
            $validated = $request->validate([
                'business_type' => 'required|string|max:100',
                'goal' => 'required|string|max:500',
                'channel' => 'required|in:whatsapp,telegram',
                'duration_days' => 'required|integer|min:1|max:90',
                'audience_size' => 'required|integer|min:1',
                'tone' => 'required|in:friendly,professional,urgent,casual,formal',
                'language' => 'required|string|max:10',
                'campaign_type' => 'required|in:drip,broadcast,mixed',
            ], [
                'business_type.required' => 'Business type is required.',
                'business_type.max' => 'Business type must be less than 100 characters.',
                'goal.required' => 'Campaign goal is required.',
                'goal.max' => 'Goal must be less than 500 characters.',
                'channel.required' => 'Please select a channel.',
                'channel.in' => 'Please select a valid channel (WhatsApp or Telegram).',
                'duration_days.required' => 'Campaign duration is required.',
                'duration_days.min' => 'Duration must be at least 1 day.',
                'duration_days.max' => 'Duration cannot exceed 90 days.',
                'audience_size.required' => 'Audience size is required.',
                'audience_size.min' => 'Audience size must be at least 1.',
                'tone.required' => 'Please select a tone.',
                'tone.in' => 'Please select a valid tone.',
                'language.required' => 'Please select a language.',
                'campaign_type.required' => 'Please select a campaign type.',
                'campaign_type.in' => 'Please select a valid campaign type.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        $apiKey = Setting::get('ai_api_key');
        $model = Setting::get('ai_model', 'claude-sonnet-4-20250514');

        if (!$apiKey) {
            return response()->json([
                'error' => 'AI API key not configured. Please check Settings.',
            ], 422);
        }

        $prompt = $this->buildPrompt($validated);

        try {
            $response = Http::timeout(60)
                ->withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model' => $model,
                    'max_tokens' => 2000,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->failed()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? 'API request failed';

                Log::error('AI API Error', [
                    'status' => $response->status(),
                    'body' => $errorBody,
                ]);

                AiLog::create([
                    'feature' => 'campaign_planner',
                    'model' => $model,
                    'prompt' => $prompt,
                    'response' => json_encode($errorBody),
                    'input_tokens' => 0,
                    'output_tokens' => 0,
                    'success' => false,
                    'error_message' => $errorMessage,
                ]);

                $userMessage = match (true) {
                    $response->status() === 401
                    => 'Invalid API key. Please check your Settings.',
                    $response->status() === 429
                    => 'Rate limit exceeded. Please wait a moment and try again.',
                    in_array($response->status(), [500, 502, 503])
                    => 'AI service is temporarily unavailable. Please try again later.',
                    str_contains($errorMessage, 'credit balance')
                    => 'Your Anthropic account has insufficient credits. Please top up at console.anthropic.com.',
                    str_contains($errorMessage, 'model') && $response->status() === 400
                    => 'Invalid AI model configured. Please update the model in Settings.',
                    default
                    => $errorMessage,
                };

                return response()->json(['error' => $userMessage], $response->status());
            }

            $body = $response->json();
            $rawText = $body['content'][0]['text'] ?? '';
            $inputTokens = $body['usage']['input_tokens'] ?? 0;
            $outputTokens = $body['usage']['output_tokens'] ?? 0;

            $plan = $this->parsePlan($rawText);
            AiLog::create([
                'feature' => 'campaign_planner',
                'model' => $model,
                'prompt' => $prompt,
                'response' => $rawText,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'success' => !empty($plan),
            ]);

            if (empty($plan)) {
                Log::info('AI campaign planner returned unexpected format', [
                    'raw_text' => $rawText,
                ]);

                return response()->json([
                    'error' => 'AI returned an unexpected format. Please try again.',
                ], 422);
            }

            $validatedPlan = [
                'campaign_name' => $plan['campaign_name'] ?? 'Untitled Campaign',
                'overview' => $plan['overview'] ?? '',
                'estimated_reach' => $plan['estimated_reach'] ?? $validated['audience_size'],
                'expected_open_rate' => $plan['expected_open_rate'] ?? 70,
                'expected_reply_rate' => $plan['expected_reply_rate'] ?? 15,
                'best_send_times' => $plan['best_send_times'] ?? ['10:00 AM', '6:00 PM'],
                'steps' => array_map(function ($step) {
                    return [
                        'day' => $step['day'] ?? 1,
                        'step' => $step['step'] ?? 1,
                        'title' => $step['title'] ?? 'Step',
                        'type' => $step['type'] ?? 'broadcast',
                        'message' => $step['message'] ?? '',
                        'send_time' => $step['send_time'] ?? '10:00 AM',
                        'objective' => $step['objective'] ?? '',
                    ];
                }, $plan['steps'] ?? []),
                'tips' => $plan['tips'] ?? [],
                'warnings' => $plan['warnings'] ?? [],
            ];

            return response()->json(['plan' => $validatedPlan]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI API Connection Error', ['message' => $e->getMessage()]);

            AiLog::create([
                'feature' => 'campaign_planner',
                'model' => $model,
                'prompt' => $prompt,
                'response' => null,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'success' => false,
                'error_message' => 'Connection timeout: ' . $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Connection to AI service timed out. Please try again.',
            ], 504);

        } catch (\Exception $e) {
            Log::error('AI API Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            AiLog::create([
                'feature' => 'campaign_planner',
                'model' => $model,
                'prompt' => $prompt,
                'response' => null,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'success' => false,
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.',
            ], 500);
        }
    }

    private function parsePlan(string $rawText): ?array
    {
        $text = trim($rawText);

        $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
        $text = preg_replace('/\s*```$/i', '', $text);
        $text = trim($text);

        // Method 1: Direct JSON decode
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Method 2: Extract from markdown code fence anywhere in the text
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        // Method 3: Balanced-brace extraction — handles } inside string values
        $jsonStart = strpos($text, '{');
        if ($jsonStart !== false) {
            $depth = 0;
            $inString = false;
            $escape = false;
            $len = strlen($text);

            for ($i = $jsonStart; $i < $len; $i++) {
                $char = $text[$i];

                if ($escape) {
                    $escape = false;
                    continue;
                }
                if ($char === '\\' && $inString) {
                    $escape = true;
                    continue;
                }
                if ($char === '"') {
                    $inString = !$inString;
                    continue;
                }

                if (!$inString) {
                    if ($char === '{') $depth++;
                    elseif ($char === '}') {
                        $depth--;
                        if ($depth === 0) {
                            $jsonStr = substr($text, $jsonStart, $i - $jsonStart + 1);
                            $decoded = json_decode($jsonStr, true);
                            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                                return $decoded;
                            }
                            break;
                        }
                    }
                }
            }
        }

        return null;
    }

    private function buildPrompt(array $data): string
    {
        $maxSteps = min($data['duration_days'], 5);

        return <<<PROMPT
You are a {$data['channel']} campaign planner.

Business: {$data['business_type']}
Goal: {$data['goal']}
Tone: {$data['tone']}
Language: {$data['language']}

IMPORTANT: Return ONLY valid JSON. No markdown code fences. No extra text.

{
  "campaign_name": "string",
  "overview": "2 sentences max",
  "estimated_reach": {$data['audience_size']},
  "expected_open_rate": 75,
  "expected_reply_rate": 20,
  "best_send_times": ["10:00 AM", "6:00 PM"],
  "steps": [
    {"day": 1, "step": 1, "title": "string", "type": "broadcast", "message": "short message under 200 chars", "send_time": "10:00 AM", "objective": "brief"}
  ],
  "tips": ["tip1", "tip2"],
  "warnings": ["warning1"]
}

Generate exactly {$maxSteps} steps. Keep each message under 200 characters. Keep objectives under 50 characters. Output ONLY the JSON object.
PROMPT;
    }
}
