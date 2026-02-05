<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FtpConfiguration extends Model
{
    protected $fillable = [
        'name', 'host', 'port', 'username',
        'password', 'directory', 'is_active'
    ];

    protected $hidden = ['password'];

    protected $casts = ['is_active' => 'boolean'];
}
