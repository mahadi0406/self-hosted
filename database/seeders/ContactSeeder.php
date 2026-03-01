<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contact;
use App\Models\ContactList;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = [
            ['name' => 'James Wilson',    'phone' => '+12125550101', 'telegram_id' => null,        'email' => 'james.wilson@email.com',   'country' => 'US', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['vip', 'customer'],    'last_messaged_at' => now()->subHours(2)],
            ['name' => 'Fatima Al-Zahra','phone' => '+971501234567','telegram_id' => null,         'email' => 'fatima@email.com',         'country' => 'AE', 'language' => 'ar', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['vip', 'lead'],        'last_messaged_at' => now()->subHours(5)],
            ['name' => 'Rahul Sharma',   'phone' => '+919876543210','telegram_id' => null,         'email' => 'rahul.s@email.com',        'country' => 'IN', 'language' => 'hi', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['customer'],           'last_messaged_at' => now()->subDay()],
            ['name' => 'Sophie Martin',  'phone' => '+33612345678', 'telegram_id' => null,         'email' => 'sophie.m@email.com',       'country' => 'FR', 'language' => 'fr', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['newsletter'],         'last_messaged_at' => now()->subDays(2)],
            ['name' => 'Carlos Rivera',  'phone' => '+5491112345678','telegram_id' => null,        'email' => 'carlos.r@email.com',       'country' => 'AR', 'language' => 'es', 'status' => 'active',   'ai_engagement_label' => 'cold', 'tags' => ['lead'],               'last_messaged_at' => now()->subDays(10)],
            ['name' => 'Mei Lin',        'phone' => null,           'telegram_id' => '987654321',  'email' => 'mei.lin@email.com',        'country' => 'SG', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['vip', 'customer'],    'last_messaged_at' => now()->subHours(1)],
            ['name' => 'Ahmed Hassan',   'phone' => '+201012345678','telegram_id' => null,         'email' => 'ahmed.h@email.com',        'country' => 'EG', 'language' => 'ar', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['customer', 'lead'],   'last_messaged_at' => now()->subDays(3)],
            ['name' => 'Priya Patel',    'phone' => '+919988776655','telegram_id' => '111222333',  'email' => 'priya.p@email.com',        'country' => 'IN', 'language' => 'hi', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['newsletter', 'vip'],  'last_messaged_at' => now()->subHours(3)],
            ['name' => 'Lucas Schmidt',  'phone' => '+4915123456789','telegram_id' => null,        'email' => 'lucas.s@email.com',        'country' => 'DE', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'cold', 'tags' => ['lead'],               'last_messaged_at' => now()->subDays(15)],
            ['name' => 'Aisha Mohammed', 'phone' => '+971521234567','telegram_id' => null,         'email' => 'aisha.m@email.com',        'country' => 'AE', 'language' => 'ar', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['customer'],           'last_messaged_at' => now()->subDays(4)],
            ['name' => 'Tom Baker',      'phone' => '+447911123456','telegram_id' => null,         'email' => 'tom.b@email.com',          'country' => 'GB', 'language' => 'en', 'status' => 'opted_out','ai_engagement_label' => null,   'tags' => ['newsletter'],         'last_messaged_at' => now()->subDays(20)],
            ['name' => 'Yuki Tanaka',    'phone' => null,           'telegram_id' => '444555666',  'email' => 'yuki.t@email.com',         'country' => 'JP', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['customer'],           'last_messaged_at' => now()->subDays(5)],
            ['name' => 'Diego Fernandez','phone' => '+5511987654321','telegram_id' => null,        'email' => 'diego.f@email.com',        'country' => 'BR', 'language' => 'pt', 'status' => 'active',   'ai_engagement_label' => 'cold', 'tags' => ['lead'],               'last_messaged_at' => now()->subDays(12)],
            ['name' => 'Nour Khalil',    'phone' => '+96170123456', 'telegram_id' => null,         'email' => 'nour.k@email.com',         'country' => 'LB', 'language' => 'ar', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['vip', 'customer'],    'last_messaged_at' => now()->subHours(6)],
            ['name' => 'Emma Johnson',   'phone' => '+12025550199', 'telegram_id' => '777888999',  'email' => 'emma.j@email.com',         'country' => 'US', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['newsletter', 'lead'], 'last_messaged_at' => now()->subDays(7)],
            ['name' => 'Omar Siddiqui',  'phone' => '+923001234567','telegram_id' => null,         'email' => 'omar.s@email.com',         'country' => 'PK', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['customer'],           'last_messaged_at' => now()->subDays(6)],
            ['name' => 'Lin Wei',        'phone' => null,           'telegram_id' => '222333444',  'email' => 'lin.wei@email.com',        'country' => 'CN', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'cold', 'tags' => ['lead'],               'last_messaged_at' => now()->subDays(18)],
            ['name' => 'Sara Andersson', 'phone' => '+46701234567', 'telegram_id' => null,         'email' => 'sara.a@email.com',         'country' => 'SE', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'warm', 'tags' => ['newsletter'],         'last_messaged_at' => now()->subDays(8)],
            ['name' => 'Kwame Asante',   'phone' => '+233241234567','telegram_id' => null,         'email' => 'kwame.a@email.com',        'country' => 'GH', 'language' => 'en', 'status' => 'active',   'ai_engagement_label' => 'hot',  'tags' => ['vip', 'customer'],    'last_messaged_at' => now()->subHours(8)],
            ['name' => 'Isabella Costa', 'phone' => '+5521998765432','telegram_id' => null,        'email' => 'isabella.c@email.com',     'country' => 'BR', 'language' => 'pt', 'status' => 'blocked',  'ai_engagement_label' => null,   'tags' => [],                     'last_messaged_at' => now()->subDays(30)],
        ];

        $lists       = ContactList::all()->keyBy('name');
        $allList     = $lists->get('All Customers');
        $vipList     = $lists->get('VIP Members');
        $leadList    = $lists->get('Leads');
        $newsletter  = $lists->get('Newsletter');
        $telegramList= $lists->get('Telegram Audience');

        foreach ($contacts as $data) {
            $tags    = $data['tags'];
            unset($data['tags']);
            $contact = Contact::create(array_merge($data, ['tags' => $tags]));

            $syncLists = [];
            if ($allList)      $syncLists[] = $allList->id;
            if ($vipList      && in_array('vip', $tags))        $syncLists[] = $vipList->id;
            if ($leadList     && in_array('lead', $tags))       $syncLists[] = $leadList->id;
            if ($newsletter   && in_array('newsletter', $tags)) $syncLists[] = $newsletter->id;
            if ($telegramList && $contact->telegram_id)         $syncLists[] = $telegramList->id;

            if (!empty($syncLists)) {
                $contact->lists()->sync(array_unique($syncLists));
            }
        }

        // Update contact counts on lists
        ContactList::all()->each(function ($list) {
            $list->update(['contacts_count' => $list->contacts()->count()]);
        });

        $this->command->info('Contact seeder: ' . count($contacts) . ' contacts created');
    }
}
