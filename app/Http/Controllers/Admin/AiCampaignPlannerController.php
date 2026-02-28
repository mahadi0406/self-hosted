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

class AiCampaignPlannerController extends Controller
{
    public function index(): Response
    {
        $recentLogs = AiLog::where('feature', 'campaign_planner')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($l) => [
                'id'            => $l->id,
                'prompt'        => $l->prompt,
                'response'      => $l->response,
                'input_tokens'  => $l->input_tokens,
                'output_tokens' => $l->output_tokens,
                'success'       => $l->success,
                'created_at'    => $l->created_at->format('Y-m-d H:i'),
            ]);

        $channels     = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();
        $contactLists = ContactList::select('id', 'name', 'contacts_count')->get();

        return Inertia::render('Admin/AI/CampaignPlanner', [
            'recent_logs'   => $recentLogs,
            'channels'      => $channels,
            'contact_lists' => $contactLists,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'business_type'   => 'required|string|max:100',
            'goal'            => 'required|string|max:500',
            'channel'         => 'required|in:whatsapp,telegram',
            'duration_days'   => 'required|integer|min:1|max:90',
            'audience_size'   => 'required|integer|min:1',
            'tone'            => 'required|in:friendly,professional,urgent,casual,formal',
            'language'        => 'required|string|max:10',
            'campaign_type'   => 'required|in:drip,broadcast,mixed',
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
            ])->timeout(60)->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model,
                'max_tokens' => 2000,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            $body         = $response->json();
            $rawText      = $body['content'][0]['text'] ?? '';
            $inputTokens  = $body['usage']['input_tokens']  ?? 0;
            $outputTokens = $body['usage']['output_tokens'] ?? 0;

            // Extract JSON
            $jsonStart = strpos($rawText, '{');
            $jsonEnd   = strrpos($rawText, '}');
            $plan      = null;

            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonStr = substr($rawText, $jsonStart, $jsonEnd - $jsonStart + 1);
                $plan    = json_decode($jsonStr, true);
            }

            AiLog::create([
                'feature'       => 'campaign_planner',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => $rawText,
                'input_tokens'  => $inputTokens,
                'output_tokens' => $outputTokens,
                'success'       => !empty($plan),
            ]);

            if (empty($plan)) {
                return response()->json(['error' => 'AI returned unexpected format. Try again.'], 422);
            }

            return response()->json(['plan' => $plan]);

        } catch (\Exception $e) {
            AiLog::create([
                'feature'       => 'campaign_planner',
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
        return <<<PROMPT
You are an expert {$data['channel']} marketing campaign planner.

Create a complete {$data['campaign_type']} campaign plan for:
- Business: {$data['business_type']}
- Goal: {$data['goal']}
- Duration: {$data['duration_days']} days
- Audience size: {$data['audience_size']} contacts
- Tone: {$data['tone']}
- Language: {$data['language']}
- Channel: {$data['channel']}

Return ONLY a valid JSON object (no extra text) with this structure:
{
  "campaign_name": "string",
  "overview": "string (2-3 sentence summary)",
  "estimated_reach": number,
  "expected_open_rate": number (percentage),
  "expected_reply_rate": number (percentage),
  "best_send_times": ["string", "string"],
  "steps": [
    {
      "day": number,
      "step": number,
      "title": "string",
      "type": "broadcast|follow_up|reminder|engagement",
      "message": "string (full message text)",
      "send_time": "string e.g. 10:00 AM",
      "objective": "string"
    }
  ],
  "tips": ["string", "string", "string"],
  "warnings": ["string"]
}

Generate {$data['duration_days']} days worth of steps. Keep messages under 500 chars each and platform-appropriate.
PROMPT;
    }
}
