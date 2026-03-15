<?php

namespace App\Http\Middleware;

use App\Concerns\UploadedFile;
use App\Models\Language;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    use UploadedFile;

    private $settings = null;
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $this->loadSettings();
        $logo    = $this->getSetting('site_logo', '');
        $favicon = $this->getSetting('site_favicon', '');

        $loginFeatures = $this->getSetting('login_features');
        $features = is_array($loginFeatures)
            ? $loginFeatures
            : (is_string($loginFeatures) && $loginFeatures ? json_decode($loginFeatures, true) ?? [] : []);

        $langData = $this->loadLanguageData($request);

        $logoUrl    = $logo    ? $this->fullPath($logo)    : asset('images/default-logo.png');
        $faviconUrl = $favicon ? $this->fullPath($favicon) : asset('favicon.ico');
        view()->share(compact('logoUrl', 'faviconUrl'));

        return array_merge(parent::share($request), [
            'csrf_token'      => csrf_token(),
            'currentLanguage' => $langData['currentLanguage'],
            'languages'       => $langData['languages'],
            'translations'    => $langData['translations'],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
            ],

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'uid' => $user->uid,
                    'role' => $user->role,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar ? asset('assets/files/'.$user->avatar) : null,
                ] : null,
            ],

            'logoUrl'    => $logoUrl,
            'faviconUrl' => $faviconUrl,
            'currencySymbol' => $this->getSetting('currency_symbol', '$'),
            'currencyName' => $this->getSetting('default_currency', 'USD'),
            'appName' => $this->getSetting('site_name', 'BlastBot'),
            'primaryColor' => $this->getSetting('primary_color', '#1f2937'),

            'loginPage' => [
                'badgeText' => $this->getSetting('login_badge_text', 'AI-Powered Messaging'),
                'headline' => $this->getSetting('login_headline', 'Reach thousands'),
                'headlineHighlight' => $this->getSetting('login_headline_highlight', 'in seconds.'),
                'description' => $this->getSetting('login_description', 'The complete WhatsApp & Telegram broadcast platform with AI-driven campaign intelligence.'),
                'features' => $features,
                'demo' => [
                    'enabled' => (bool) $this->getSetting('login_demo_enabled', true),
                    'email' => $this->getSetting('login_demo_email', 'admin@blastbot.io'),
                    'password' => $this->getSetting('login_demo_password', 'password'),
                ],
            ],
        ]);
    }

    private function loadLanguageData(Request $request): array
    {
        try {
            $code = $request->session()->get('app_language', 'en');

            $currentLanguage = Cache::remember("lang_{$code}", 3600, function () use ($code) {
                return Language::where('code', $code)->where('is_active', true)->first()
                    ?? Language::where('is_default', true)->first()
                    ?? Language::first();
            });

            // Always load English (default) as the baseline fallback
            $defaultTranslations = Cache::remember('translations_fallback_en', 3600, function () {
                $jsonPath = resource_path('js/lang/en.json');
                if (file_exists($jsonPath)) {
                    return json_decode(file_get_contents($jsonPath), true) ?? [];
                }
                $default = Language::where('is_default', true)->first();
                return $default ? $default->translations()->pluck('value', 'key')->toArray() : [];
            });

            $translations = $defaultTranslations;
            if ($currentLanguage && $currentLanguage->code !== 'en') {
                $langTranslations = Cache::remember("translations_{$currentLanguage->code}", 3600, function () use ($currentLanguage) {
                    // Try DB first
                    $db = $currentLanguage->translations()->pluck('value', 'key')->toArray();
                    // If DB empty, try JSON file
                    if (empty($db)) {
                        $jsonPath = resource_path('js/lang/' . $currentLanguage->code . '.json');
                        if (file_exists($jsonPath)) {
                            return json_decode(file_get_contents($jsonPath), true) ?? [];
                        }
                    }
                    return $db;
                });
                // Merge: English fills any missing keys; current language overrides
                $translations = array_merge($defaultTranslations, $langTranslations);
            }

            $languages = Cache::remember('languages_active', 3600, function () {
                return Language::where('is_active', true)
                    ->get(['id', 'code', 'name', 'native_name', 'flag', 'is_default'])
                    ->toArray();
            });

            return [
                'currentLanguage' => $currentLanguage ? [
                    'code'        => $currentLanguage->code,
                    'name'        => $currentLanguage->name,
                    'native_name' => $currentLanguage->native_name,
                    'flag'        => $currentLanguage->flag,
                ] : ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'flag' => '🇬🇧'],
                'languages'       => $languages,
                'translations'    => $translations,
            ];
        } catch (\Exception) {
            return [
                'currentLanguage' => ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'flag' => '🇬🇧'],
                'languages'       => [['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'flag' => '🇬🇧', 'is_default' => true]],
                'translations'    => [],
            ];
        }
    }

    private function loadSettings(): void
    {
        if ($this->settings === null) {
            $this->settings = Cache::remember('all_frontend_settings', 600, function () {
                return Setting::pluck('value', 'key')->toArray();
            });
        }
    }

    private function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }
}
