<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
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

        $emailTemplates = [
            [
                'slug' => 'welcome',
                'name' => 'Welcome Email',
                'subject' => 'Welcome to {site_name}!',
                'body' => '<h1>Welcome {user_name}!</h1><p>Thank you for joining {site_name}. We are excited to have you on board.</p><p>Your account has been successfully created.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name'],
                'is_active' => true
            ],
            [
                'slug' => 'password_reset',
                'name' => 'Password Reset',
                'subject' => 'Reset Your Password - {site_name}',
                'body' => '<h1>Password Reset Request</h1><p>Hi {user_name},</p><p>You have requested to reset your password. Click the link below to reset it:</p><p><a href="{reset_link}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'reset_link'],
                'is_active' => true
            ],
            [
                'slug' => 'p2p_trade_created',
                'name' => 'P2P Trade Created',
                'subject' => 'New P2P Trade Created - {site_name}',
                'body' => '<h1>P2P Trade Created</h1><p>Hi {user_name},</p><p>A new P2P trade has been created.</p><p><strong>Trade Details:</strong></p><ul><li>Trade Number: {trade_number}</li><li>Amount: {crypto_amount} {crypto_currency}</li><li>Price: {fiat_amount} {fiat_currency}</li></ul><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'trade_number', 'crypto_amount', 'crypto_currency', 'fiat_amount', 'fiat_currency'],
                'is_active' => true
            ],
            [
                'slug' => 'p2p_trade_completed',
                'name' => 'P2P Trade Completed',
                'subject' => 'P2P Trade Completed - {site_name}',
                'body' => '<h1>P2P Trade Completed</h1><p>Hi {user_name},</p><p>Your P2P trade has been completed successfully.</p><p><strong>Trade Details:</strong></p><ul><li>Trade Number: {trade_number}</li><li>Amount: {crypto_amount} {crypto_currency}</li></ul><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'trade_number', 'crypto_amount', 'crypto_currency'],
                'is_active' => true
            ],
            [
                'slug' => 'p2p_dispute_opened',
                'name' => 'P2P Dispute Opened',
                'subject' => 'Dispute Opened - {site_name}',
                'body' => '<h1>Dispute Opened</h1><p>Hi {user_name},</p><p>A dispute has been opened for your P2P trade.</p><p><strong>Dispute Details:</strong></p><ul><li>Dispute Number: {dispute_number}</li><li>Trade Number: {trade_number}</li><li>Reason: {reason}</li></ul><p>Our support team will review this dispute.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'dispute_number', 'trade_number', 'reason'],
                'is_active' => true
            ],
            [
                'slug' => 'kyc_approved',
                'name' => 'KYC Approved',
                'subject' => 'KYC Verification Approved - {site_name}',
                'body' => '<h1>KYC Verification Approved</h1><p>Hi {user_name},</p><p>Great news! Your KYC verification has been approved.</p><p>You now have full access to all platform features.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name'],
                'is_active' => true
            ],
            [
                'slug' => 'kyc_rejected',
                'name' => 'KYC Rejected',
                'subject' => 'KYC Verification Declined - {site_name}',
                'body' => '<h1>KYC Verification Declined</h1><p>Hi {user_name},</p><p>Unfortunately, your KYC verification has been declined.</p><p>Reason: {rejection_reason}</p><p>Please resubmit your documents or contact support.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'rejection_reason'],
                'is_active' => true
            ],
            [
                'slug' => 'exchange_order_created',
                'name' => 'Exchange Order Created',
                'subject' => 'Exchange Order Placed - {site_name}',
                'body' => '<h1>Exchange Order Created</h1><p>Hi {user_name},</p><p>Your exchange order has been placed successfully.</p><p><strong>Order Details:</strong></p><ul><li>Order Number: {order_number}</li><li>From: {from_amount} {from_currency}</li><li>To: {to_amount} {to_currency}</li><li>Rate: {exchange_rate}</li><li>Status: {status}</li></ul><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'order_number', 'from_amount', 'from_currency', 'to_amount', 'to_currency', 'exchange_rate', 'status'],
                'is_active' => true
            ],
            [
                'slug' => 'exchange_order_completed',
                'name' => 'Exchange Order Completed',
                'subject' => 'Exchange Completed Successfully - {site_name}',
                'body' => '<h1>Exchange Order Completed</h1><p>Hi {user_name},</p><p>Your exchange order has been completed successfully.</p><p><strong>Order Details:</strong></p><ul><li>Order Number: {order_number}</li><li>Exchanged: {from_amount} {from_currency}</li><li>Received: {to_amount} {to_currency}</li><li>Fee: {fee_amount}</li></ul><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'order_number', 'from_amount', 'from_currency', 'to_amount', 'to_currency', 'fee_amount'],
                'is_active' => true
            ],
            [
                'slug' => 'exchange_price_alert',
                'name' => 'Exchange Price Alert',
                'subject' => 'Price Alert Triggered - {site_name}',
                'body' => '<h1>Price Alert Triggered</h1><p>Hi {user_name},</p><p>Your price alert has been triggered!</p><p><strong>Alert Details:</strong></p><ul><li>Pair: {pair_symbol}</li><li>Target Price: {target_price}</li><li>Current Price: {current_price}</li><li>Condition: {condition}</li></ul><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'pair_symbol', 'target_price', 'current_price', 'condition'],
                'is_active' => true
            ],
            [
                'slug' => 'deposit_initiated',
                'name' => 'Deposit Initiated',
                'subject' => 'Deposit Request Received - {site_name}',
                'body' => '<h1>Deposit Request Received</h1><p>Hi {user_name},</p><p>We have received your deposit request.</p><p><strong>Deposit Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Payment Method: {payment_method}</li><li>Status: Pending</li></ul><p>Your deposit will be processed shortly. You will receive a confirmation email once it has been approved.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'payment_method'],
                'is_active' => true
            ],
            [
                'slug' => 'deposit_approved',
                'name' => 'Deposit Approved',
                'subject' => 'Deposit Approved - {site_name}',
                'body' => '<h1>Deposit Approved</h1><p>Hi {user_name},</p><p>Great news! Your deposit has been approved and credited to your account.</p><p><strong>Deposit Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Payment Method: {payment_method}</li><li>Status: Completed</li></ul><p>Your new balance is: {new_balance} {currency}</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'payment_method', 'new_balance'],
                'is_active' => true
            ],
            [
                'slug' => 'deposit_rejected',
                'name' => 'Deposit Rejected',
                'subject' => 'Deposit Declined - {site_name}',
                'body' => '<h1>Deposit Declined</h1><p>Hi {user_name},</p><p>Unfortunately, your deposit request has been declined.</p><p><strong>Deposit Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Payment Method: {payment_method}</li><li>Status: Rejected</li></ul><p><strong>Reason:</strong> {rejection_reason}</p><p>If you have any questions, please contact our support team.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'payment_method', 'rejection_reason'],
                'is_active' => true
            ],
            [
                'slug' => 'withdrawal_initiated',
                'name' => 'Withdrawal Initiated',
                'subject' => 'Withdrawal Request Received - {site_name}',
                'body' => '<h1>Withdrawal Request Received</h1><p>Hi {user_name},</p><p>We have received your withdrawal request.</p><p><strong>Withdrawal Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Withdrawal Method: {withdrawal_method}</li><li>Fee: {fee_amount}</li><li>Net Amount: {net_amount}</li><li>Status: Pending</li></ul><p>Your withdrawal is being processed. You will receive a confirmation email once it has been approved.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'withdrawal_method', 'fee_amount', 'net_amount'],
                'is_active' => true
            ],
            [
                'slug' => 'withdrawal_approved',
                'name' => 'Withdrawal Approved',
                'subject' => 'Withdrawal Approved - {site_name}',
                'body' => '<h1>Withdrawal Approved</h1><p>Hi {user_name},</p><p>Your withdrawal request has been approved and processed.</p><p><strong>Withdrawal Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Withdrawal Method: {withdrawal_method}</li><li>Fee: {fee_amount}</li><li>Net Amount: {net_amount}</li><li>Status: Completed</li></ul><p>The funds have been sent to your designated account/address.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'withdrawal_method', 'fee_amount', 'net_amount'],
                'is_active' => true
            ],
            [
                'slug' => 'withdrawal_rejected',
                'name' => 'Withdrawal Rejected',
                'subject' => 'Withdrawal Declined - {site_name}',
                'body' => '<h1>Withdrawal Declined</h1><p>Hi {user_name},</p><p>Unfortunately, your withdrawal request has been declined.</p><p><strong>Withdrawal Details:</strong></p><ul><li>Transaction Number: {transaction_number}</li><li>Amount: {amount} {currency}</li><li>Withdrawal Method: {withdrawal_method}</li><li>Status: Rejected</li></ul><p><strong>Reason:</strong> {rejection_reason}</p><p>The amount has been refunded to your account balance.</p><p>If you have any questions, please contact our support team.</p><p>Best regards,<br>The {site_name} Team</p>',
                'variables' => ['user_name', 'site_name', 'transaction_number', 'amount', 'currency', 'withdrawal_method', 'rejection_reason'],
                'is_active' => true
            ],
        ];

        foreach ($emailTemplates as $template) {
            EmailTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }

        $this->command->info('Settings seeder completed successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($allSettings) . ' system settings');
        $this->command->info('- ' . count($emailTemplates) . ' email templates');
    }
}
