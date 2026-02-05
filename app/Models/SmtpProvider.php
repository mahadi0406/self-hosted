<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmtpProvider extends Model
{
    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'password',
        'encryption',
        'daily_limit',
        'daily_sent',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function canSend(): bool
    {
        return $this->is_active && $this->daily_sent < $this->daily_limit;
    }

    public function incrementSent(): void
    {
        $this->increment('daily_sent');
    }

    public function resetDailyCount(): void
    {
        $this->update(['daily_sent' => 0]);
    }

    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = encrypt($value);
    }

    public function getPasswordAttribute($value)
    {
        return decrypt($value);
    }
}
