<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContactList extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'contacts_count',
    ];

    protected $casts = [
        'contacts_count' => 'integer',
    ];

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_list_contact')
            ->withTimestamps();
    }
}
