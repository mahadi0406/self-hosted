<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SequenceStep extends Model
{
    protected $fillable = [
        'sequence_id',
        'step_order',
        'subject',
        'body_html',
        'delay_days',
        'condition',
        'is_ai_generated',
    ];

    protected $casts = [
        'is_ai_generated' => 'boolean',
    ];

    public function sequence(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(EmailSequence::class, 'sequence_id');
    }

    public function getDelayTextAttribute(): string
    {
        if ($this->delay_days == 0) {
            return 'Immediately';
        } elseif ($this->delay_days == 1) {
            return '1 day later';
        } else {
            return $this->delay_days . ' days later';
        }
    }
}
