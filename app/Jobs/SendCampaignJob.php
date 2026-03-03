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

    public int $tries   = 3;
    public int $timeout = 3600;

    public function __construct(public Campaign $campaign) {}

    public function handle(): void
    {
        $campaign = $this->campaign->fresh(['channel']);

        if ($campaign->status !== 'running') {
            Log::info("Campaign #{$campaign->id} is not running, skipping.");
            return;
        }

        $channel    = $campaign->channel;
        $batchSize  = (int) Setting::get('campaign_batch_size', 100);
        $delaySecs  = (int) Setting::get('campaign_delay_seconds', 1);
        $listIds    = $campaign->audience['list_ids'] ?? [];
        $messageBody= $campaign->content['body'] ?? '';

        $sent = $delivered = $failed = 0;

        Contact::whereHas('lists', fn($q) => $q->whereIn('contact_lists.id', $listIds))
            ->where('status', 'active')
            ->select('id', 'name', 'phone', 'telegram_id', 'language')
            ->chunk($batchSize, function ($contacts) use (
                $channel, $messageBody, $delaySecs,
                &$sent, &$delivered, &$failed
            ) {
                foreach ($contacts as $contact) {
                    try {
                        $message = $this->personalize($messageBody, $contact);

                        $success = match ($channel->type) {
                            'whatsapp' => $this->sendWhatsapp($channel, $contact, $message),
                            'telegram' => $this->sendTelegram($channel, $contact, $message),
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


    private function sendWhatsapp($channel, $contact, string $message): bool
    {
        if (!$contact->phone) return false;

        $credentials = $channel->credentials;
        $token       = $credentials['access_token'] ?? null;
        $phoneId     = $credentials['phone_id']     ?? null;

        if (!$token || !$phoneId) return false;

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

        return $response->successful();
    }

    private function sendTelegram($channel, $contact, string $message): bool
    {
        if (!$contact->telegram_id) return false;

        $botToken = $channel->bot_token;
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
            [$contact->name, $contact->phone ?? '', $contact->email ?? ''],
            $message
        );
    }


    public function failed(\Throwable $e): void
    {
        $this->campaign->update([
            'status'        => 'failed',
            'completed_at'  => now(),
        ]);

        Log::error("Campaign #{$this->campaign->id} job failed: " . $e->getMessage());
    }
}
