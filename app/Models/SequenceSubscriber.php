<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SequenceSubscriber extends Model
{
    protected $fillable = [
        'sequence_id',
        'email',
        'status',
        'current_step',
        'enrolled_at',
        'next_send_at',
        'completed_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'next_send_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function sequence(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(EmailSequence::class, 'sequence_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePendingSend($query)
    {
        return $query->where('status', 'active')
            ->whereNotNull('next_send_at')
            ->where('next_send_at', '<=', Carbon::now());
    }

    public function moveToNextStep(): void
    {
        $this->increment('current_step');

        $nextStep = SequenceStep::where('sequence_id', $this->sequence_id)
            ->where('step_order', $this->current_step)
            ->first();

        if ($nextStep) {
            $this->update([
                'next_send_at' => Carbon::now()->addDays($nextStep->delay_days)
            ]);
        } else {
            $this->complete();
        }
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => Carbon::now(),
            'next_send_at' => null,
        ]);
    }
}
