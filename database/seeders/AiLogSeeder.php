<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AiLog;

class AiLogSeeder extends Seeder
{
    public function run(): void
    {
        $model = 'claude-sonnet-4-20250514';

        $logs = [
            // Message Writer logs
            [
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => "You are an expert marketing message writer for whatsapp campaigns. Generate exactly 3 message variants for: Business: E-commerce store, Goal: Promote summer sale, Tone: urgent, Language: en.",
                'response'      => '[{"variant":1,"label":"Direct & Bold","body":"⚡ FLASH SALE LIVE NOW! Up to 70% off everything. Use SUMMER70 at checkout. Hurry — ends midnight! 🛒","compliance_score":92,"character_count":97},{"variant":2,"label":"Warm & Personal","body":"Hey {{name}}! Your summer upgrade is here 🌞 Shop our biggest sale ever — 70% OFF with code SUMMER70. Limited time!","compliance_score":96,"character_count":118},{"variant":3,"label":"Urgency Driven","body":"⏰ LAST CHANCE! Summer sale ends at midnight. 70% OFF storewide — code SUMMER70. Don\'t miss it! 🔥","compliance_score":89,"character_count":103}]',
                'input_tokens'  => 312,
                'output_tokens' => 187,
                'success'       => true,
                'created_at'    => now()->subHours(2),
            ],
            [
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => "Generate 3 message variants. Business: Restaurant, Goal: Promote weekend brunch, Tone: friendly, Language: en.",
                'response'      => '[{"variant":1,"label":"Inviting","body":"Good morning! ☀️ Our weekend brunch is calling your name. Fresh eggs, fluffy pancakes & bottomless coffee. Book your table now!","compliance_score":98,"character_count":129},{"variant":2,"label":"Tempting","body":"🥞 Brunch o\'clock! Join us this weekend for the best eggs benedict in town. Reserve your spot before it fills up!","compliance_score":97,"character_count":116},{"variant":3,"label":"Social","body":"Bring your crew for weekend brunch 🍳 Amazing food, great vibes, and bottomless mimosas. Tap to reserve your table!","compliance_score":95,"character_count":116}]',
                'input_tokens'  => 298,
                'output_tokens' => 201,
                'success'       => true,
                'created_at'    => now()->subHours(5),
            ],
            [
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => "Generate 3 message variants. Business: Gym, Goal: January membership promotion, Tone: professional, Language: en.",
                'response'      => null,
                'input_tokens'  => 0,
                'output_tokens' => 0,
                'success'       => false,
                'error_message' => 'Connection timeout after 30 seconds',
                'created_at'    => now()->subHours(8),
            ],
            [
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => "Generate 3 message variants. Business: SaaS startup, Goal: Free trial sign up, Tone: casual, Language: en.",
                'response'      => '[{"variant":1,"label":"No-pressure","body":"Hey! 👋 Try our platform free for 14 days — no credit card, no commitment. See what all the buzz is about 🚀","compliance_score":99,"character_count":112},{"variant":2,"label":"Value-focused","body":"Free 14-day trial = 2 weeks of more leads, more sales, zero risk. Start today, cancel anytime 💪","compliance_score":97,"character_count":98},{"variant":3,"label":"Social proof","body":"5,000+ businesses trust us. You get 14 days FREE to find out why. Start your trial in 2 minutes! ⚡","compliance_score":96,"character_count":101}]',
                'input_tokens'  => 289,
                'output_tokens' => 193,
                'success'       => true,
                'created_at'    => now()->subDays(1),
            ],
            [
                'feature'       => 'message_writer',
                'model'         => $model,
                'prompt'        => "Generate 3 message variants. Business: Fashion boutique, Goal: New arrivals announcement, Tone: friendly, Language: en.",
                'response'      => '[{"variant":1,"label":"Excited","body":"✨ New arrivals just dropped! Fresh styles for the new season are here. Be the first to shop before they sell out 👗","compliance_score":97,"character_count":115},{"variant":2,"label":"Exclusive","body":"🆕 New season, new you! Our latest collection just landed. Early access for our subscribers — shop now before it goes public!","compliance_score":95,"character_count":121},{"variant":3,"label":"FOMO","body":"The new collection everyone\'s talking about is finally here! Limited pieces — claim yours before they\'re gone 🔥","compliance_score":91,"character_count":108}]',
                'input_tokens'  => 301,
                'output_tokens' => 198,
                'success'       => true,
                'created_at'    => now()->subDays(2),
            ],

            // Campaign Planner logs
            [
                'feature'       => 'campaign_planner',
                'model'         => $model,
                'prompt'        => "Create a complete drip campaign plan for: Business: E-commerce, Goal: Re-engage inactive customers, Duration: 7 days, Audience: 1500 contacts, Tone: friendly, Channel: whatsapp.",
                'response'      => '{"campaign_name":"Win-Back: 7-Day Re-engagement","overview":"A gentle 7-day drip sequence to re-activate inactive customers using personalization, value reminders, and a compelling final offer.","estimated_reach":1425,"expected_open_rate":34,"expected_reply_rate":11,"best_send_times":["10:00 AM","6:00 PM"],"steps":[{"day":1,"step":1,"title":"We Miss You","type":"broadcast","message":"Hi {{name}}, it\'s been a while! 😊 We\'ve missed having you around. Come see what\'s new — we think you\'ll love it!","send_time":"10:00 AM","objective":"Re-establish connection"},{"day":3,"step":2,"title":"What\'s New","type":"follow_up","message":"{{name}}, since you were last here we launched AI message writing, drip sequences, and much more! Your feedback helped shape these features 🙏","send_time":"11:00 AM","objective":"Showcase new value"},{"day":5,"step":3,"title":"Special Offer","type":"engagement","message":"{{name}}, here\'s something special just for you 🎁 Use code COMEBACK30 for 30% off. Valid for 48 hours only!","send_time":"10:00 AM","objective":"Drive conversion with exclusive offer"},{"day":7,"step":4,"title":"Last Chance","type":"reminder","message":"{{name}}, your 30% discount expires tonight at midnight ⏰ Don\'t miss your chance — use COMEBACK30 now!","send_time":"9:00 AM","objective":"Final urgency push"}],"tips":["Send messages in the contact\'s local timezone for best results","Personalize with first name for 23% higher open rates","Remove non-responders after Day 5 to protect sender score"],"warnings":["Ensure opt-out is easy to avoid spam complaints","High volume sends should be spread over 2-3 hours"]}',
                'input_tokens'  => 486,
                'output_tokens' => 521,
                'success'       => true,
                'created_at'    => now()->subHours(3),
            ],
            [
                'feature'       => 'campaign_planner',
                'model'         => $model,
                'prompt'        => "Create a complete broadcast campaign plan for: Business: Online course platform, Goal: Launch new AI course, Duration: 3 days, Audience: 800 contacts, Tone: professional, Channel: telegram.",
                'response'      => '{"campaign_name":"AI Course Launch: 3-Day Blitz","overview":"A high-energy 3-day launch campaign to maximize enrollment for the new AI course launch using countdown urgency and social proof.","estimated_reach":776,"expected_open_rate":41,"expected_reply_rate":14,"best_send_times":["9:00 AM","7:00 PM"],"steps":[{"day":1,"step":1,"title":"Announcement","type":"broadcast","message":"🚀 Big news {{name}}! Our most requested course is finally here: Mastering AI for Business. Early bird pricing ends in 72 hours. Secure your spot now!","send_time":"9:00 AM","objective":"Generate launch awareness"},{"day":2,"step":2,"title":"Social Proof","type":"follow_up","message":"{{name}}, 200+ students already enrolled in the first 24 hours! Here\'s what early students are saying: \'This is the most practical AI course I\'ve seen\' — Join them before spots fill up!","send_time":"10:00 AM","objective":"Build FOMO with social proof"},{"day":3,"step":3,"title":"Final Hours","type":"reminder","message":"⏰ {{name}}, FINAL HOURS for early bird pricing! After midnight the price increases by 40%. Lock in your spot now — you won\'t regret it!","send_time":"9:00 AM","objective":"Last chance urgency conversion"}],"tips":["Include testimonials or student results in Day 2 message","Use countdown timers in your landing page","Follow up with purchasers immediately with a welcome message"],"warnings":["Avoid sending more than once per day to prevent opt-outs","Ensure landing page can handle traffic spike on Day 1"]}',
                'input_tokens'  => 471,
                'output_tokens' => 498,
                'success'       => true,
                'created_at'    => now()->subDays(1),
            ],
            [
                'feature'       => 'campaign_planner',
                'model'         => $model,
                'prompt'        => "Create a mixed campaign plan for: Business: Fitness app, Goal: January new year signups, Duration: 5 days, Audience: 2000 contacts, Tone: urgent, Channel: whatsapp.",
                'response'      => null,
                'input_tokens'  => 0,
                'output_tokens' => 0,
                'success'       => false,
                'error_message' => 'AI API rate limit exceeded. Please try again in 60 seconds.',
                'created_at'    => now()->subDays(2),
            ],
        ];

        foreach ($logs as $log) {
            AiLog::create($log);
        }

        $this->command->info('AiLog seeder: ' . count($logs) . ' AI log entries created');
    }
}
