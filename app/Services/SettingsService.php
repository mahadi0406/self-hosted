<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    /**
     * @return array
     */
    public static function getGeneralSettings(): array
    {
        return Setting::where('group', 'general')
            ->pluck('value', 'key')
            ->toArray();
    }
}
