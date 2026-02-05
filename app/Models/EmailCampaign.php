<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'body_html',
        'list_id',
        'from_email',
        'status',
        'scheduled_at',
        'sent_at',
        'total_sent',
        'total_opened',
        'total_clicked',
        'is_ai_generated',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'is_ai_generated' => 'boolean',
    ];

    public function list(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SavedList::class, 'list_id');
    }

    public function recipients(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    }

    public function tracking(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailTracking::class, 'campaign_id');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function getOpenRateAttribute(): float|int
    {
        if ($this->total_sent == 0) return 0;
        return round(($this->total_opened / $this->total_sent) * 100, 2);
    }

    public function getClickRateAttribute(): float|int
    {
        if ($this->total_sent == 0) return 0;
        return round(($this->total_clicked / $this->total_sent) * 100, 2);
    }
}
