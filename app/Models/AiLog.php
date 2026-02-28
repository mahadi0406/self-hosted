<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiLog extends Model
{
    protected $fillable = [
        'feature',
        'model',
        'prompt',
        'response',
        'input_tokens',
        'output_tokens',
        'success',
        'error_message',
    ];

    protected $casts = [
        'input_tokens'  => 'integer',
        'output_tokens' => 'integer',
        'success'       => 'boolean',
    ];

    public function scopeSuccessful($query)
    {
        return $query->where('success', true);
    }

    public function scopeFailed($query)
    {
        return $query->where('success', false);
    }

    public function scopeByFeature($query, string $feature)
    {
        return $query->where('feature', $feature);
    }
}
