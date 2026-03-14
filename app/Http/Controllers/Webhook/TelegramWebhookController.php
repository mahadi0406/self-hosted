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

class TelegramWebhookController extends Controller
{
    public function receive(Request $request, Channel $channel): Response
    {
        if (! Setting::get('telegram_enabled', true)) {
            return response('OK', 200);
        }

        $payload = $request->all();
        $message = $payload['message'] ?? null;
        if (!$message) return response('OK', 200);

        $chatId   = $message['chat']['id']       ?? null;
        $body     = $message['text']             ?? '[media]';
        $name     = trim(
            ($message['from']['first_name'] ?? '') . ' ' .
            ($message['from']['last_name']  ?? '')
        ) ?: 'Unknown';

        if (!$chatId) return response('OK', 200);

        $contact = Contact::firstOrCreate(
            ['telegram_id' => (string) $chatId],
            ['name' => $name, 'status' => 'active']
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

        return response('OK', 200);
    }
}
