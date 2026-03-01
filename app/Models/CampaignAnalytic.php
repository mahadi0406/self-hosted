<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignAnalytic extends Model
{
    protected $fillable = [
        'campaign_id',
        'sent',
        'delivered',
        'read',
        'replied',
        'failed',
        'opted_out',
        'delivery_rate',
        'read_rate',
        'reply_rate',
        'ai_summary',
        'ai_recommendations',
    ];

    protected $casts = [
        'sent'               => 'integer',
        'delivered'          => 'integer',
        'read'               => 'integer',
        'replied'            => 'integer',
        'failed'             => 'integer',
        'opted_out'          => 'integer',
        'delivery_rate'      => 'float',
        'read_rate'          => 'float',
        'reply_rate'         => 'float',
        'ai_recommendations' => 'array',
        'recorded_at'        => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
