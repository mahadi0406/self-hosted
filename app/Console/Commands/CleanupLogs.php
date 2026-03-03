<?php

namespace App\Console\Commands;

use App\Models\AiLog;
use Illuminate\Console\Command;

class CleanupLogs extends Command
{
    protected $signature   = 'logs:cleanup {--days=90}';
    protected $description = 'Delete AI logs older than N days';

    public function handle(): void
    {
        $days    = (int) $this->option('days');
        $deleted = AiLog::where('created_at', '<', now()->subDays($days))->delete();
        $this->info("Deleted {$deleted} AI log entries older than {$days} days.");
    }
}
