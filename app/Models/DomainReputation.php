<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainReputation extends Model
{
    protected $fillable = [
        'domain', 'score', 'total_validations',
        'valid_count', 'invalid_count', 'is_blacklisted'
    ];

    protected $casts = ['is_blacklisted' => 'boolean'];
}
