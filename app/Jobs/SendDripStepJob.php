<?php

namespace App\Jobs;

use App\Models\DripStep;
use App\Models\DripSequence;
use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendDripStepJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(
        public DripStep     $step,
        public Contact      $contact,
        public DripSequence $sequence,
    ) {}

    public function handle(): void
    {
        $channel = $this->sequence->channel;
        $body    = $this->personalize($this->step->content['body'] ?? '', $this->contact);

        $success = match ($channel->type) {
            'whatsapp' => $this->sendWhatsapp($channel, $this->contact, $body),
            'telegram' => $this->sendTelegram($channel, $this->contact, $body),
            default    => false,
        };

        DB::table('drip_step_logs')->insert([
            'drip_step_id' => $this->step->id,
            'contact_id'   => $this->contact->id,
            'sent_at'      => now(),
            'success'      => $success,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        if ($success) {
            $this->contact->update(['last_messaged_at' => now()]);
        }
    }

    private function sendWhatsapp($channel, $contact, string $message): bool
    {
        if (!$contact->phone) return false;

        $credentials = $channel->credentials;
        $token       = $credentials['access_token']                              ?? null;
        $phoneId     = $credentials['phone_number_id'] ?? $credentials['phone_id'] ?? null;

        if (!$token || !$phoneId) return false;

        $phone    = preg_replace('/[^0-9]/', '', $contact->phone);
        $response = Http::withToken($token)->timeout(10)
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
        if (!$channel->bot_token)   return false;

        $response = Http::timeout(10)
            ->post("https://api.telegram.org/bot{$channel->bot_token}/sendMessage", [
                'chat_id'    => $contact->telegram_id,
                'text'       => $message,
                'parse_mode' => 'Markdown',
            ]);

        return $response->successful() && $response->json('ok');
    }

    private function personalize(string $message, Contact $contact): string
    {
        return str_replace(
            ['{{name}}', '{{phone}}', '{{email}}'],
            [$contact->name, $contact->phone ?? '', $contact->email ?? ''],
            $message
        );
    }

    public function failed(\Throwable $e): void
    {
        Log::error("DripStep #{$this->step->id} failed for contact #{$this->contact->id}: " . $e->getMessage());
    }
}
