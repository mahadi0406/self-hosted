<?php

use App\Http\Controllers\Admin\ChannelController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\ContactListController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('schedule/run', function () {
    Illuminate\Support\Facades\Artisan::call('schedule:run');
});

Route::middleware(['auth','role:admin', 'throttle:200,1', 'xss', 'security.headers'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('channels')->group(function () {
        Route::get('/',[ChannelController::class, 'index'])->name('admin.channels.index');
        Route::get('/whatsapp/create',[ChannelController::class, 'createWhatsapp']);
        Route::post('/whatsapp',[ChannelController::class, 'storeWhatsapp']);
        Route::get('/telegram/create',[ChannelController::class, 'createTelegram']);
        Route::post('/telegram',[ChannelController::class, 'storeTelegram']);
        Route::delete('/{channel}',[ChannelController::class, 'destroy']);
    });

    Route::get('/contact-lists',[ContactListController::class, 'index'])->name('admin.contact-lists.index');
    Route::get('/contact-lists/create',[ContactListController::class, 'create']);
    Route::post('/contact-lists',[ContactListController::class, 'store']);
    Route::delete('/contact-lists/{contactList}',[ContactListController::class, 'destroy']);

    Route::get('/contacts',[ContactController::class, 'index'])->name('admin.contacts.index');
    Route::get('/contacts/create',[ContactController::class, 'create']);
    Route::post('/contacts',[ContactController::class, 'store']);
    Route::get('/contacts/import',[ContactController::class, 'importView']);
    Route::post('/contacts/import',[ContactController::class, 'import']);
    Route::delete('/contacts/{contact}',[ContactController::class, 'destroy']);
});
