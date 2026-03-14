<?php

namespace App\Console\Commands;

use App\Models\Channel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegisterTelegramWebhooks extends Command
{
    protected $signature   = 'telegram:register-webhooks';
    protected $description = 'Register Telegram webhook URLs for all connected bots';

    public function handle(): void
    {
        Log::info('[TelegramWebhook] Command started', [
            'timestamp' => now()->toIso8601String(),
        ]);

        $channels = Channel::where('type', 'telegram')
            ->where('status', 'connected')
            ->get();

        if ($channels->isEmpty()) {
            $this->info('No connected Telegram channels.');
            Log::warning('[TelegramWebhook] No connected Telegram channels found.');
            return;
        }

        Log::info('[TelegramWebhook] Found channels', ['count' => $channels->count()]);

        $success = 0;
        $failed  = 0;

        foreach ($channels as $channel) {
            if (!$channel->bot_token) {
                Log::warning('[TelegramWebhook] Skipping channel — missing bot_token', [
                    'channel_id'   => $channel->id,
                    'channel_name' => $channel->name,
                ]);
                continue;
            }

            $webhookUrl = config('app.url') . '/webhooks/telegram/' . $channel->id;
            Log::info('[TelegramWebhook] Registering webhook', [
                'channel_id'   => $channel->id,
                'channel_name' => $channel->name,
                'webhook_url'  => $webhookUrl,
                'app_url'      => config('app.url'),
            ]);

            $response = Http::post("https://api.telegram.org/bot{$channel->bot_token}/setWebhook", [
                'url'             => $webhookUrl,
                'allowed_updates' => ['message', 'callback_query'],
            ]);

            if ($response->successful() && $response->json('ok')) {
                $this->info("Webhook registered: {$channel->name} -> {$webhookUrl}");
                Log::info('[TelegramWebhook] Webhook registered successfully', [
                    'channel_id'   => $channel->id,
                    'channel_name' => $channel->name,
                    'webhook_url'  => $webhookUrl,
                ]);
                $success++;
            } else {
                $errorDescription = $response->json('description') ?? 'Unknown error';
                $this->error("Failed: {$channel->name} — {$errorDescription}");
                Log::error('[TelegramWebhook] Failed to register webhook', [
                    'channel_id'   => $channel->id,
                    'channel_name' => $channel->name,
                    'webhook_url'  => $webhookUrl,
                    'http_status'  => $response->status(),
                    'error'        => $errorDescription,
                ]);
                $failed++;
            }
        }

        Log::info('[TelegramWebhook] Command finished', [
            'success' => $success,
            'failed'  => $failed,
        ]);
    }
}
