<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InboxMessage;
use App\Models\Contact;
use App\Models\Channel;

class InboxMessageSeeder extends Seeder
{
    public function run(): void
    {
        $waChannel = Channel::where('type', 'whatsapp')->where('status', 'connected')->first();
        $tgChannel = Channel::where('type', 'telegram')->where('status', 'connected')->first();
        $contacts  = Contact::all();

        if ($contacts->isEmpty()) return;

        $messages = [
            ['contact' => 'James Wilson',     'channel' => 'whatsapp', 'body' => 'Hi! I just saw your flash sale. How long does shipping take?',                'ai_intent' => 'inquiry',     'ai_suggested_reply' => 'Hi James! 👋 Shipping typically takes 3-5 business days. For express delivery, we offer 1-2 day shipping at checkout. Can I help with anything else?', 'is_read' => false, 'received_at' => now()->subMinutes(10)],
            ['contact' => 'Fatima Al-Zahra',  'channel' => 'whatsapp', 'body' => 'I received a damaged product. This is unacceptable!',                         'ai_intent' => 'complaint',   'ai_suggested_reply' => 'Dear Fatima, I sincerely apologize for this experience. Please share a photo of the damaged item and we\'ll arrange an immediate replacement at no cost. 🙏', 'is_read' => false, 'received_at' => now()->subMinutes(25)],
            ['contact' => 'Rahul Sharma',      'channel' => 'whatsapp', 'body' => 'I want to buy 10 units of the premium plan. Do you have bulk pricing?',       'ai_intent' => 'purchase',    'ai_suggested_reply' => 'Hi Rahul! Great news — we offer bulk pricing for 10+ seats. I can offer you 30% off for 10 units. Shall I prepare a quote? 💼',                        'is_read' => false, 'received_at' => now()->subMinutes(40)],
            ['contact' => 'Mei Lin',           'channel' => 'telegram', 'body' => 'When is your next sale? I\'m waiting to buy.',                                 'ai_intent' => 'inquiry',     'ai_suggested_reply' => 'Hi Mei! 🎉 Our next sale starts this Friday! I can add you to our VIP early-access list so you get notified first. Want me to do that?',               'is_read' => true,  'received_at' => now()->subHour()],
            ['contact' => 'Priya Patel',       'channel' => 'whatsapp', 'body' => 'STOP please remove me from all lists',                                         'ai_intent' => 'unsubscribe', 'ai_suggested_reply' => 'Hi Priya, I\'ve removed you from all messaging lists immediately. You won\'t receive further messages. Sorry to see you go! 💙',                          'is_read' => true,  'received_at' => now()->subHours(2)],
            ['contact' => 'Ahmed Hassan',      'channel' => 'whatsapp', 'body' => 'Do you ship to Egypt? What payment methods do you accept?',                    'ai_intent' => 'inquiry',     'ai_suggested_reply' => 'Hi Ahmed! Yes, we ship to Egypt! 🇪🇬 Delivery takes 7-10 days. We accept Visa, Mastercard, and PayPal. Anything else I can help with?',               'is_read' => false, 'received_at' => now()->subHours(3)],
            ['contact' => 'Nour Khalil',       'channel' => 'whatsapp', 'body' => 'Amazing product! Just ordered 3 more. Keep up the great work! ❤️',            'ai_intent' => 'purchase',    'ai_suggested_reply' => 'Thank you so much Nour! 😊 Your loyalty means the world to us. I\'ve added 500 bonus points to your account as a thank you gift! 🎁',                  'is_read' => true,  'received_at' => now()->subHours(4)],
            ['contact' => 'Lucas Schmidt',     'channel' => 'whatsapp', 'body' => 'Win a free iPhone! Click here: bit.ly/scam123',                                'ai_intent' => 'spam',        'ai_suggested_reply' => null,                                                                                                                                                    'is_read' => true,  'received_at' => now()->subHours(5)],
            ['contact' => 'Emma Johnson',      'channel' => 'telegram', 'body' => 'Can you explain how the drip sequence feature works?',                          'ai_intent' => 'inquiry',     'ai_suggested_reply' => 'Hi Emma! Drip sequences let you send automated follow-up messages over time. For example: send a welcome message now, then a follow-up in 3 days 📅',    'is_read' => false, 'received_at' => now()->subHours(6)],
            ['contact' => 'Kwame Asante',      'channel' => 'whatsapp', 'body' => 'I need urgent help! My payment failed 3 times!',                               'ai_intent' => 'complaint',   'ai_suggested_reply' => 'Hi Kwame, I\'m so sorry to hear this! 😟 Let me look into your payment issue right away. Can you share the last 4 digits of the card you\'re using?',  'is_read' => false, 'received_at' => now()->subHours(7)],
            ['contact' => 'Yuki Tanaka',       'channel' => 'telegram', 'body' => 'Is there a free trial available?',                                             'ai_intent' => 'inquiry',     'ai_suggested_reply' => 'Hi Yuki! Yes! We offer a 14-day free trial with full access to all features — no credit card needed. Want me to set that up for you? 🚀',                'is_read' => true,  'received_at' => now()->subHours(8)],
            ['contact' => 'Sara Andersson',    'channel' => 'whatsapp', 'body' => 'Just placed my first order! Very excited 😊',                                  'ai_intent' => 'purchase',    'ai_suggested_reply' => 'Yay! Welcome to the BlastBot family Sara! 🎉 Your order is being processed. You\'ll receive a confirmation email shortly. Anything else I can help with?', 'is_read' => true,  'received_at' => now()->subDays(1)],
        ];

        foreach ($messages as $msg) {
            $contact = $contacts->firstWhere('name', $msg['contact']);
            if (!$contact) continue;

            $channel = $msg['channel'] === 'whatsapp' ? $waChannel : $tgChannel;
            if (!$channel) continue;

            InboxMessage::create([
                'contact_id'         => $contact->id,
                'channel_id'         => $channel->id,
                'direction'          => 'inbound',
                'body'               => $msg['body'],
                'type'               => 'text',
                'ai_intent'          => $msg['ai_intent'],
                'ai_suggested_reply' => $msg['ai_suggested_reply'],
                'is_read'            => $msg['is_read'],
                'received_at'        => $msg['received_at'],
            ]);
        }

        $this->command->info('InboxMessage seeder: ' . count($messages) . ' messages created');
    }
}
