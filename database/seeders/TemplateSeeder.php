<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name'                => 'Welcome Message',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Welcome to BlastBot',
                'body'                => "Hi {{1}},\n\nThank you for joining BlastBot. We are glad to have you with us.\n\nYou will receive updates, offers, and important messages through this channel.\n\nReply HELP at any time if you need assistance.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Get Started'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Learn More'],
                ],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 98,
                'usage_count'         => 342,
            ],

            [
                'name'                => 'Flash Sale Announcement',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => '48-Hour Sale',
                'body'                => "Hi {{1}},\n\nFor the next 48 hours we are offering up to *{{2}}% off* across our full range.\n\nUse code *{{3}}* at checkout to apply your discount. This offer ends Sunday at midnight.\n\nVisit our website to browse the sale.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Shop Now'],
                    ['type' => 'QUICK_REPLY', 'text' => 'View Deals'],
                ],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 94,
                'usage_count'         => 187,
            ],

            [
                'name'                => 'Abandoned Cart Recovery',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Complete Your Order',
                'body'                => "Hi {{1}},\n\nYou left some items in your cart. Your selection is still saved and ready for checkout.\n\nAs a reminder, use code *{{2}}* to receive 10% off your order. This code is valid for the next 24 hours.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Complete Purchase'],
                    ['type' => 'QUICK_REPLY', 'text' => 'View Cart'],
                ],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 91,
                'usage_count'         => 98,
            ],

            [
                'name'                => 'Re-engagement Campaign',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'We Have Something for You',
                'body'                => "Hi {{1}},\n\nIt has been a while since we last connected. We have added new features and products we think you will enjoy.\n\nAs a thank you for being a valued member, we have prepared a special offer for you. Reply to find out more.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'See Offer'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Not Interested'],
                ],
                'source'              => 'ai_generated',
                'status'              => 'draft',
                'ai_compliance_score' => 88,
                'usage_count'         => 0,
            ],

            [
                'name'                => 'Monthly Newsletter',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Monthly Update',
                'body'                => "Hi {{1}},\n\nHere is your monthly update from {{2}}.\n\nThis month we have launched new products, improved our service, and have exclusive deals available only to our subscribers.\n\nReply READ to receive the full update.",
                'footer'              => 'Reply STOP to unsubscribe',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Read Update'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Unsubscribe'],
                ],
                'source'              => 'manual',
                'status'              => 'draft',
                'ai_compliance_score' => 93,
                'usage_count'         => 0,
            ],
            [
                'name'                => 'Order Confirmation',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Order Confirmed',
                'body'                => "Hi {{1}},\n\nYour order *#{{2}}* has been confirmed.\n\nEstimated delivery: *{{3}}*\n\nWe will send you a notification once your order ships. Thank you for your purchase.",
                'footer'              => 'Reply HELP for support',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Track Order'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Contact Support'],
                ],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 99,
                'usage_count'         => 520,
            ],

            [
                'name'                => 'Appointment Reminder',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Appointment Reminder',
                'body'                => "Hi {{1}},\n\nThis is a reminder about your upcoming appointment.\n\nDate: *{{2}}*\nTime: *{{3}}*\nLocation: *{{4}}*\n\nPlease reply to confirm or let us know if you need to reschedule.",
                'footer'              => 'Reply CONFIRM or RESCHEDULE',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Confirm'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Reschedule'],
                ],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 100,
                'usage_count'         => 215,
            ],

            [
                'name'                => 'Delivery Update',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Delivery Update',
                'body'                => "Hi {{1}},\n\nYour order *#{{2}}* is on its way.\n\nExpected delivery: *{{3}}*\nTracking number: *{{4}}*\n\nYou can track your package using the tracking number above.",
                'footer'              => 'Reply HELP for support',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Track Package'],
                ],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 100,
                'usage_count'         => 308,
            ],

            [
                'name'                => 'Payment Received',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Payment Confirmed',
                'body'                => "Hi {{1}},\n\nWe have received your payment of *{{2}}* for invoice *#{{3}}*.\n\nPayment date: {{4}}\n\nThank you for your prompt payment. A receipt has been sent to your registered email.",
                'footer'              => 'Reply HELP for support',
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'View Receipt'],
                ],
                'source'              => 'manual',
                'status'              => 'draft',
                'ai_compliance_score' => 100,
                'usage_count'         => 0,
            ],

            [
                'name'                => 'Account Verification',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'Verify Your Account',
                'body'                => "Hi {{1}},\n\nYour verification code is: *{{2}}*\n\nThis code is valid for 10 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this message.",
                'footer'              => null,
                'buttons'             => [],
                'source'              => 'manual',
                'status'              => 'draft',
                'ai_compliance_score' => 100,
                'usage_count'         => 0,
            ],
            [
                'name'                => 'Aggressive Sales Push',
                'channel'             => 'whatsapp',
                'language'            => 'en',
                'header'              => 'BUY NOW',
                'body'                => "YOU MUST BUY THIS NOW!!! Limited time ONLY! ACT IMMEDIATELY before it's TOO LATE!!!",
                'footer'              => null,
                'buttons'             => [
                    ['type' => 'QUICK_REPLY', 'text' => 'Buy Now'],
                ],
                'source'              => 'manual',
                'status'              => 'rejected',
                'rejection_reason'    => 'Template uses aggressive language and excessive capitalization which violates WhatsApp Business messaging policies.',
                'ai_compliance_score' => 22,
                'usage_count'         => 0,
            ],
            [
                'name'                => 'Telegram Welcome',
                'channel'             => 'telegram',
                'language'            => 'en',
                'header'              => null,
                'body'                => "👋 Welcome to BlastBot, {{1}}!\n\nYou are now connected to our Telegram channel. Here is what to expect:\n\n✅ Exclusive deals\n📢 Product updates\n🎁 Member-only offers\n\nStay tuned!",
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
                'body'                => "🔥 *Special Offer* — This Weekend Only!\n\nHey {{1}}! Get *50% off* our premium plan.\n\n💳 Use code: *TG50*\n⏳ Valid until Sunday\n\nDon't miss out — limited slots available!",
                'footer'              => null,
                'buttons'             => [],
                'source'              => 'ai_generated',
                'status'              => 'approved',
                'ai_compliance_score' => 92,
                'usage_count'         => 76,
            ],
            [
                'name'                => 'Telegram Update',
                'channel'             => 'telegram',
                'language'            => 'en',
                'header'              => null,
                'body'                => "📣 *New Update Available!*\n\nHi {{1}},\n\nWe have just released an update with exciting new features:\n\n🆕 {{2}}\n🐛 Bug fixes and performance improvements\n\nUpdate now to enjoy the latest features!",
                'footer'              => null,
                'buttons'             => [],
                'source'              => 'manual',
                'status'              => 'approved',
                'ai_compliance_score' => 95,
                'usage_count'         => 54,
            ],
        ];

        foreach ($templates as $data) {
            Template::updateOrCreate(
                ['name' => $data['name'], 'channel' => $data['channel']],
                $data
            );
        }

        $this->command->info('TemplateSeeder: ' . count($templates) . ' templates seeded.');
    }
}
