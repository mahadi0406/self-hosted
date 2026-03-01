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

        $aiSettings = [
            ['key' => 'ai_provider',   'value' => 'claude',                      'type' => 'text',     'group' => 'ai', 'label' => 'AI Provider',    'description' => 'AI provider: claude or openai'],
            ['key' => 'ai_api_key',    'value' => '',                            'type' => 'password', 'group' => 'ai', 'label' => 'AI API Key',     'description' => 'Your Claude / OpenAI API key'],
            ['key' => 'ai_model',      'value' => 'claude-sonnet-4-20250514',    'type' => 'text',     'group' => 'ai', 'label' => 'AI Model',       'description' => 'AI model to use for all features'],
            ['key' => 'ai_enabled',    'value' => '1',                           'type' => 'boolean',  'group' => 'ai', 'label' => 'Enable AI',      'description' => 'Enable or disable all AI features'],
        ];

        $whatsappSettings = [
            ['key' => 'whatsapp_api_version', 'value' => 'v19.0', 'type' => 'text',     'group' => 'whatsapp', 'label' => 'WhatsApp API Version', 'description' => 'Meta Cloud API version'],
            ['key' => 'whatsapp_verify_token','value' => '',       'type' => 'text',     'group' => 'whatsapp', 'label' => 'Webhook Verify Token',  'description' => 'Token used to verify WhatsApp webhook'],
            ['key' => 'whatsapp_enabled',     'value' => '1',      'type' => 'boolean',  'group' => 'whatsapp', 'label' => 'Enable WhatsApp',       'description' => 'Enable WhatsApp channel'],
        ];

        $telegramSettings = [
            ['key' => 'telegram_enabled',      'value' => '1',  'type' => 'boolean', 'group' => 'telegram', 'label' => 'Enable Telegram',       'description' => 'Enable Telegram channel'],
            ['key' => 'telegram_webhook_mode', 'value' => '1',  'type' => 'boolean', 'group' => 'telegram', 'label' => 'Webhook Mode',          'description' => 'Use webhook instead of polling'],
        ];

        $campaignSettings = [
            ['key' => 'campaign_batch_size',    'value' => '100', 'type' => 'number',  'group' => 'campaign', 'label' => 'Batch Size',          'description' => 'Messages sent per queue batch'],
            ['key' => 'campaign_delay_seconds', 'value' => '1',   'type' => 'number',  'group' => 'campaign', 'label' => 'Delay Between Messages (s)', 'description' => 'Seconds delay between each message send'],
            ['key' => 'campaign_retry_limit',   'value' => '3',   'type' => 'number',  'group' => 'campaign', 'label' => 'Retry Limit',         'description' => 'Max retries for failed messages'],
        ];

        $allSettings = array_merge(
            $generalSettings,
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
