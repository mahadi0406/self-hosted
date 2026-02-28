<?php

use App\Http\Controllers\Admin\AiMessageWriterController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\ChannelController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\ContactListController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DripSequenceController;
use App\Http\Controllers\Admin\InboxController;
use App\Http\Controllers\Admin\TemplateController;
use Illuminate\Support\Facades\Route;

Route::get('schedule/run', function () {
    Illuminate\Support\Facades\Artisan::call('schedule:run');
});

Route::middleware(['auth','role:admin', 'throttle:200,1', 'xss', 'security.headers'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('channels')->group(function () {
        Route::get('/',[ChannelController::class, 'index'])->name('channels.index');
        Route::get('/whatsapp/create',[ChannelController::class, 'createWhatsapp']);
        Route::post('/whatsapp',[ChannelController::class, 'storeWhatsapp']);
        Route::get('/telegram/create',[ChannelController::class, 'createTelegram']);
        Route::post('/telegram',[ChannelController::class, 'storeTelegram']);
        Route::delete('/{channel}',[ChannelController::class, 'destroy']);
    });

    Route::get('/contact-lists',[ContactListController::class, 'index'])->name('contact-lists.index');
    Route::get('/contact-lists/create',[ContactListController::class, 'create']);
    Route::post('/contact-lists',[ContactListController::class, 'store']);
    Route::delete('/contact-lists/{contactList}',[ContactListController::class, 'destroy']);

    Route::get('/contacts',[ContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/create',[ContactController::class, 'create']);
    Route::post('/contacts',[ContactController::class, 'store']);
    Route::get('/contacts/import',[ContactController::class, 'importView']);
    Route::post('/contacts/import',[ContactController::class, 'import']);
    Route::delete('/contacts/{contact}',[ContactController::class, 'destroy']);

    Route::get('/templates',[TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/create',[TemplateController::class, 'create']);
    Route::post('/templates',[TemplateController::class, 'store']);
    Route::delete('/templates/{template}',[TemplateController::class, 'destroy']);

    Route::get('/campaigns',[CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/create',[CampaignController::class, 'create']);
    Route::post('/campaigns',[CampaignController::class, 'store']);
    Route::delete('/campaigns/{campaign}',[CampaignController::class, 'destroy']);

    Route::get('/drip-sequences',[DripSequenceController::class, 'index'])->name('drip-sequences.index');
    Route::get('/drip-sequences/create',[DripSequenceController::class, 'create']);
    Route::post('/drip-sequences',[DripSequenceController::class, 'store']);
    Route::delete('/drip-sequences/{dripSequence}',[DripSequenceController::class, 'destroy']);

    Route::get('/inbox',[InboxController::class, 'index'])->name('admin.inbox.index');
    Route::patch('/inbox/{inboxMessage}/read',[InboxController::class, 'markRead']);
    Route::post('/inbox/mark-all-read',[InboxController::class, 'markAllRead']);

    Route::get('/ai/message-writer',[AiMessageWriterController::class, 'index']);
    Route::post('/ai/message-writer/generate',[AiMessageWriterController::class, 'generate']);
});
