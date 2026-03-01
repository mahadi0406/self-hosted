<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CampaignAnalytic;
use App\Models\Campaign;

class CampaignAnalyticSeeder extends Seeder
{
    public function run(): void
    {
        $campaigns = Campaign::all()->keyBy('name');

        $analytics = [
            [
                'campaign'    => 'Summer Flash Sale',
                'sent'        => 1250,
                'delivered'   => 1187,
                'read'        => 934,
                'replied'     => 142,
                'failed'      => 63,
                'opted_out'   => 8,
                'ai_recommendations' => [
                    'Best engagement was between 10AM-12PM — schedule future campaigns in this window.',
                    'Reply rate of 12% is above average. Consider using this template for future flash sales.',
                    'Failed messages mostly in region AE — check WhatsApp Business API limits for that region.',
                ],
                'recorded_at' => now()->subDays(5),
            ],
            [
                'campaign'    => 'VIP Member Exclusive',
                'sent'        => 320,
                'delivered'   => 318,
                'read'        => 291,
                'replied'     => 67,
                'failed'      => 2,
                'opted_out'   => 1,
                'ai_recommendations' => [
                    'Exceptional 99.4% delivery rate — VIP list is very clean and well-maintained.',
                    'Reply rate of 21% is excellent. VIP personalization strategy is working well.',
                    'Consider running a follow-up campaign within 48 hours while engagement is high.',
                ],
                'recorded_at' => now()->subDays(10),
            ],
            [
                'campaign'    => 'Telegram Promo Blast',
                'sent'        => 412,
                'delivered'   => 406,
                'read'        => 287,
                'replied'     => 54,
                'failed'      => 6,
                'opted_out'   => 3,
                'ai_recommendations' => [
                    'Campaign still running — 58% of audience reached so far.',
                    'Current reply rate of 13% is tracking well. Estimated final: 15-18%.',
                ],
                'recorded_at' => now()->subHours(1),
            ],
        ];

        foreach ($analytics as $data) {
            $campaign = $campaigns->get($data['campaign']);
            if (!$campaign) continue;

            CampaignAnalytic::create([
                'campaign_id'        => $campaign->id,
                'sent'               => $data['sent'],
                'delivered'          => $data['delivered'],
                'read'               => $data['read'],
                'replied'            => $data['replied'],
                'failed'             => $data['failed'],
                'opted_out'          => $data['opted_out'],
                'ai_recommendations' => $data['ai_recommendations'],
                'recorded_at'        => $data['recorded_at'],
            ]);
        }

        $this->command->info('CampaignAnalytic seeder: ' . count($analytics) . ' analytics records created');
    }
}
