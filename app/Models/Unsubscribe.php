<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unsubscribe extends Model
{
    protected $fillable = [
        'email',
        'reason',
    ];

    // Methods
    public static function isUnsubscribed($email)
    {
        return self::where('email', $email)->exists();
    }

    public static function unsubscribe($email, $reason = null)
    {
        return self::firstOrCreate(
            ['email' => $email],
            ['reason' => $reason]
        );
    }
}
