<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use App\Services\MailConfigService;
use App\Services\SettingsService;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        if ($this->app->runningInConsole() === false) {
            try {
                MailConfigService::configure();
            } catch (\Exception $e) {
            }
        }

        User::observe(UserObserver::class);

        Inertia::share([
            'settings' => function () {
                return [
                    'general' => SettingsService::getGeneralSettings(),
                ];
            },
        ]);
    }
}
