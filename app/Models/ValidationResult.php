<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidationResult extends Model
{
    protected $fillable = [
        'email', 'is_valid', 'score', 'checks',
        'status', 'suggestion', 'list_id'
    ];

    protected $casts = [
        'checks' => 'array',
        'is_valid' => 'boolean',
    ];

    public function list(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SavedList::class, 'list_id');
    }
}
