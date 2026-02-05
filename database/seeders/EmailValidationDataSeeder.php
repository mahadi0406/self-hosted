<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DisposableDomain;
use App\Models\FreeEmailProvider;
use App\Models\RoleBasedKeyword;

class EmailValidationDataSeeder extends Seeder
{
    public function run(): void
    {
        $disposableDomains = [
            'tempmail.com', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org',
            'fakeinbox.com', 'maildrop.cc', 'getnada.com',
            'trashmail.com', 'yopmail.com', 'sharklasers.com',
        ];

        foreach ($disposableDomains as $domain) {
            DisposableDomain::firstOrCreate(['domain' => $domain]);
        }

        $freeProviders = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
            'zoho.com', 'yandex.com', 'gmx.com', 'inbox.com',
        ];

        foreach ($freeProviders as $provider) {
            FreeEmailProvider::firstOrCreate(['domain' => $provider]);
        }

        $roleKeywords = [
            'admin', 'administrator', 'info', 'support', 'help',
            'sales', 'contact', 'service', 'webmaster', 'postmaster',
            'noreply', 'no-reply', 'marketing', 'billing', 'invoice',
        ];

        foreach ($roleKeywords as $keyword) {
            RoleBasedKeyword::firstOrCreate(['keyword' => $keyword]);
        }
    }
}
