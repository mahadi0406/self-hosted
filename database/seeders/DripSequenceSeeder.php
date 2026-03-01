<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DripSequence;
use App\Models\DripStep;
use App\Models\Channel;
use App\Models\Template;

class DripSequenceSeeder extends Seeder
{
    public function run(): void
    {
        $waChannel = Channel::where('type', 'whatsapp')->where('status', 'connected')->first();
        $tgChannel = Channel::where('type', 'telegram')->where('status', 'connected')->first();

        $sequences = [
            [
                'sequence' => [
                    'name'         => 'New Customer Onboarding',
                    'description'  => '7-day welcome sequence for new customers to drive first purchase',
                    'channel_id'   => $waChannel?->id,
                    'status'       => 'active',
                    'ai_generated' => false,
                    'ai_goal'      => 'Guide new customers to complete first purchase within 7 days',
                    'total_steps'  => 4,
                ],
                'steps' => [
                    ['step_order' => 1, 'name' => 'Welcome',          'delay_days' => 0, 'delay_hours' => 0, 'send_at_time' => '10:00',  'content' => ['body' => "Hi {{name}}, welcome to BlastBot! 🎉 We're excited to have you. Here's what you can expect from us..."]],
                    ['step_order' => 2, 'name' => 'Feature Highlight', 'delay_days' => 1, 'delay_hours' => 0, 'send_at_time' => '11:00',  'content' => ['body' => "Hey {{name}}! Did you know you can send bulk messages to thousands of contacts in minutes? Try it today! 🚀"]],
                    ['step_order' => 3, 'name' => 'Social Proof',      'delay_days' => 3, 'delay_hours' => 0, 'send_at_time' => '10:00',  'content' => ['body' => "{{name}}, join 5,000+ businesses already using BlastBot to grow their sales via WhatsApp. See their stories ⭐"]],
                    ['step_order' => 4, 'name' => 'First Purchase CTA','delay_days' => 7, 'delay_hours' => 0, 'send_at_time' => '09:00',  'content' => ['body' => "{{name}}, it's been a week! Ready to send your first campaign? Use code FIRST20 for 20% off your first month 🎁"]],
                ],
            ],
            [
                'sequence' => [
                    'name'         => 'Lead Nurture Flow',
                    'description'  => 'Convert warm leads into paying customers over 5 days',
                    'channel_id'   => $waChannel?->id,
                    'status'       => 'active',
                    'ai_generated' => true,
                    'ai_goal'      => 'Convert leads to customers by showcasing value and social proof',
                    'total_steps'  => 3,
                ],
                'steps' => [
                    ['step_order' => 1, 'name' => 'Introduction',   'delay_days' => 0, 'delay_hours' => 1,  'send_at_time' => null, 'content' => ['body' => "Hi {{name}}! Thanks for your interest in BlastBot. I wanted to personally reach out — any questions I can help with? 😊"]],
                    ['step_order' => 2, 'name' => 'Case Study',      'delay_days' => 2, 'delay_hours' => 0,  'send_at_time' => '10:00', 'content' => ['body' => "{{name}}, here's how one of our clients increased sales by 3x in just 30 days using BlastBot's AI features 📈"]],
                    ['step_order' => 3, 'name' => 'Free Trial Offer','delay_days' => 5, 'delay_hours' => 0,  'send_at_time' => '11:00', 'content' => ['body' => "{{name}}, last chance! Start your FREE 14-day trial today — no credit card required. Takes 2 minutes to set up 🚀"]],
                ],
            ],
            [
                'sequence' => [
                    'name'         => 'Telegram Subscriber Welcome',
                    'description'  => '3-step welcome flow for new Telegram subscribers',
                    'channel_id'   => $tgChannel?->id,
                    'status'       => 'active',
                    'ai_generated' => false,
                    'ai_goal'      => 'Welcome Telegram subscribers and drive engagement',
                    'total_steps'  => 3,
                ],
                'steps' => [
                    ['step_order' => 1, 'name' => 'Welcome',       'delay_days' => 0, 'delay_hours' => 0, 'send_at_time' => null, 'content' => ['body' => "👋 Welcome {{name}}! You've just joined our Telegram channel. Expect exclusive deals and early access to new features!"]],
                    ['step_order' => 2, 'name' => 'Channel Value',  'delay_days' => 1, 'delay_hours' => 0, 'send_at_time' => '10:00', 'content' => ['body' => "📢 {{name}}, here's what you'll get as a subscriber: ✅ Flash deals ✅ Product launches ✅ Member discounts"]],
                    ['step_order' => 3, 'name' => 'First Offer',    'delay_days' => 3, 'delay_hours' => 0, 'send_at_time' => '11:00', 'content' => ['body' => "🎁 {{name}}, here's your subscriber welcome gift: Use code TG_WELCOME for 25% off your next purchase! Valid 7 days."]],
                ],
            ],
            [
                'sequence' => [
                    'name'         => 'Win-Back Inactive Users',
                    'description'  => 'Re-engage contacts who haven\'t interacted in 30+ days',
                    'channel_id'   => $waChannel?->id,
                    'status'       => 'paused',
                    'ai_generated' => true,
                    'ai_goal'      => 'Re-activate churned users with compelling incentives',
                    'total_steps'  => 3,
                ],
                'steps' => [
                    ['step_order' => 1, 'name' => 'We miss you',    'delay_days' => 0, 'delay_hours' => 0, 'send_at_time' => '10:00', 'content' => ['body' => "Hi {{name}}, we've missed you! 😢 We've added so many exciting new things since you were last here. Come take a look!"]],
                    ['step_order' => 2, 'name' => 'What\'s New',    'delay_days' => 3, 'delay_hours' => 0, 'send_at_time' => '11:00', 'content' => ['body' => "{{name}}, here's what's new: AI message writing 🤖, bulk campaigns 📢, and drip sequences ⚡. All new in 2025!"]],
                    ['step_order' => 3, 'name' => 'Last Chance',    'delay_days' => 7, 'delay_hours' => 0, 'send_at_time' => '10:00', 'content' => ['body' => "{{name}}, this is our final message. If you'd like to stay connected, reply YES. Otherwise we'll remove you from our list 💙"]],
                ],
            ],
        ];

        foreach ($sequences as $item) {
            $seq = DripSequence::create($item['sequence']);
            foreach ($item['steps'] as $step) {
                DripStep::create(array_merge($step, ['drip_sequence_id' => $seq->id, 'template_id' => null]));
            }
        }

        $this->command->info('DripSequence seeder: ' . count($sequences) . ' sequences created');
    }
}
