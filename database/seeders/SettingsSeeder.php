<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $generalSettings = [
            ['key' => 'site_name',    'value' => 'BlastBot',  'type' => 'text',  'group' => 'general', 'label' => 'Site Name',    'description' => 'The name of your platform'],
            ['key' => 'site_logo',    'value' => '',          'type' => 'file',  'group' => 'general', 'label' => 'Site Logo',    'description' => 'Upload site logo image'],
            ['key' => 'site_favicon', 'value' => '',          'type' => 'file',  'group' => 'general', 'label' => 'Site Favicon', 'description' => 'Upload site favicon'],
            ['key' => 'default_timezone', 'value' => 'UTC',   'type' => 'text',  'group' => 'general', 'label' => 'Default Timezone', 'description' => 'Default platform timezone'],
        ];

        $loginPageSettings = [
            ['key' => 'login_badge_text',     'value' => 'AI-Powered Messaging', 'type' => 'text',     'group' => 'login_page', 'label' => 'Badge Text',     'description' => 'Small badge text above headline'],
            ['key' => 'login_headline',       'value' => 'Reach thousands',      'type' => 'text',     'group' => 'login_page', 'label' => 'Headline',       'description' => 'Main headline text'],
            ['key' => 'login_headline_highlight', 'value' => 'in seconds.',      'type' => 'text',     'group' => 'login_page', 'label' => 'Headline Highlight', 'description' => 'Highlighted part of headline'],
            ['key' => 'login_description',    'value' => 'The complete WhatsApp & Telegram broadcast platform with AI-driven campaign intelligence.', 'type' => 'textarea', 'group' => 'login_page', 'label' => 'Description', 'description' => 'Description text below headline'],
            ['key' => 'login_features',       'value' => json_encode([
                ['icon' => 'MessageSquare', 'label' => 'Bulk Messaging',  'desc' => 'WhatsApp & Telegram campaigns'],
                ['icon' => 'Zap',           'label' => 'AI-Powered',      'desc' => 'Smart message generation'],
                ['icon' => 'BarChart3',     'label' => 'Analytics',       'desc' => 'Real-time campaign insights'],
                ['icon' => 'Shield',        'label' => 'Secure',          'desc' => 'Enterprise-grade security'],
            ]), 'type' => 'json', 'group' => 'login_page', 'label' => 'Features', 'description' => 'Feature cards on login page (JSON array)'],
            ['key' => 'login_demo_enabled',   'value' => '1',              'type' => 'boolean',  'group' => 'login_page', 'label' => 'Show Demo Credentials', 'description' => 'Show demo credentials box'],
            ['key' => 'login_demo_email',     'value' => 'admin@blastbot.io', 'type' => 'text',  'group' => 'login_page', 'label' => 'Demo Email',     'description' => 'Demo account email'],
            ['key' => 'login_demo_password',  'value' => 'password',       'type' => 'text',     'group' => 'login_page', 'label' => 'Demo Password',  'description' => 'Demo account password'],
        ];

        $aiSettings = [
            ['key' => 'ai_provider',            'value' => 'claude',                      'type' => 'text',     'group' => 'ai', 'label' => 'AI Provider',            'description' => 'AI provider: claude or openai'],
            ['key' => 'ai_api_key',             'value' => '',                            'type' => 'password', 'group' => 'ai', 'label' => 'AI API Key',             'description' => 'Your Claude / OpenAI API key'],
            ['key' => 'ai_model',               'value' => 'claude-sonnet-4-20250514',    'type' => 'text',     'group' => 'ai', 'label' => 'AI Model',               'description' => 'AI model to use for all features'],
            ['key' => 'ai_enabled',             'value' => '1',                           'type' => 'boolean',  'group' => 'ai', 'label' => 'Enable AI',              'description' => 'Enable or disable all AI features'],
            ['key' => 'ai_auto_reply_enabled',  'value' => '0',                           'type' => 'boolean',  'group' => 'ai', 'label' => 'Enable AI Auto-Reply',   'description' => 'Automatically reply to inbound messages using AI'],
            ['key' => 'ai_auto_reply_context',  'value' => '',                            'type' => 'textarea', 'group' => 'ai', 'label' => 'AI Auto-Reply Context',  'description' => 'Business context for AI auto-replies (e.g. what your business does, tone, instructions)'],
        ];

        $whatsappSettings = [
            ['key' => 'whatsapp_enabled',     'value' => '1',      'type' => 'boolean',  'group' => 'whatsapp', 'label' => 'Enable WhatsApp',       'description' => 'Enable WhatsApp channel'],
            ['key' => 'whatsapp_api_version', 'value' => 'v19.0',  'type' => 'text',     'group' => 'whatsapp', 'label' => 'API Version',           'description' => 'Meta Cloud API version (e.g. v19.0)'],
            ['key' => 'whatsapp_verify_token','value' => '',        'type' => 'password', 'group' => 'whatsapp', 'label' => 'Webhook Verify Token',  'description' => 'Secret token used to verify your WhatsApp webhook'],
        ];

        $telegramSettings = [
            ['key' => 'telegram_enabled',      'value' => '1',  'type' => 'boolean', 'group' => 'telegram', 'label' => 'Enable Telegram',  'description' => 'Enable Telegram channel'],
            ['key' => 'telegram_webhook_mode', 'value' => '1',  'type' => 'boolean', 'group' => 'telegram', 'label' => 'Webhook Mode',     'description' => 'Use webhook instead of polling for incoming messages'],
        ];

        $campaignSettings = [
            ['key' => 'campaign_batch_size',    'value' => '100', 'type' => 'number', 'group' => 'campaign', 'label' => 'Batch Size',                  'description' => 'Number of messages sent per queue batch'],
            ['key' => 'campaign_delay_seconds', 'value' => '1',   'type' => 'number', 'group' => 'campaign', 'label' => 'Delay Between Messages (sec)', 'description' => 'Seconds to wait between each message send'],
            ['key' => 'campaign_retry_limit',   'value' => '3',   'type' => 'number', 'group' => 'campaign', 'label' => 'Retry Limit',                  'description' => 'Max retries for failed message sends'],
        ];

        $allSettings = array_merge(
            $generalSettings,
            $loginPageSettings,
            $aiSettings,
            $whatsappSettings,
            $telegramSettings,
            $campaignSettings,
        );

        foreach ($allSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Settings seeder completed successfully!');
        $this->command->info('- ' . count($allSettings) . ' settings created');
    }
}
