<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Campaign;
use App\Models\Channel;
use App\Models\Template;
use App\Models\ContactList;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        $waChannel  = Channel::where('type', 'whatsapp')->where('status', 'connected')->first();
        $tgChannel  = Channel::where('type', 'telegram')->where('status', 'connected')->first();
        $allList    = ContactList::where('name', 'All Customers')->first();
        $vipList    = ContactList::where('name', 'VIP Members')->first();
        $leadList   = ContactList::where('name', 'Leads')->first();
        $flashTpl   = Template::where('name', 'Flash Sale Announcement')->first();
        $welcomeTpl = Template::where('name', 'Welcome Message')->first();
        $tgPromo    = Template::where('name', 'Telegram Promo Blast')->first();

        $campaigns = [
            [
                'name'             => 'Summer Flash Sale',
                'channel_id'       => $waChannel?->id,
                'template_id'      => $flashTpl?->id,
                'type'             => 'instant',
                'status'           => 'completed',
                'total_recipients' => 1250,
                'content'          => ['body' => "Hi {{name}}! ⚡ Our biggest summer sale is LIVE — UP TO 70% OFF! Use code BLAST70. Ends Sunday! 🛒"],
                'audience'         => ['list_ids' => [$allList?->id]],
                'ai_goal'          => 'Drive summer sale purchases with urgency',
                'started_at'       => now()->subDays(5),
                'completed_at'     => now()->subDays(5)->addHours(3),
                'scheduled_at'     => null,
            ],
            [
                'name'             => 'VIP Member Exclusive',
                'channel_id'       => $waChannel?->id,
                'template_id'      => $welcomeTpl?->id,
                'type'             => 'instant',
                'status'           => 'completed',
                'total_recipients' => 320,
                'content'          => ['body' => "Hi {{name}}! As a VIP member, you get EARLY ACCESS to our new collection. Shop before anyone else! 👑"],
                'audience'         => ['list_ids' => [$vipList?->id]],
                'ai_goal'          => 'Reward VIP members with exclusive early access',
                'started_at'       => now()->subDays(10),
                'completed_at'     => now()->subDays(10)->addHours(1),
                'scheduled_at'     => null,
            ],
            [
                'name'             => 'Telegram Promo Blast',
                'channel_id'       => $tgChannel?->id,
                'template_id'      => $tgPromo?->id,
                'type'             => 'instant',
                'status'           => 'running',
                'total_recipients' => 870,
                'content'          => ['body' => "🔥 *SPECIAL OFFER* — This Weekend Only! Get 50% OFF with code TG50. Limited time!"],
                'audience'         => ['list_ids' => [$allList?->id]],
                'ai_goal'          => 'Drive telegram audience conversions with weekend offer',
                'started_at'       => now()->subHours(1),
                'completed_at'     => null,
                'scheduled_at'     => null,
            ],
            [
                'name'             => 'Lead Nurture Campaign',
                'channel_id'       => $waChannel?->id,
                'template_id'      => null,
                'type'             => 'scheduled',
                'status'           => 'scheduled',
                'total_recipients' => 450,
                'content'          => ['body' => "Hi {{name}}, we noticed you've been exploring our platform! Let us help you get started with a free demo. 🚀"],
                'audience'         => ['list_ids' => [$leadList?->id]],
                'ai_goal'          => 'Convert leads by offering free demo',
                'started_at'       => null,
                'completed_at'     => null,
                'scheduled_at'     => now()->addDays(2)->setTime(10, 0),
            ],
            [
                'name'             => 'New Feature Announcement',
                'channel_id'       => $waChannel?->id,
                'template_id'      => null,
                'type'             => 'instant',
                'status'           => 'draft',
                'total_recipients' => 1250,
                'content'          => ['body' => "Hi {{name}}! We just launched AI-powered message writing. Generate perfect marketing messages in seconds! Try it now ✨"],
                'audience'         => ['list_ids' => [$allList?->id]],
                'ai_goal'          => 'Drive adoption of new AI message writer feature',
                'started_at'       => null,
                'completed_at'     => null,
                'scheduled_at'     => null,
            ],
        ];

        foreach ($campaigns as $campaign) {
            Campaign::create($campaign);
        }

        $this->command->info('Campaign seeder: ' . count($campaigns) . ' campaigns created');
    }
}
