<?php

namespace App\Console\Commands;

use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use Illuminate\Console\Command;

class DispatchScheduledCampaigns extends Command
{
    protected $signature   = 'campaigns:dispatch-scheduled';
    protected $description = 'Dispatch all scheduled campaigns whose scheduled_at time has passed';

    public function handle(): void
    {
        $campaigns = Campaign::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info('No scheduled campaigns due.');
            return;
        }

        foreach ($campaigns as $campaign) {
            $campaign->update([
                'status'     => 'running',
                'started_at' => now(),
            ]);

            SendCampaignJob::dispatch($campaign);
            $this->info("Dispatched campaign #{$campaign->id}: {$campaign->name}");
        }

        $this->info("Total dispatched: {$campaigns->count()}");
    }
}
