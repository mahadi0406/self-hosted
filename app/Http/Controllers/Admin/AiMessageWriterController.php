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
        $request->validate([
            'business_type' => 'required|string|max:100',
            'goal'          => 'required|string|max:300',
            'tone'          => 'required|in:friendly,professional,urgent,casual,formal',
            'channel'       => 'required|in:whatsapp,telegram',
            'language'      => 'required|string|max:10',
            'include_emoji' => 'boolean',
            'include_cta'   => 'boolean',
        ]);

        $apiKey = Setting::get('ai_api_key');
        $model  = Setting::get('ai_model', 'claude-sonnet-4-20250514');

        if (!$apiKey) {
            return response()->json(['error' => 'AI API key not configured. Please check Settings.'], 422);
        }

        $prompt = $this->buildPrompt($request->all());

        try {
            $response = Http::withHeaders([
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

            $body         = $response->json();
            $rawText      = $body['content'][0]['text'] ?? '';
            $inputTokens  = $body['usage']['input_tokens'] ?? 0;
            $outputTokens = $body['usage']['output_tokens'] ?? 0;

            // Parse JSON from response
            $jsonStart = strpos($rawText, '[');
            $jsonEnd   = strrpos($rawText, ']');
            $variants  = [];

            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonStr  = substr($rawText, $jsonStart, $jsonEnd - $jsonStart + 1);
                $variants = json_decode($jsonStr, true) ?? [];
            }

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
                return response()->json(['error' => 'AI returned unexpected format. Try again.'], 422);
            }

            return response()->json(['variants' => $variants]);

        } catch (\Exception $e) {
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

            return response()->json(['error' => 'Failed to reach AI service. Please try again.'], 500);
        }
    }

    private function buildPrompt(array $data): string
    {
        $emojiInstruction = $data['include_emoji'] ? 'Include relevant emojis.' : 'Do not use emojis.';
        $ctaInstruction   = $data['include_cta']   ? 'Include a clear call-to-action.' : 'No call-to-action needed.';

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
