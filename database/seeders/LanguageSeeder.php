<?php

namespace Database\Seeders;

use App\Models\Language;
use App\Models\Translation;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        // Create English as the default language
        $english = Language::updateOrCreate(
            ['code' => 'en'],
            [
                'name'        => 'English',
                'native_name' => 'English',
                'flag'        => '🇬🇧',
                'is_default'  => true,
                'is_active'   => true,
            ]
        );

        // Load translations from en.json
        $jsonPath = resource_path('js/lang/en.json');

        if (! file_exists($jsonPath)) {
            return;
        }

        $translations = json_decode(file_get_contents($jsonPath), true) ?? [];

        foreach ($translations as $key => $value) {
            Translation::updateOrCreate(
                ['language_id' => $english->id, 'key' => $key],
                ['value'       => $value]
            );
        }
    }
}
