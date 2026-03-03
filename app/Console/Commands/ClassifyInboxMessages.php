<?php

namespace App\Console\Commands;

use App\Models\InboxMessage;
use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClassifyInboxMessages extends Command
{
    protected $signature   = 'inbox:classify-messages';
    protected $description = 'AI-classify unclassified inbound inbox messages';

    public function handle(): void
    {
        if (!Setting::get('ai_enabled', false)) {
            $this->info('AI disabled. Skipping.');
            return;
        }

        $apiKey = Setting::get('ai_api_key');
        $model  = Setting::get('ai_model', 'claude-sonnet-4-20250514');

        if (!$apiKey) {
            $this->warn('No AI API key set.');
            return;
        }

        $messages = InboxMessage::whereNull('ai_intent')
            ->where('direction', 'inbound')
            ->latest()
            ->limit(50)
            ->get();

        if ($messages->isEmpty()) {
            $this->info('No unclassified messages.');
            return;
        }

        $classified = 0;

        foreach ($messages as $message) {
            try {
                $response = Http::withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $model,
                    'max_tokens' => 300,
                    'messages'   => [[
                        'role'    => 'user',
                        'content' => "Classify this customer message into exactly one: inquiry, complaint, purchase, unsubscribe, spam, unknown.\n\nMessage: \"{$message->body}\"\n\nAlso write a short suggested reply (max 2 sentences).\n\nRespond JSON only: {\"intent\": \"...\", \"suggested_reply\": \"...\"}",
                    ]],
                ]);

                if ($response->successful()) {
                    $text = collect($response->json('content'))->firstWhere('type', 'text')['text'] ?? '';
                    $text = preg_replace('/```json|```/', '', $text);
                    $data = json_decode(trim($text), true);

                    if ($data && isset($data['intent'])) {
                        $message->update([
                            'ai_intent'          => $data['intent'],
                            'ai_suggested_reply' => $data['suggested_reply'] ?? null,
                        ]);
                        $classified++;
                    }
                }

                usleep(200000); // 200ms delay between API calls

            } catch (\Exception $e) {
                Log::error("Inbox classification failed #{$message->id}: " . $e->getMessage());
            }
        }

        $this->info("Classified {$classified}/{$messages->count()} messages.");
    }
}
