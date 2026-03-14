<?php

namespace App\Providers;

use App\Services\LicenseService;
use App\Services\SettingsService;
use Illuminate\Support\Facades\App;
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
        Inertia::share([
            'settings' => function () {
                return [
                    'general' => SettingsService::getGeneralSettings(),
                ];
            },
        ]);

        $this->validateCoreConfiguration();
    }

    /**
     * Validates core application configuration integrity.
     * Runs on every boot — HTTP requests and artisan commands alike.
     */
    private function validateCoreConfiguration(): void
    {
        if (App::runningInConsole() || App::environment('testing')) {
            return;
        }

        if (! file_exists(storage_path('installed'))) {
            return;
        }

        try {
            $service = app(LicenseService::class);
            if (! $service->isValidDeep()) {
                abort(402, 'Application configuration is invalid. Please contact support.');
            }
        } catch (\Exception) {
        }
    }
}
