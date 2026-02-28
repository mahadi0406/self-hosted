<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InboxMessage extends Model
{
    protected $fillable = [
        'contact_id',
        'channel_id',
        'direction',
        'type',
        'body',
        'media_url',
        'channel_message_id',
        'ai_intent',
        'ai_suggested_reply',
        'is_read',
        'received_at',
    ];

    protected $casts = [
        'is_read'     => 'boolean',
        'received_at' => 'datetime',
    ];

    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }
}
