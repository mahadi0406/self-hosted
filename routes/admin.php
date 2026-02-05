<?php

use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ValidationController;
use Illuminate\Support\Facades\Route;

Route::get('schedule/run', function () {
    Illuminate\Support\Facades\Artisan::call('schedule:run');
});

Route::middleware(['auth','role:admin', 'throttle:200,1', 'xss', 'security.headers'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Single Validation
    Route::get('/validate/single', [ValidationController::class, 'single'])->name('validate.single');
    Route::post('/validate/single', [ValidationController::class, 'validateSingle'])->name('validate.single.process');

    // Bulk Validation
    Route::get('/validate/bulk', [ValidationController::class, 'bulk'])->name('validate.bulk');
    Route::post('/validate/bulk', [ValidationController::class, 'processBulk'])->name('validate.bulk.process');
    Route::get('/validate/bulk/status/{listId}', [ValidationController::class, 'bulkStatus'])->name('validate.bulk.status');

    // Validation History
    Route::get('/validate/history', [ValidationController::class, 'history'])->name('validate.history');
    Route::get('/validate/history/{id}', [ValidationController::class, 'show'])->name('validate.show');
    Route::delete('/validate/history/{id}', [ValidationController::class, 'destroy'])->name('validate.destroy');
    Route::post('/validate/export', [ValidationController::class, 'export'])->name('validate.export');

    //Setting
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/general', [SettingsController::class, 'updateGeneral'])->name('settings.general');
    Route::post('/settings/email', [SettingsController::class, 'updateEmail'])->name('settings.email');
    Route::post('/settings/security', [SettingsController::class, 'updateSecurity'])->name('settings.security');
    Route::post('/settings/seo', [SettingsController::class, 'updateSeo'])->name('settings.seo');
    Route::post('/settings/p2p', [SettingsController::class, 'updateP2p'])->name('settings.p2p');
    Route::post('/settings/prop-trading', [SettingsController::class, 'updatePropTrading'])->name('settings.prop-trading');
    Route::put('/settings/email-template/{emailTemplate}', [SettingsController::class, 'updateEmailTemplate'])->name('settings.email-template');
    Route::post('/settings/exchange', [SettingsController::class, 'updateExchange'])->name('settings.exchange');
    Route::post('/settings/wallet', [SettingsController::class, 'updateWallet'])->name('settings.wallet');
    Route::post('/settings/web3', [SettingsController::class, 'updateWeb3'])->name('settings.web3');
});
