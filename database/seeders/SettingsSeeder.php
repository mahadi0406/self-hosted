<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds
     */
    public function run(): void
    {
        $generalSettings = [
            ['key' => 'site_name', 'value' => 'PeerSwap', 'type' => 'text', 'group' => 'general', 'label' => 'Site Name', 'description' => 'The name of your platform'],
            ['key' => 'site_logo', 'value' => '', 'type' => 'file', 'group' => 'general', 'label' => 'Site Logo', 'description' => 'Upload site logo image'],
            ['key' => 'site_favicon', 'value' => '', 'type' => 'file', 'group' => 'general', 'label' => 'Site Favicon', 'description' => 'Upload site favicon (16x16 or 32x32 pixels)'],
            ['key' => 'primary_color', 'value' => '#c1a4e8', 'type' => 'color', 'group' => 'general', 'label' => 'Primary Theme Color', 'description' => 'Primary color for the theme'],
            ['key' => 'user_registration', 'value' => '1', 'type' => 'boolean', 'group' => 'general', 'label' => 'User Registration', 'description' => 'Allow new user registration'],
            ['key' => 'default_currency', 'value' => 'USD', 'type' => 'text', 'group' => 'general', 'label' => 'Default Currency', 'description' => 'Default platform currency code (e.g., USD, EUR, GBP)'],
            ['key' => 'currency_symbol', 'value' => '$', 'type' => 'text', 'group' => 'general', 'label' => 'Currency Symbol', 'description' => 'Currency symbol for display (e.g., $, €, £)'],
            ['key' => 'default_timezone', 'value' => 'UTC', 'type' => 'text', 'group' => 'general', 'label' => 'Default Timezone', 'description' => 'Default platform timezone'],
            ['key' => 'tawk_property_id', 'value' => '', 'type' => 'text', 'group' => 'general', 'label' => 'Tawk Property ID', 'description' => 'Tawk.to Property ID'],
            ['key' => 'tawk_widget_id', 'value' => '', 'type' => 'text', 'group' => 'general', 'label' => 'Tawk Widget ID', 'description' => 'Tawk.to Widget ID'],
            ['key' => 'walletconnect_project_id', 'value' => '', 'type' => 'text', 'group' => 'web3', 'label' => 'WalletConnect Project ID', 'description' => 'Your WalletConnect Cloud Project ID (Get from https://cloud.walletconnect.com)'],
        ];

        $walletSettings = [
            ['key' => 'withdrawal_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'wallet', 'label' => 'Enable Withdrawals', 'description' => 'Enable or disable wallet withdrawals'],
            ['key' => 'withdrawal_min_amount', 'value' => '10', 'type' => 'number', 'group' => 'wallet', 'label' => 'Minimum Withdrawal Amount', 'description' => 'Minimum amount for withdrawals'],
            ['key' => 'withdrawal_crypto_fee_percentage', 'value' => '0.5', 'type' => 'number', 'group' => 'wallet', 'label' => 'Crypto Withdrawal Fee (%)', 'description' => 'Fee percentage for crypto withdrawals'],
            ['key' => 'withdrawal_crypto_fee_fixed', 'value' => '0.0001', 'type' => 'number', 'group' => 'wallet', 'label' => 'Crypto Withdrawal Fixed Fee', 'description' => 'Minimum fixed fee for crypto withdrawals'],
            ['key' => 'withdrawal_fiat_fee_percentage', 'value' => '1', 'type' => 'number', 'group' => 'wallet', 'label' => 'Fiat Withdrawal Fee (%)', 'description' => 'Fee percentage for fiat withdrawals'],
            ['key' => 'withdrawal_fiat_fee_fixed', 'value' => '1', 'type' => 'number', 'group' => 'wallet', 'label' => 'Fiat Withdrawal Fixed Fee', 'description' => 'Minimum fixed fee for fiat withdrawals'],
        ];

        $emailSettings = [
            ['key' => 'mail_driver', 'value' => 'smtp', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Driver', 'description' => 'Email service provider'],
            ['key' => 'mail_host', 'value' => 'sandbox.smtp.mailtrap.io', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Host', 'description' => 'SMTP server host'],
            ['key' => 'mail_port', 'value' => '2525', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Port', 'description' => 'SMTP server port'],
            ['key' => 'mail_username', 'value' => '', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Username', 'description' => 'SMTP username'],
            ['key' => 'mail_password', 'value' => '', 'type' => 'password', 'group' => 'email', 'label' => 'Mail Password', 'description' => 'SMTP password'],
            ['key' => 'mail_encryption', 'value' => 'ssl', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Encryption', 'description' => 'Email encryption method'],
            ['key' => 'mail_from_address', 'value' => 'support@p2p.xyz', 'type' => 'text', 'group' => 'email', 'label' => 'From Email', 'description' => 'Default sender email'],
            ['key' => 'mail_from_name', 'value' => 'P2P', 'type' => 'text', 'group' => 'email', 'label' => 'From Name', 'description' => 'Default sender name'],
        ];

        $securitySettings = [
            ['key' => 'two_factor_auth', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'label' => 'Two Factor Auth', 'description' => 'Enable 2FA for users'],
            ['key' => 'login_attempts', 'value' => '5', 'type' => 'text', 'group' => 'security', 'label' => 'Max Login Attempts', 'description' => 'Maximum failed login attempts'],
            ['key' => 'session_timeout', 'value' => '60', 'type' => 'text', 'group' => 'security', 'label' => 'Session Timeout', 'description' => 'Session timeout in minutes'],
            ['key' => 'password_min_length', 'value' => '8', 'type' => 'text', 'group' => 'security', 'label' => 'Min Password Length', 'description' => 'Minimum password length'],
            ['key' => 'require_email_verification', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'label' => 'Email Verification', 'description' => 'Require email verification for new users'],
            ['key' => 'kyc_status', 'value' => '0', 'type' => 'boolean', 'group' => 'security', 'label' => 'KYC Verification', 'description' => 'Enable KYC verification for users'],
        ];

        $seoSettings = [
            ['key' => 'meta_title', 'value' => 'PeerSwap – Web3 P2P Trading & Spot Exchange Platform with Escrow', 'type' => 'text', 'group' => 'seo', 'label' => 'Meta Title', 'description' => 'SEO meta title for homepage'],
            ['key' => 'meta_description', 'value' => 'PeerSwap – Secure Web3 platform for P2P trading and spot exchange with built-in escrow protection and multi-currency wallet management.', 'type' => 'textarea', 'group' => 'seo', 'label' => 'Meta Description', 'description' => 'SEO meta description for homepage'],
            ['key' => 'meta_keywords', 'value' => 'peerswap, web3, p2p trading, spot exchange, cryptocurrency exchange, escrow trading, crypto wallet, peer to peer trading, decentralized exchange, crypto platform', 'type' => 'textarea', 'group' => 'seo', 'label' => 'Meta Keywords', 'description' => 'SEO meta keywords (comma separated)'],
            ['key' => 'og_title', 'value' => 'PeerSwap - Web3 P2P & Spot Exchange with Escrow', 'type' => 'text', 'group' => 'seo', 'label' => 'Open Graph Title', 'description' => 'Social media title'],
            ['key' => 'og_description', 'value' => 'Trade securely with PeerSwap – Web3 platform featuring P2P trading, spot exchange, and escrow protection for safe transactions.', 'type' => 'textarea', 'group' => 'seo', 'label' => 'Open Graph Description', 'description' => 'Social media description'],
            ['key' => 'og_image', 'value' => '', 'type' => 'file', 'group' => 'seo', 'label' => 'Open Graph Image', 'description' => 'Social media sharing image (recommended 1200x630 pixels)'],
            ['key' => 'google_analytics', 'value' => '', 'type' => 'text', 'group' => 'seo', 'label' => 'Google Analytics ID', 'description' => 'Google Analytics tracking ID (GA4)'],
        ];

        $p2pSettings = [
            ['key' => 'p2p_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'p2p', 'label' => 'Enable P2P Trading', 'description' => 'Enable or disable P2P trading feature'],
            ['key' => 'p2p_fee_percentage', 'value' => '1', 'type' => 'number', 'group' => 'p2p', 'label' => 'P2P Fee Percentage', 'description' => 'Fee percentage for P2P trades'],
            ['key' => 'p2p_default_time_limit', 'value' => '15', 'type' => 'number', 'group' => 'p2p', 'label' => 'Default Time Limit (minutes)', 'description' => 'Default time limit for P2P trades'],
        ];

        $exchangeSettings = [
            ['key' => 'exchange_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'exchange', 'label' => 'Enable Currency Exchange', 'description' => 'Enable or disable currency exchange feature'],
            ['key' => 'exchange_fee_percentage', 'value' => '0.5', 'type' => 'number', 'group' => 'exchange', 'label' => 'Exchange Fee Percentage', 'description' => 'Default fee percentage for exchanges'],
            ['key' => 'exchange_daily_limit', 'value' => '50000', 'type' => 'number', 'group' => 'exchange', 'label' => 'Daily Exchange Limit', 'description' => 'Maximum daily exchange volume per user'],
            ['key' => 'exchange_price_alerts_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'exchange', 'label' => 'Enable Price Alerts', 'description' => 'Allow users to set price alerts'],
        ];

        $allSettings = array_merge(
            $generalSettings,
            $emailSettings,
            $securitySettings,
            $seoSettings,
            $p2pSettings,
            $exchangeSettings,
            $walletSettings,
        );

        foreach ($allSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }


        $this->command->info('Settings seeder completed successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($allSettings) . ' system settings');
    }
}
