<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Webhook\TelegramWebhookController;
use App\Http\Controllers\Webhook\WhatsappWebhookController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect('/admin/dashboard')
        : redirect()->route('login');
});

// Webhooks
Route::get('/webhooks/whatsapp', [WhatsappWebhookController::class, 'verify']);
Route::post('/webhooks/whatsapp', [WhatsappWebhookController::class, 'receive']);
Route::post('/webhooks/telegram/{channel}', [TelegramWebhookController::class, 'receive']);

// Guest only
Route::middleware(['guest', 'throttle:10,1', 'xss'])->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login'])->name('login.post');
});

Route::get('/logout', [AdminAuthController::class, 'logout'])->name('logout')->middleware('auth');
Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth');
