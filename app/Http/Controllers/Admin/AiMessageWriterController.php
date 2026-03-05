<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiLog;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AiMessageWriterController extends Controller
{
    public function index(): Response
    {
        $recentLogs = AiLog::where('feature', 'message_writer')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($l) => [
                'id'           => $l->id,
                'prompt'       => $l->prompt,
                'response'     => $l->response,
                'input_tokens' => $l->input_tokens,
                'output_tokens'=> $l->output_tokens,
                'success'      => $l->success,
                'created_at'   => $l->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/AI/MessageWriter', [
            'recent_logs' => $recentLogs,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'business_type' => 'required|string|max:100',
                'goal'          => 'required|string|max:300',
                'tone'          => 'required|in:friendly,professional,urgent,casual,formal',
                'channel'       => 'required|in:whatsapp,telegram',
                'language'      => 'required|string|max:10',
                'include_emoji' => 'boolean',
                'include_cta'   => 'boolean',
            ], [
                'business_type.required' => 'Business type is required.',
                'business_type.max'      => 'Business type must be less than 100 characters.',
                'goal.required'          => 'Goal is required.',
                'goal.max'               => 'Goal must be less than 300 characters.',
                'tone.required'          => 'Please select a tone.',
                'tone.in'                => 'Please select a valid tone.',
                'channel.required'       => 'Please select a channel.',
                'channel.in'             => 'Please select a valid channel (WhatsApp or Telegram).',
                'language.required'      => 'Please select a language.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        $apiKey = Setting::get('ai_api_key');
        $model  = Setting::get('ai_model', 'claude-sonnet-4-6');
        Log::info('---------- AI API Request -----------------', [$apiKey]);

        if (!$apiKey) {
            return response()->json([
                'error' => 'AI API key not configured. Please check Settings.',
            ], 422);
        }

        $prompt = $this->buildPrompt($validated);

        try {
            $response = Http::timeout(60)
                ->withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $model,
                    'max_tokens' => 1000,
                    'messages'   => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->failed()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? 'API request failed';

                Log::error('AI API Error', [
                    'status' => $response->status(),
                    'body'   => $errorBody,
                ]);

                AiLog::create([
                    'feature'       => 'message_writer',
                    'model'         => $model,
                    'prompt'        => $prompt,
                    'response'      => json_encode($errorBody),
                    'input_tokens'  => 0,
                    'output_tokens' => 0,
                    'success'       => false,
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

            $body         = $response->json();
            $rawText      = $body['content'][0]['text'] ?? '';
            $inputTokens  = $body['usage']['input_tokens'] ?? 0;
            $outputTokens = $body['usage']['output_tokens'] ?? 0;

            // Parse JSON from response - handle various AI response formats
            $variants = $this->parseVariants($rawText);

            // Log the AI call
            AiLog::create([
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => $rawText,
                'input_tokens'  => $inputTokens,
                'output_tokens' => $outputTokens,
                'success'       => count($variants) > 0,
            ]);

            if (empty($variants)) {
                Log::info('AI returned unexpected format', [
                    'raw_text' => $rawText,
                ]);

                return response()->json([
                    'error' => 'AI returned an unexpected format. Please try again.',
                ], 422);
            }

            // Validate variant structure
            $validatedVariants = array_map(function ($v) {
                return [
                    'variant'          => $v['variant'] ?? 0,
                    'label'            => $v['label'] ?? 'Variant',
                    'body'             => $v['body'] ?? '',
                    'compliance_score' => $v['compliance_score'] ?? 85,
                    'character_count'  => $v['character_count'] ?? strlen($v['body'] ?? ''),
                ];
            }, $variants);

            return response()->json(['variants' => $validatedVariants]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI API Connection Error', ['message' => $e->getMessage()]);

            AiLog::create([
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => null,
                'input_tokens'  => 0,
                'output_tokens' => 0,
                'success'       => false,
                'error_message' => 'Connection timeout: ' . $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Connection to AI service timed out. Please try again.',
            ], 504);

        } catch (\Exception $e) {
            Log::error('AI API Exception', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            AiLog::create([
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => null,
                'input_tokens'  => 0,
                'output_tokens' => 0,
                'success'       => false,
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again.',
            ], 500);
        }
    }

    private function parseVariants(string $rawText): array
    {
        $text = trim($rawText);

        // Method 1: Direct JSON decode (clean response)
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Method 2: Extract from markdown code fence anywhere in the text
        // Handles preamble like "Here are 3 variants:\n```json\n[...]\n```"
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        // Method 3: Balanced-bracket extraction — correctly handles ] inside string values
        $jsonStart = strpos($text, '[');
        if ($jsonStart !== false) {
            $depth    = 0;
            $inString = false;
            $escape   = false;
            $len      = strlen($text);

            for ($i = $jsonStart; $i < $len; $i++) {
                $char = $text[$i];

                if ($escape) { $escape = false; continue; }
                if ($char === '\\' && $inString) { $escape = true; continue; }
                if ($char === '"') { $inString = !$inString; continue; }

                if (!$inString) {
                    if ($char === '[') $depth++;
                    elseif ($char === ']') {
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

        return [];
    }

    private function buildPrompt(array $data): string
    {
        $emojiInstruction = ($data['include_emoji'] ?? false) ? 'Include relevant emojis.' : 'Do not use emojis.';
        $ctaInstruction   = ($data['include_cta'] ?? false)   ? 'Include a clear call-to-action.' : 'No call-to-action needed.';

        return <<<PROMPT
You are an expert marketing message writer for {$data['channel']} campaigns.

Generate exactly 3 message variants for the following:
- Business type: {$data['business_type']}
- Goal: {$data['goal']}
- Tone: {$data['tone']}
- Language: {$data['language']}
- {$emojiInstruction}
- {$ctaInstruction}

Requirements:
- Each message must be under 1000 characters
- Must be suitable for {$data['channel']}
- Be direct and engaging

Return ONLY a JSON array like this (no extra text before or after):
[
  {
    "variant": 1,
    "label": "Direct & Bold",
    "body": "message text here",
    "compliance_score": 95,
    "character_count": 120
  },
  {
    "variant": 2,
    "label": "Warm & Personal",
    "body": "message text here",
    "compliance_score": 98,
    "character_count": 145
  },
  {
    "variant": 3,
    "label": "Urgency Driven",
    "body": "message text here",
    "compliance_score": 88,
    "character_count": 110
  }
]
PROMPT;
    }
}
