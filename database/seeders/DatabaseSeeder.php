<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            AdminSeeder::class,
            ChannelSeeder::class,
            ContactListSeeder::class,
            ContactSeeder::class,
            TemplateSeeder::class,
            CampaignSeeder::class,
            DripSequenceSeeder::class,
            InboxMessageSeeder::class,
            CampaignAnalyticSeeder::class,
            AiLogSeeder::class,
        ]);
    }
}
