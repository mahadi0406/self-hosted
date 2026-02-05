<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    protected $fillable = [
        'api_key_id', 'endpoint', 'method',
        'ip_address', 'response_code'
    ];

    public function apiKey(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ApiKey::class);
    }
}
