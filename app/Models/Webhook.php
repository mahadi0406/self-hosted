<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Webhook extends Model
{
    protected $fillable = ['name', 'url', 'event', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function logs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }
}
