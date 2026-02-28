<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'channel_id',
        'template_id',
        'type',
        'content',
        'audience',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'ai_goal',
        'ai_suggestions',
        'total_recipients',
    ];

    protected $casts = [
        'content'         => 'array',
        'audience'        => 'array',
        'ai_suggestions'  => 'array',
        'scheduled_at'    => 'datetime',
        'started_at'      => 'datetime',
        'completed_at'    => 'datetime',
        'total_recipients'=> 'integer',
    ];

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CampaignMessage::class);
    }

    public function analytics(): HasOne
    {
        return $this->hasOne(CampaignAnalytic::class);
    }
}
