<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateUpdateService;
use Illuminate\Console\Command;

class UpdateExchangeRates extends Command
{
    protected $signature = 'exchange:update-rates';
    protected $description = 'Update exchange rates from CoinGecko API';

    public function handle(ExchangeRateUpdateService $service): int
    {
        $this->info('Starting exchange rate update...');
        $results = $service->updateAllRates();
        $this->info("Successfully updated: {$results['success']} pairs");

        if ($results['failed'] > 0) {
            $this->warn("Failed to update: {$results['failed']} pairs");

            foreach ($results['errors'] as $error) {
                $this->error("  - {$error['pair']}: {$error['error']}");
            }
        }

        return Command::SUCCESS;
    }
}
