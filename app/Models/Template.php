<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'channel',
        'language',
        'header',
        'body',
        'footer',
        'buttons',
        'variables',
        'source',
        'ai_tone',
        'ai_compliance_score',
        'status',
        'rejection_reason',
        'usage_count',
    ];

    protected $casts = [
        'buttons'             => 'array',
        'variables'           => 'array',
        'ai_compliance_score' => 'float',
        'usage_count'         => 'integer',
    ];

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeAiGenerated($query)
    {
        return $query->where('source', 'ai_generated');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }
}
