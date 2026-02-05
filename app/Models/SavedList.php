<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class SavedList extends Model
{
    protected $fillable = [
        'name', 'description', 'total_emails', 'valid_emails',
        'invalid_emails', 'tags', 'status'
    ];

    public function results(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ValidationResult::class, 'list_id');
    }

    public function campaigns(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailCampaign::class, 'list_id');
    }

    public function sequences(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailSequence::class, 'list_id');
    }
}

