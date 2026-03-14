<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CampaignAnalytic;
use App\Models\Contact;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;
    public int $timeout = 3600;

    public function __construct(public Campaign $campaign)
    {
        $this->tries = (int) Setting::get('campaign_retry_limit', 3);
    }

    public function handle(): void
    {
        $campaign = $this->campaign->fresh(['channel', 'template']);

        if ($campaign->status !== 'running') {
            Log::info("Campaign #{$campaign->id} is not running, skipping.");
            return;
        }

        $channel   = $campaign->channel;
        $batchSize = (int) Setting::get('campaign_batch_size', 100);
        $delaySecs = (int) Setting::get('campaign_delay_seconds', 1);
        $listIds   = $campaign->audience['list_ids'] ?? [];

        // Determine send mode: template or plain text
        $useTemplate = $channel->type === 'whatsapp'
            && $campaign->template
            && $campaign->template->status === 'approved'
            && !empty($campaign->template->whatsapp_template_id ?? $campaign->template->name);

        // Warn if a template was selected but can't be used
        if ($channel->type === 'whatsapp' && $campaign->template && !$useTemplate) {
            Log::warning("Campaign #{$campaign->id}: template '{$campaign->template->name}' status is '{$campaign->template->status}' (not approved). Falling back to plain text. Note: plain text only works within 24h of user-initiated contact.");
        }

        $messageBody = $campaign->content['body'] ?? '';

        $sent = $delivered = $failed = 0;

        Contact::whereHas('lists', fn($q) => $q->whereIn('contact_lists.id', $listIds))
            ->where('status', 'active')
            ->select('id', 'name', 'phone', 'telegram_id', 'language', 'email')
            ->chunk($batchSize, function ($contacts) use (
                $channel, $messageBody, $delaySecs,
                $useTemplate, $campaign,
                &$sent, &$delivered, &$failed
            ) {
                foreach ($contacts as $contact) {
                    try {
                        $success = match ($channel->type) {
                            'whatsapp' => $useTemplate
                                ? $this->sendWhatsappTemplate($channel, $contact, $campaign->template)
                                : $this->sendWhatsapp($channel, $contact, $this->personalize($messageBody, $contact)),
                            'telegram' => $this->sendTelegram($channel, $contact, $this->personalize($messageBody, $contact)),
                            default    => false,
                        };

                        $success ? $delivered++ : $failed++;
                        $sent++;

                        $contact->update(['last_messaged_at' => now()]);

                        if ($delaySecs > 0) {
                            sleep($delaySecs);
                        }

                    } catch (\Exception $e) {
                        $failed++;
                        $sent++;
                        Log::error("Campaign #{$this->campaign->id} failed for contact #{$contact->id}: " . $e->getMessage());
                    }
                }
            });

        $this->campaign->update([
            'status'       => 'completed',
            'completed_at' => now(),
        ]);

        CampaignAnalytic::create([
            'campaign_id' => $this->campaign->id,
            'sent'        => $sent,
            'delivered'   => $delivered,
            'read'        => 0,
            'replied'     => 0,
            'failed'      => $failed,
            'opted_out'   => 0,
            'recorded_at' => now(),
        ]);

        Log::info("Campaign #{$this->campaign->id} completed. Sent: {$sent}, Delivered: {$delivered}, Failed: {$failed}");
    }

    // ── WhatsApp: approved template send ─────────────────────────────────────
    private function sendWhatsappTemplate($channel, $contact, $template): bool
    {
        if (!$contact->phone) return false;

        $credentials = $channel->credentials;
        $token       = $credentials['access_token'] ?? null;
        $phoneId     = $credentials['phone_number_id'] ?? $credentials['phone_id'] ?? null;

        if (!$token || !$phoneId) return false;

        $phone        = preg_replace('/[^0-9]/', '', $contact->phone);
        $templateName = strtolower(str_replace([' ', '-'], '_', $template->name));
        $language     = $template->language ?? 'en';

        // Build body parameters from personalization variables
        $bodyParams = [];
        if (str_contains($template->body, '{{1}}')) {
            $bodyParams[] = ['type' => 'text', 'text' => $contact->name ?? ''];
        }
        if (str_contains($template->body, '{{2}}')) {
            $bodyParams[] = ['type' => 'text', 'text' => $contact->phone ?? ''];
        }
        if (str_contains($template->body, '{{3}}')) {
            $bodyParams[] = ['type' => 'text', 'text' => $contact->email ?? ''];
        }

        $components = [];
        if (!empty($bodyParams)) {
            $components[] = [
                'type'       => 'body',
                'parameters' => $bodyParams,
            ];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type'    => 'individual',
            'to'                => $phone,
            'type'              => 'template',
            'template'          => [
                'name'       => $templateName,
                'language'   => ['code' => $language],
                'components' => $components,
            ],
        ];

        $apiVersion = Setting::get('whatsapp_api_version', 'v19.0');
        $response = Http::withToken($token)
            ->timeout(10)
            ->post("https://graph.facebook.com/{$apiVersion}/{$phoneId}/messages", $payload);

        Log::info("WhatsApp template to {$phone} → Status: {$response->status()} | Body: {$response->body()}");

        return $response->successful() && isset($response->json()['messages']);
    }

    // ── WhatsApp: plain text send (only works within 24hr session) ────────────
    private function sendWhatsapp($channel, $contact, string $message): bool
    {
        if (!$contact->phone) return false;

        $credentials = $channel->credentials;
        $token       = $credentials['access_token'] ?? null;
        $phoneId     = $credentials['phone_number_id'] ?? $credentials['phone_id'] ?? null;

        if (!$token || !$phoneId) return false;

        $phone = preg_replace('/[^0-9]/', '', $contact->phone);

        $apiVersion = Setting::get('whatsapp_api_version', 'v19.0');
        $response = Http::withToken($token)
            ->timeout(10)
            ->post("https://graph.facebook.com/{$apiVersion}/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type'    => 'individual',
                'to'                => $phone,
                'type'              => 'text',
                'text'              => ['body' => $message],
            ]);

        Log::info("WhatsApp text to {$phone} → Status: {$response->status()} | Body: {$response->body()}");

        return $response->successful() && isset($response->json()['messages']);
    }

    private function sendTelegram($channel, $contact, string $message): bool
    {
        if (!$contact->telegram_id) return false;

        $botToken = $channel->credentials['bot_token'] ?? $channel->bot_token ?? null;
        if (!$botToken) return false;

        $response = Http::timeout(10)
            ->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id'    => $contact->telegram_id,
                'text'       => $message,
                'parse_mode' => 'Markdown',
            ]);

        return $response->successful() && $response->json('ok');
    }

    private function personalize(string $message, $contact): string
    {
        return str_replace(
            ['{{name}}', '{{phone}}', '{{email}}'],
            [$contact->name ?? '', $contact->phone ?? '', $contact->email ?? ''],
            $message
        );
    }

    public function failed(\Throwable $e): void
    {
        $this->campaign->update([
            'status'       => 'failed',
            'completed_at' => now(),
        ]);

        Log::error("Campaign #{$this->campaign->id} job failed: " . $e->getMessage());
    }
}
