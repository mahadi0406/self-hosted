<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DripSequence extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'channel_id',
        'status',
        'trigger_event',
        'trigger_conditions',
        'ai_generated',
        'ai_goal',
        'total_steps',
    ];

    protected $casts = [
        'trigger_conditions' => 'array',
        'ai_generated'       => 'boolean',
        'total_steps'        => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(DripStep::class)->orderBy('step_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(DripEnrollment::class);
    }
}
