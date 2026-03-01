<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Channel extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'phone_number',
        'bot_token',
        'bot_username',
        'credentials',
        'status',
        'error_message',
        'last_verified_at',
        'meta',
    ];

    protected $casts = [
        'credentials'      => 'encrypted',
        'bot_token'        => 'encrypted',
        'meta'             => 'array',
        'last_verified_at' => 'datetime',
    ];

    protected $hidden = ['credentials', 'bot_token'];

    public function scopeConnected($query)
    {
        return $query->where('status', 'connected');
    }

    public function scopeWhatsapp($query)
    {
        return $query->where('type', 'whatsapp');
    }

    public function scopeTelegram($query)
    {
        return $query->where('type', 'telegram');
    }

    public function getIsConnectedAttribute(): bool
    {
        return $this->status === 'connected';
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function dripSequences(): HasMany
    {
        return $this->hasMany(DripSequence::class);
    }

    public function inboxMessages(): HasMany
    {
        return $this->hasMany(InboxMessage::class);
    }
}
