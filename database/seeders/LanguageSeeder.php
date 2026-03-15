<?php

namespace Database\Seeders;

use App\Models\Language;
use App\Models\Translation;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedLanguage('en', 'English', 'English', '🇬🇧', true);
        $this->seedLanguage('es', 'Spanish', 'Español', '🇪🇸', false);
    }

    private function seedLanguage(string $code, string $name, string $nativeName, string $flag, bool $isDefault): void
    {
        $language = Language::updateOrCreate(
            ['code' => $code],
            [
                'name'        => $name,
                'native_name' => $nativeName,
                'flag'        => $flag,
                'is_default'  => $isDefault,
                'is_active'   => true,
            ]
        );

        $jsonPath = resource_path("js/lang/{$code}.json");

        if (! file_exists($jsonPath)) {
            return;
        }

        $translations = json_decode(file_get_contents($jsonPath), true) ?? [];

        foreach ($translations as $key => $value) {
            Translation::updateOrCreate(
                ['language_id' => $language->id, 'key' => $key],
                ['value'       => $value]
            );
        }
    }
}
