<?php

namespace App\Jobs;

use App\Models\AiLog;
use App\Models\InboxMessage;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessInboxAiReplyJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 60;

    public function __construct(public InboxMessage $message) {}

    public function handle(): void
    {
        if (! Setting::get('ai_auto_reply_enabled', false)) {
            return;
        }

        $message = $this->message->fresh(['contact', 'channel']);

        if (! $message || $message->direction !== 'inbound' || $message->body === '[media]') {
            return;
        }

        $apiKey  = Setting::get('ai_api_key');
        $model   = Setting::get('ai_model', 'claude-sonnet-4-6');
        $context = Setting::get('ai_auto_reply_context', '');

        if (! $apiKey) {
            Log::warning("AI auto-reply skipped for InboxMessage #{$message->id}: no API key configured.");
            return;
        }

        $channel = $message->channel;
        $contact = $message->contact;
        $history = InboxMessage::where('contact_id', $contact->id)
            ->where('channel_id', $channel->id)
            ->where('id', '!=', $message->id)
            ->latest('received_at')
            ->limit(5)
            ->get()
            ->reverse()
            ->map(fn ($m) => [
                'role'    => $m->direction === 'inbound' ? 'User' : 'Assistant',
                'message' => $m->body,
            ])
            ->values()
            ->toArray();

        $prompt = $this->buildPrompt($message->body, $context, $channel->type, $contact->name ?? 'Customer', $history);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type'      => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model'      => $model,
                    'max_tokens' => 500,
                    'messages'   => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            $rawText      = $response->json('content.0.text', '');
            $inputTokens  = $response->json('usage.input_tokens', 0);
            $outputTokens = $response->json('usage.output_tokens', 0);
            $success      = $response->successful() && $rawText !== '';

            $parsed = $this->parseJson($rawText);
            $intent = $parsed['intent'] ?? 'unknown';
            $reply  = $parsed['reply']  ?? null;

            $validIntents = ['inquiry', 'complaint', 'purchase', 'unsubscribe', 'praise', 'spam', 'unknown'];

            AiLog::create([
                'feature'       => 'inbox_auto_reply',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => $rawText,
                'input_tokens'  => $inputTokens,
                'output_tokens' => $outputTokens,
                'success'       => $success,
                'error_message' => $success ? null : ($response->json('error.message') ?? 'API error'),
            ]);

            $message->update([
                'ai_intent'          => in_array($intent, $validIntents) ? $intent : 'unknown',
                'ai_suggested_reply' => $reply,
            ]);

            // Send reply unless spam or unsubscribe
            if ($reply && ! in_array($intent, ['spam', 'unsubscribe'])) {
                $sent = match ($channel->type) {
                    'telegram' => $this->sendTelegram($channel, $contact, $reply),
                    'whatsapp' => $this->sendWhatsapp($channel, $contact, $reply),
                    default    => false,
                };

                if ($sent) {
                    InboxMessage::create([
                        'contact_id'  => $contact->id,
                        'channel_id'  => $channel->id,
                        'direction'   => 'outbound',
                        'body'        => $reply,
                        'type'        => 'text',
                        'is_read'     => true,
                        'received_at' => now(),
                    ]);

                    Log::info("AI auto-reply sent for InboxMessage #{$message->id} (intent: {$intent})");
                }
            }

        } catch (\Exception $e) {
            Log::error("AI auto-reply failed for InboxMessage #{$message->id}: " . $e->getMessage());

            AiLog::create([
                'feature'       => 'inbox_auto_reply',
                'model'         => $model,
                'prompt'        => $prompt,
                'response'      => null,
                'input_tokens'  => 0,
                'output_tokens' => 0,
                'success'       => false,
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    private function buildPrompt(string $userMessage, string $context, string $channelType, string $contactName, array $history): string
    {
        $historyText = '';
        if (! empty($history)) {
            $historyText = "\n\nConversation history:\n";
            foreach ($history as $h) {
                $historyText .= "{$h['role']}: {$h['message']}\n";
            }
        }

        $businessContext = $context ?: 'You are a helpful customer service assistant.';

        return <<<PROMPT
You are an AI assistant handling customer messages on {$channelType}.

Business context: {$businessContext}
Customer name: {$contactName}{$historyText}

New message from customer: {$userMessage}

Your task:
1. Classify the message intent as exactly one of: inquiry, complaint, purchase, unsubscribe, praise, spam, unknown
2. Write a concise, helpful reply (or set reply to null for spam/unsubscribe)

Rules:
- Keep reply under 300 characters, suitable for {$channelType}
- If intent is "unsubscribe" or "spam", set reply to null
- Reply in the same language as the customer's message
- Be friendly and professional

Return ONLY valid JSON (no extra text):
{"intent": "inquiry", "reply": "Your reply here"}
PROMPT;
    }

    private function parseJson(string $text): array
    {
        $text = trim($text);

        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        if (preg_match('/\{[\s\S]*\}/', $text, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    private function sendTelegram($channel, $contact, string $message): bool
    {
        if (! $contact->telegram_id) return false;

        $botToken = $channel->credentials['bot_token'] ?? $channel->bot_token ?? null;
        if (! $botToken) return false;

        $response = Http::timeout(10)
            ->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $contact->telegram_id,
                'text'    => $message,
            ]);

        return $response->successful() && $response->json('ok');
    }

    private function sendWhatsapp($channel, $contact, string $message): bool
    {
        if (! $contact->phone) return false;

        $credentials = $channel->credentials;
        $token       = $credentials['access_token'] ?? null;
        $phoneId     = $credentials['phone_number_id'] ?? $credentials['phone_id'] ?? null;

        if (! $token || ! $phoneId) return false;

        $phone = preg_replace('/[^0-9]/', '', $contact->phone);

        $response = Http::withToken($token)
            ->timeout(10)
            ->post("https://graph.facebook.com/v19.0/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type'    => 'individual',
                'to'                => $phone,
                'type'              => 'text',
                'text'              => ['body' => $message],
            ]);

        return $response->successful() && isset($response->json()['messages']);
    }
}
