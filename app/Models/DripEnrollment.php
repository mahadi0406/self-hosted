<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DripEnrollment extends Model
{
    protected $fillable = [
        'drip_sequence_id',
        'contact_id',
        'current_step_id',
        'status',
        'enrolled_at',
        'next_step_at',
        'completed_at',
    ];

    protected $casts = [
        'enrolled_at'  => 'datetime',
        'next_step_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function dripSequence(): BelongsTo
    {
        return $this->belongsTo(DripSequence::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(DripStep::class, 'current_step_id');
    }
}
