<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidationTemplate extends Model
{
    protected $fillable = ['name', 'rules', 'is_default'];

    protected $casts = [
        'rules' => 'array',
        'is_default' => 'boolean',
    ];
}
