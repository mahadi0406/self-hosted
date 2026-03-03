<?php

namespace App\Console\Commands;

use App\Models\Channel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class RegisterTelegramWebhooks extends Command
{
    protected $signature   = 'telegram:register-webhooks';
    protected $description = 'Register Telegram webhook URLs for all connected bots';

    public function handle(): void
    {
        $channels = Channel::where('type', 'telegram')
            ->where('status', 'connected')
            ->get();

        if ($channels->isEmpty()) {
            $this->info('No connected Telegram channels.');
            return;
        }

        foreach ($channels as $channel) {
            if (!$channel->bot_token) continue;

            $webhookUrl = config('app.url') . '/webhooks/telegram/' . $channel->id;

            $response = Http::post("https://api.telegram.org/bot{$channel->bot_token}/setWebhook", [
                'url'             => $webhookUrl,
                'allowed_updates' => ['message', 'callback_query'],
            ]);

            if ($response->successful() && $response->json('ok')) {
                $this->info("Webhook registered: {$channel->name} -> {$webhookUrl}");
            } else {
                $this->error("Failed: {$channel->name} — " . ($response->json('description') ?? 'error'));
            }
        }
    }
}
