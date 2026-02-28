<?php

use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('schedule/run', function () {
    Illuminate\Support\Facades\Artisan::call('schedule:run');
});

Route::middleware(['auth','role:admin', 'throttle:200,1', 'xss', 'security.headers'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
