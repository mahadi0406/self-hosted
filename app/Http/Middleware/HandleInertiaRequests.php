<?php

namespace App\Http\Middleware;

use App\Concerns\UploadedFile;
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

        $siteLogo = $this->getSetting('site_logo');

        $loginFeatures = $this->getSetting('login_features');
        $features = $loginFeatures ? json_decode($loginFeatures, true) : [];

        return array_merge(parent::share($request), [
            'csrf_token' => csrf_token(),
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

            'currencySymbol' => $this->getSetting('currency_symbol', '$'),
            'currencyName' => $this->getSetting('default_currency', 'USD'),
            'appName' => $this->getSetting('site_name', 'BlastBot'),
            'siteLogo' => $siteLogo ? asset('assets/files/' . $siteLogo) : null,
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
