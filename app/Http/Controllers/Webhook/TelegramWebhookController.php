<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Contact;
use App\Models\InboxMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TelegramWebhookController extends Controller
{
    public function receive(Request $request, int $channelId): Response
    {
        $channel = Channel::find($channelId);
        if (!$channel) return response('Not Found', 404);

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

        InboxMessage::create([
            'contact_id'  => $contact->id,
            'channel_id'  => $channel->id,
            'direction'   => 'inbound',
            'body'        => $body,
            'type'        => 'text',
            'is_read'     => false,
            'received_at' => now(),
        ]);

        return response('OK', 200);
    }
}
