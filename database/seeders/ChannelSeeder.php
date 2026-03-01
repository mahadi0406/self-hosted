<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Channel;

class ChannelSeeder extends Seeder
{
    public function run(): void
    {
        $channels = [
            [
                'name'         => 'BlastBot WhatsApp',
                'type'         => 'whatsapp',
                'status'       => 'connected',
                'phone_number' => '+1 (555) 001-0001',
                'credentials'  => json_encode([
                    'access_token' => 'DEMO_TOKEN_WA_001',
                    'waba_id'      => 'WABA_DEMO_001',
                    'phone_id'     => 'PHONE_DEMO_001',
                ]),
            ],
            [
                'name'         => 'Support WhatsApp',
                'type'         => 'whatsapp',
                'status'       => 'connected',
                'phone_number' => '+1 (555) 001-0002',
                'credentials'  => json_encode([
                    'access_token' => 'DEMO_TOKEN_WA_002',
                    'waba_id'      => 'WABA_DEMO_002',
                    'phone_id'     => 'PHONE_DEMO_002',
                ]),
            ],
            [
                'name'      => 'BlastBot Telegram',
                'type'      => 'telegram',
                'status'    => 'connected',
                'bot_token' => 'DEMO_BOT_TOKEN_TG_001',
                'credentials' => json_encode([
                    'bot_username' => 'blastbot_official',
                ]),
            ],
            [
                'name'      => 'Sales Telegram',
                'type'      => 'telegram',
                'status'    => 'disconnected',
                'bot_token' => 'DEMO_BOT_TOKEN_TG_002',
                'credentials' => json_encode([
                    'bot_username' => 'blastbot_sales',
                ]),
            ],
        ];

        foreach ($channels as $channel) {
            Channel::create($channel);
        }

        $this->command->info('Channel seeder: 4 channels created (2 WhatsApp, 2 Telegram)');
    }
}
