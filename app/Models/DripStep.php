<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DripStep extends Model
{
    protected $fillable = [
        'drip_sequence_id',
        'step_order',
        'name',
        'delay_days',
        'delay_hours',
        'send_at_time',
        'template_id',
        'content',
    ];

    protected $casts = [
        'content'     => 'array',
        'delay_days'  => 'integer',
        'delay_hours' => 'integer',
        'step_order'  => 'integer',
    ];

    public function dripSequence(): BelongsTo
    {
        return $this->belongsTo(DripSequence::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(DripEnrollment::class, 'current_step_id');
    }
}
