<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Webhook\TelegramWebhookController;
use App\Http\Controllers\Webhook\WhatsappWebhookController;
use Illuminate\Support\Facades\Route;

Route::get( '/webhooks/whatsapp',[WhatsappWebhookController::class, 'verify']);
Route::post('/webhooks/whatsapp',[WhatsappWebhookController::class, 'receive']);
Route::post('/webhooks/telegram/{channel}',[TelegramWebhookController::class, 'receive']);

Route::middleware(['guest', 'throttle:10,1', 'xss'])->group(function () {
    Route::get('/admin', [AdminAuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login.post');
});
