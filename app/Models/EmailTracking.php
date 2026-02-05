<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTracking extends Model
{
    protected $fillable = [
        'campaign_id',
        'email',
        'event_type',
        'link_url',
        'ip_address',
    ];

    // Relationships
    public function campaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    // Scopes
    public function scopeOpens($query)
    {
        return $query->where('event_type', 'opened');
    }

    public function scopeClicks($query)
    {
        return $query->where('event_type', 'clicked');
    }

    public function scopeBounces($query)
    {
        return $query->where('event_type', 'bounced');
    }

    public function scopeForEmail($query, $email)
    {
        return $query->where('email', $email);
    }
}
