<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactEngagement extends Model
{
    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'engagement_score',
        'engagement_level',
        'total_sent',
        'total_opened',
        'total_clicked',
        'last_sent_at',
        'last_opened_at',
    ];

    protected $casts = [
        'last_sent_at' => 'datetime',
        'last_opened_at' => 'datetime',
    ];

    // Scopes
    public function scopeHot($query)
    {
        return $query->where('engagement_level', 'hot');
    }

    public function scopeWarm($query)
    {
        return $query->where('engagement_level', 'warm');
    }

    public function scopeCold($query)
    {
        return $query->where('engagement_level', 'cold');
    }

    // Methods
    public function calculateEngagementScore()
    {
        if ($this->total_sent == 0) return 0;

        $openRate = ($this->total_opened / $this->total_sent) * 100;
        $clickRate = ($this->total_clicked / $this->total_sent) * 100;

        $score = ($openRate * 0.6) + ($clickRate * 0.4);

        $this->update(['engagement_score' => round($score)]);

        // Update engagement level
        if ($score >= 70) {
            $this->update(['engagement_level' => 'hot']);
        } elseif ($score >= 40) {
            $this->update(['engagement_level' => 'warm']);
        } else {
            $this->update(['engagement_level' => 'cold']);
        }
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}
