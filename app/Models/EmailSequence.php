<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSequence extends Model
{
    protected $fillable = [
        'name',
        'description',
        'list_id',
        'status',
        'total_subscribers',
    ];

    // Relationships
    public function list()
    {
        return $this->belongsTo(SavedList::class, 'list_id');
    }

    public function steps()
    {
        return $this->hasMany(SequenceStep::class, 'sequence_id')->orderBy('step_order');
    }

    public function subscribers()
    {
        return $this->hasMany(SequenceSubscriber::class, 'sequence_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function activate()
    {
        $this->update(['status' => 'active']);
    }

    public function pause()
    {
        $this->update(['status' => 'paused']);
    }
}
