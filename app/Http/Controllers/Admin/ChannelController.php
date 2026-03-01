<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
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
            ->with('success', 'WhatsApp channel created. Click Verify to test the connection.');
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
            ->with('success', 'Telegram channel created. Click Verify to test the connection.');
    }


    public function verify(Channel $channel): JsonResponse
    {
        try {
            if ($channel->type === 'whatsapp') {
                return $this->verifyWhatsapp($channel);
            }
            if ($channel->type === 'telegram') {
                return $this->verifyTelegram($channel);
            }
            return response()->json(['success' => false, 'message' => 'Unknown channel type.'], 422);
        } catch (\Exception $e) {
            $channel->update(['status' => 'error', 'error_message' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function verifyWhatsapp(Channel $channel): JsonResponse
    {
        $credentials = $channel->credentials;
        $accessToken = $credentials['access_token'] ?? null;
        $phoneId     = $credentials['phone_id']     ?? null;

        if (!$accessToken || !$phoneId) {
            $channel->update(['status' => 'error', 'error_message' => 'Missing access token or phone ID.']);
            return response()->json(['success' => false, 'message' => 'Missing credentials.'], 422);
        }

        $response = Http::withToken($accessToken)
            ->get("https://graph.facebook.com/v19.0/{$phoneId}");

        if ($response->successful()) {
            $data = $response->json();
            $channel->update([
                'status'           => 'connected',
                'error_message'    => null,
                'last_verified_at' => now(),
                'phone_number'     => $data['display_phone_number'] ?? $channel->phone_number,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp channel connected successfully!',
                'data'    => [
                    'phone_number'   => $data['display_phone_number'] ?? null,
                    'verified_name'  => $data['verified_name']        ?? null,
                    'quality_rating' => $data['quality_rating']       ?? null,
                ],
            ]);
        }

        $error = $response->json('error.message') ?? 'Verification failed. Check your credentials.';
        $channel->update(['status' => 'error', 'error_message' => $error]);
        return response()->json(['success' => false, 'message' => $error], 422);
    }

    private function verifyTelegram(Channel $channel): JsonResponse
    {
        $botToken = $channel->bot_token;

        if (!$botToken) {
            $channel->update(['status' => 'error', 'error_message' => 'Missing bot token.']);
            return response()->json(['success' => false, 'message' => 'Missing bot token.'], 422);
        }

        $response = Http::get("https://api.telegram.org/bot{$botToken}/getMe");

        if ($response->successful() && $response->json('ok')) {
            $botInfo = $response->json('result');
            $channel->update([
                'status'           => 'connected',
                'error_message'    => null,
                'last_verified_at' => now(),
                'bot_username'     => $botInfo['username'] ?? $channel->bot_username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Telegram bot connected successfully!',
                'data'    => [
                    'bot_name'     => $botInfo['first_name'] ?? null,
                    'bot_username' => $botInfo['username']   ?? null,
                    'bot_id'       => $botInfo['id']         ?? null,
                ],
            ]);
        }

        $error = $response->json('description') ?? 'Verification failed. Check your bot token.';
        $channel->update(['status' => 'error', 'error_message' => $error]);
        return response()->json(['success' => false, 'message' => $error], 422);
    }

    // ── Disconnect ────────────────────────────────────────────────────────────

    public function disconnect(Channel $channel): JsonResponse
    {
        $channel->update(['status' => 'disconnected', 'error_message' => null]);
        return response()->json(['success' => true, 'message' => 'Channel disconnected.']);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function destroy(Channel $channel): RedirectResponse
    {
        $channel->delete();
        return redirect()->route('admin.channels.index')->with('success', 'Channel deleted successfully.');
    }
}
