<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = [
        'name', 'key', 'requests_limit', 'requests_used',
        'is_active', 'last_used_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function logs()
    {
        return $this->hasMany(ApiLog::class);
    }
}
