<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class MailConfigService
{

    /**
     * @return bool
     */
    public static function configure(): bool
    {
        try {
            $mailDriver = Setting::get('mail_driver', 'smtp');
            $mailHost = Setting::get('mail_host', 'localhost');
            $mailPort = Setting::get('mail_port', '587');
            $mailUsername = Setting::get('mail_username', '');
            $mailPassword = Setting::get('mail_password', '');
            $mailEncryption = Setting::get('mail_encryption', 'tls');
            $mailFromAddress = Setting::get('mail_from_address', 'noreply@example.com');
            $mailFromName = Setting::get('mail_from_name', 'Laravel App');
            $defaultTimezone = Setting::get('default_timezone', 'UTC');

            Config::set('mail.default', $mailDriver);
            Config::set('mail.mailers.smtp.host', $mailHost);
            Config::set('mail.mailers.smtp.port', (int) $mailPort);
            Config::set('mail.mailers.smtp.username', $mailUsername);
            Config::set('mail.mailers.smtp.password', $mailPassword);
            Config::set('mail.mailers.smtp.encryption', $mailEncryption);
            Config::set('mail.from.address', $mailFromAddress);
            Config::set('mail.from.name', $mailFromName);
            Config::set('app.timezone', $defaultTimezone);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to configure mail settings: ' . $e->getMessage());
            return false;
        }
    }
}
