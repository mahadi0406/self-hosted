<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InboxMessage;
use App\Models\Channel;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class InboxController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InboxMessage::with('contact', 'channel')
            ->where('direction', 'inbound');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('body', 'like', "%{$request->search}%")
                    ->orWhereHas('contact', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
            });
        }

        if ($request->filled('channel_id') && $request->channel_id !== 'all') {
            $query->where('channel_id', $request->channel_id);
        }

        if ($request->filled('ai_intent') && $request->ai_intent !== 'all') {
            $query->where('ai_intent', $request->ai_intent);
        }

        if ($request->filled('is_read') && $request->is_read !== 'all') {
            $query->where('is_read', $request->is_read === 'read');
        }

        $messages = $query->latest('received_at')->paginate(20)->withQueryString()
            ->through(fn($m) => [
                'id'                 => $m->id,
                'contact_id'         => $m->contact_id,
                'contact_name'       => $m->contact->name,
                'contact_phone'      => $m->contact->phone,
                'channel_id'         => $m->channel_id,
                'channel_name'       => $m->channel->name,
                'channel_type'       => $m->channel->type,
                'body'               => $m->body,
                'type'               => $m->type,
                'media_url'          => $m->media_url,
                'ai_intent'          => $m->ai_intent,
                'ai_suggested_reply' => $m->ai_suggested_reply,
                'is_read'            => $m->is_read,
                'received_at'        => $m->received_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total_inbound' => InboxMessage::where('direction', 'inbound')->count(),
            'unread'        => InboxMessage::where('direction', 'inbound')->where('is_read', false)->count(),
            'today'         => InboxMessage::where('direction', 'inbound')->whereDate('received_at', today())->count(),
            'ai_classified' => InboxMessage::where('direction', 'inbound')->whereNotNull('ai_intent')->count(),
        ];

        $channels = Channel::where('status', 'connected')->select('id', 'name', 'type')->get();

        return Inertia::render('Admin/Inbox/Index', [
            'messages' => $messages,
            'stats'    => $stats,
            'channels' => $channels,
            'filters'  => $request->only(['search', 'channel_id', 'ai_intent', 'is_read']),
        ]);
    }

    public function markRead(InboxMessage $inboxMessage): JsonResponse
    {
        $inboxMessage->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        InboxMessage::where('direction', 'inbound')->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }
}
