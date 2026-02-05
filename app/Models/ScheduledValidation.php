<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledValidation extends Model
{
    protected $fillable = [
        'list_id', 'scheduled_at', 'status', 'template_id'
    ];

    protected $casts = ['scheduled_at' => 'datetime'];

    public function list(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SavedList::class, 'list_id');
    }

    public function template(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ValidationTemplate::class, 'template_id');
    }
}

