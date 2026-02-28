<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ChannelController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Channel::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('phone_number', 'like', "%{$request->search}%")
                    ->orWhere('bot_username', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $channels = $query->latest()->paginate(15)->withQueryString()
            ->through(fn($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'type'             => $c->type,
                'phone_number'     => $c->phone_number,
                'bot_username'     => $c->bot_username,
                'status'           => $c->status,
                'error_message'    => $c->error_message,
                'last_verified_at' => $c->last_verified_at?->format('Y-m-d H:i'),
                'created_at'       => $c->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'     => Channel::count(),
            'connected' => Channel::where('status', 'connected')->count(),
            'whatsapp'  => Channel::where('type', 'whatsapp')->count(),
            'telegram'  => Channel::where('type', 'telegram')->count(),
        ];

        return Inertia::render('Admin/Channels/Index', [
            'channels' => $channels,
            'stats'    => $stats,
            'filters'  => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function createWhatsapp(): Response
    {
        return Inertia::render('Admin/Channels/WhatsappCreate');
    }

    public function createTelegram(): Response
    {
        return Inertia::render('Admin/Channels/TelegramCreate');
    }

    public function storeWhatsapp(Request $request): RedirectResponse
    {
        $request->validate([
            'name'                     => 'required|string|max:255',
            'phone_number'             => 'required|string',
            'credentials.access_token' => 'required|string',
            'credentials.waba_id'      => 'required|string',
            'credentials.phone_id'     => 'required|string',
        ]);

        Channel::create([
            'name'         => $request->name,
            'type'         => 'whatsapp',
            'phone_number' => $request->phone_number,
            'credentials'  => $request->credentials,
            'status'       => 'disconnected',
        ]);

        return redirect()->route('admin.channels.index')
            ->with('success', 'WhatsApp channel created successfully.');
    }

    public function storeTelegram(Request $request): RedirectResponse
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'bot_token'    => 'required|string',
            'bot_username' => 'required|string',
        ]);

        Channel::create([
            'name'         => $request->name,
            'type'         => 'telegram',
            'bot_token'    => $request->bot_token,
            'bot_username' => $request->bot_username,
            'status'       => 'disconnected',
        ]);

        return redirect()->route('admin.channels.index')
            ->with('success', 'Telegram channel created successfully.');
    }

    public function destroy(Channel $channel): RedirectResponse
    {
        $channel->delete();

        return redirect()->route('admin.channels.index')
            ->with('success', 'Channel deleted successfully.');
    }
}
