<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'telegram_id',
        'email',
        'country',
        'city',
        'language',
        'custom_fields',
        'tags',
        'status',
        'ai_engagement_label',
        'last_messaged_at',
    ];

    protected $casts = [
        'custom_fields'    => 'array',
        'tags'             => 'array',
        'last_messaged_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOptedOut($query)
    {
        return $query->where('status', 'opted_out');
    }

    public function lists(): BelongsToMany
    {
        return $this->belongsToMany(ContactList::class, 'contact_list_contact')
            ->withTimestamps();
    }

    public function campaignMessages(): HasMany
    {
        return $this->hasMany(CampaignMessage::class);
    }

    public function inboxMessages(): HasMany
    {
        return $this->hasMany(InboxMessage::class);
    }

    public function dripEnrollments(): HasMany
    {
        return $this->hasMany(DripEnrollment::class);
    }
}
