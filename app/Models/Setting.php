<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description'
    ];

    public static function get(string $key, $default = null)
    {
        return Cache::remember('all_frontend_settings', 3600, function () {
            return static::all()->mapWithKeys(function ($setting) {
                $value = match ($setting->type) {
                    'boolean' => (bool) $setting->value,
                    'integer' => (int) $setting->value,
                    'float' => (float) $setting->value,
                    'json' => json_decode($setting->value, true),
                    default => $setting->value
                };

                return [$setting->key => $value];
            });
        })[$key] ?? $default;
    }

    public static function set($key, $value, $type = 'text', $label = null, $group = 'general'): void
    {
        $setting = self::where('key', $key)->first();

        $processedValue = match($type) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => $value
        };

        if ($setting) {
            $setting->update(['value' => $processedValue]);
        } else {
            self::create([
                'key' => $key,
                'value' => $processedValue,
                'type' => $type,
                'label' => $label ?: ucwords(str_replace('_', ' ', $key)),
                'group' => $group
            ]);
        }

        self::clearCache();
    }

    public static function getByGroup($group)
    {
        $allSettings = Cache::remember('all_frontend_settings', 3600, function () {
            return static::all();
        });

        return $allSettings->where('group', $group)->mapWithKeys(function ($setting) {
            $value = match($setting->type) {
                'boolean' => (bool) $setting->value,
                'json' => json_decode($setting->value, true),
                default => $setting->value
            };

            return [$setting->key => $value];
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('all_frontend_settings');
    }
}
