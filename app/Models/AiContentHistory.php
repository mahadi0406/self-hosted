<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiContentHistory extends Model
{
    protected $fillable = [
        'prompt',
        'content_type',
        'generated_content',
        'rating',
        'was_used',
    ];

    protected $casts = [
        'was_used' => 'boolean',
    ];

    public function scopeUsed($query)
    {
        return $query->where('was_used', true);
    }

    public function scopeHighRated($query)
    {
        return $query->where('rating', '>=', 4);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('content_type', $type);
    }

    public function markAsUsed(): void
    {
        $this->update(['was_used' => true]);
    }
}
