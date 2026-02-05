<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'name',
        'category',
        'subject',
        'body_html',
        'is_ai_generated',
        'usage_count',
    ];

    protected $casts = [
        'is_ai_generated' => 'boolean',
    ];

    // Scopes
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('usage_count', 'desc');
    }

    // Methods
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }
}
