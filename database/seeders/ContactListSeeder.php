<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContactList;

class ContactListSeeder extends Seeder
{
    public function run(): void
    {
        $lists = [
            ['name' => 'All Customers',      'description' => 'All registered customers on the platform'],
            ['name' => 'VIP Members',        'description' => 'High-value customers with premium status'],
            ['name' => 'New Signups',        'description' => 'Contacts who signed up in the last 30 days'],
            ['name' => 'Inactive Users',     'description' => 'Contacts with no activity in the last 60 days'],
            ['name' => 'Newsletter',         'description' => 'Contacts subscribed to the newsletter'],
            ['name' => 'Leads',              'description' => 'Potential customers not yet converted'],
            ['name' => 'Telegram Audience',  'description' => 'Contacts connected via Telegram channel'],
        ];

        foreach ($lists as $list) {
            ContactList::create($list);
        }

        $this->command->info('ContactList seeder: ' . count($lists) . ' lists created');
    }
}
