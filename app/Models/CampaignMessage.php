<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignMessage extends Model
{
    protected $fillable = [
        'campaign_id',
        'contact_id',
        'channel_message_id',
        'personalized_body',
        'status',
        'sent_at',
        'delivered_at',
        'read_at',
        'failure_reason',
    ];

    protected $casts = [
        'sent_at'      => 'datetime',
        'delivered_at' => 'datetime',
        'read_at'      => 'datetime',
    ];

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
