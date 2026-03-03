<?php

namespace App\Console\Commands;

use App\Models\ContactList;
use Illuminate\Console\Command;

class SyncContactCounts extends Command
{
    protected $signature   = 'contacts:sync-counts';
    protected $description = 'Recalculate contacts_count on all contact lists';

    public function handle(): void
    {
        $lists = ContactList::all();
        foreach ($lists as $list) {
            $list->update(['contacts_count' => $list->contacts()->count()]);
        }

        $this->info("Synced {$lists->count()} contact list counts.");
    }
}
