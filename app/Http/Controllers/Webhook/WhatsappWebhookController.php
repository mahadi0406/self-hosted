<?php

namespace App\Http\Controllers\Webhook;


use App\Http\Controllers\Controller;
use App\Jobs\ProcessInboxAiReplyJob;
use App\Models\Channel;
use App\Models\Contact;
use App\Models\InboxMessage;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WhatsappWebhookController extends Controller
{
    public function verify(Request $request): Response
    {
        $verifyToken = Setting::get('whatsapp_verify_token', 'blastbot_verify');
        if (
            $request->get('hub_mode')       === 'subscribe' &&
            $request->get('hub_verify_token') === $verifyToken
        ) {
            return response($request->get('hub_challenge'), 200);
        }

        return response('Forbidden', 403);
    }

    public function receive(Request $request): Response
    {
        $payload = $request->all();

        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $value = $change['value'] ?? [];

                foreach ($value['messages'] ?? [] as $msg) {
                    $phoneId = $value['metadata']['phone_number_id'] ?? null;
                    $channel = Channel::whereJsonContains('credentials->phone_id', $phoneId)->first();

                    if (!$channel) continue;

                    $from    = $msg['from'];
                    $body    = $msg['text']['body'] ?? '[media]';

                    $contact = Contact::firstOrCreate(
                        ['phone' => '+' . $from],
                        ['name'  => $value['contacts'][0]['profile']['name'] ?? 'Unknown', 'status' => 'active']
                    );

                    $inboxMessage = InboxMessage::create([
                        'contact_id'  => $contact->id,
                        'channel_id'  => $channel->id,
                        'direction'   => 'inbound',
                        'body'        => $body,
                        'type'        => 'text',
                        'is_read'     => false,
                        'received_at' => now(),
                    ]);

                    ProcessInboxAiReplyJob::dispatch($inboxMessage);
                }
            }
        }

        return response('OK', 200);
    }
}
