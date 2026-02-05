<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleBasedKeyword extends Model
{
    protected $fillable = ['keyword', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
