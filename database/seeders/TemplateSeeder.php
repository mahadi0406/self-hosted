<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Template;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            // WhatsApp — Approved
            [
                'name'                => 'Welcome Message',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '👋 Welcome to BlastBot!',
                'body'                => "Hi {{1}}, welcome aboard! 🎉\n\nWe're thrilled to have you with us. Your journey to smarter messaging starts today.\n\nReply *HELP* anytime for assistance.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => ['Get Started', 'Learn More'],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 98,
                'usage_count'         => 342,
            ],
            [
                'name'                => 'Flash Sale Announcement',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '⚡ 48-Hour Flash Sale!',
                'body'                => "Hi {{1}}! ⚡\n\nDon't miss our biggest sale of the year — *UP TO 70% OFF* on all products!\n\n🛒 Use code: BLAST70\n⏳ Ends Sunday midnight\n\nShop now before it's gone!",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => ['Shop Now', 'View Deals'],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 94,
                'usage_count'         => 187,
            ],
            [
                'name'                => 'Order Confirmation',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '✅ Order Confirmed',
                'body'                => "Hi {{1}}, your order *#{{2}}* has been confirmed! 🎊\n\n📦 Estimated delivery: {{3}}\n\nWe'll notify you when it ships. Thank you for shopping with us!",
                'footer'              => 'Need help? Reply anytime',
                'buttons'             => ['Track Order'],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 99,
                'usage_count'         => 520,
            ],
            [
                'name'                => 'Abandoned Cart Recovery',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '🛒 You left something behind!',
                'body'                => "Hey {{1}}! 👋\n\nYou left items in your cart. They're selling fast!\n\n✨ Complete your purchase now and get *10% OFF* with code: SAVE10\n\nOffer expires in 24 hours ⏰",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => ['Complete Purchase', 'View Cart'],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 91,
                'usage_count'         => 98,
            ],
            [
                'name'                => 'Appointment Reminder',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '📅 Appointment Reminder',
                'body'                => "Hi {{1}},\n\nThis is a friendly reminder about your appointment:\n\n📅 Date: {{2}}\n🕐 Time: {{3}}\n📍 Location: {{4}}\n\nPlease reply to confirm or reschedule.",
                'footer'              => 'Reply CONFIRM or RESCHEDULE',
                'buttons'             => ['Confirm ✓', 'Reschedule'],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 100,
                'usage_count'         => 215,
            ],
            [
                'name'                => 'Re-engagement Campaign',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '💭 We miss you!',
                'body'                => "Hi {{1}}, it's been a while! 😊\n\nWe've added exciting new features and products since you last visited.\n\nCome back and see what's new — we have a special *welcome back* offer just for you! 🎁",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => ['See What\'s New', 'Claim Offer'],
                'source'              => 'ai_generated',
                'status'             => 'draft',
                'ai_compliance_score' => 88,
                'usage_count'         => 0,
            ],

            // Telegram templates
            [
                'name'                => 'Telegram Welcome',
                'channel'             => 'telegram',
                'language'            => 'en',
                'header'              => null,
                'body'                => "👋 Welcome to BlastBot, {{1}}!\n\nYou're now connected to our Telegram channel. Expect:\n\n✅ Exclusive deals\n📢 Product updates\n🎁 Member-only offers\n\nStay tuned!",
                'footer'              => null,
                'buttons'             => [],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 97,
                'usage_count'         => 143,
            ],
            [
                'name'                => 'Telegram Promo Blast',
                'channel'             => 'telegram',
                'language'            => 'en',
                'header'              => null,
                'body'                => "🔥 *SPECIAL OFFER* — This Weekend Only!\n\nHey {{1}}! Get *50% OFF* our premium plan.\n\n💳 Use code: TG50\n⏳ Valid until Sunday\n\nDon't miss out — limited slots available!",
                'footer'              => null,
                'buttons'             => [],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 92,
                'usage_count'         => 76,
            ],

            // Rejected example
            [
                'name'                => 'Aggressive Sales Push',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '🚨 BUY NOW!!!',
                'body'                => "YOU MUST BUY THIS NOW!!! Limited time ONLY! ACT IMMEDIATELY before it's TOO LATE!!!",
                'footer'              => null,
                'buttons'             => ['BUY NOW!!!'],
                'source'              => 'manual',
                'status'              => 'rejected',
                'rejection_reason'    => 'Template uses aggressive language and excessive capitalization which violates WhatsApp messaging policies.',
                'ai_compliance_score' => 22,
                'usage_count'         => 0,
            ],
        ];

        foreach ($templates as $template) {
            Template::create($template);
        }

        $this->command->info('Template seeder: ' . count($templates) . ' templates created');
    }
}
