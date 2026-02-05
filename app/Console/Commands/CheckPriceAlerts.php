<?php

namespace App\Console\Commands;

use App\Models\ExchangePair;
use App\Models\ExchangePriceAlert;
use App\Services\EmailTemplateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckPriceAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:check-price
                            {--pair= : Check specific exchange pair ID}
                            {--force : Force check all alerts even if recently checked}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check active price alerts and send notifications when conditions are met';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting price alert check...');

        try {
            $pairsQuery = ExchangePair::where('is_active', true);
            if ($this->option('pair')) {
                $pairsQuery->where('id', $this->option('pair'));
            }

            $pairs = $pairsQuery->get();
            if ($pairs->isEmpty()) {
                $this->warn('No active exchange pairs found.');
                return 0;
            }

            $totalTriggered = 0;
            foreach ($pairs as $pair) {
                $triggered = $this->checkAlertsForPair($pair);
                $totalTriggered += $triggered;
            }

            $this->info("Price alert check completed. {$totalTriggered} alert(s) triggered.");

            return 0;

        } catch (\Exception $e) {
            $this->error('Error checking price alerts: ' . $e->getMessage());
            Log::error('Price alert check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }

    /**
     * Check alerts for a specific exchange pair
     *
     * @param ExchangePair $pair
     * @return int Number of triggered alerts
     */
    private function checkAlertsForPair(ExchangePair $pair): int
    {
        $currentPrice = $pair->current_price;

        if (!$currentPrice || $currentPrice <= 0) {
            $this->warn("Skipping {$pair->symbol} - No valid current price");
            return 0;
        }

        $alerts = ExchangePriceAlert::where('exchange_pair_id', $pair->id)
            ->where('is_active', true)
            ->where('is_triggered', false)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->with([
                'user:id,name,email',
                'exchangePair.fromCurrency:id,name,symbol',
                'exchangePair.toCurrency:id,name,symbol'
            ])
            ->get();

        if ($alerts->isEmpty()) {
            return 0;
        }

        $triggeredCount = 0;

        foreach ($alerts as $alert) {
            if ($this->shouldTriggerAlert($alert, $currentPrice)) {
                if ($this->triggerAlert($alert, $currentPrice)) {
                    $triggeredCount++;
                }
            }
        }

        if ($triggeredCount > 0) {
            $this->info("{$pair->symbol}: {$triggeredCount} alert(s) triggered at price {$currentPrice}");
        }

        return $triggeredCount;
    }

    /**
     *
     * @param ExchangePriceAlert $alert
     * @param float $currentPrice
     * @return bool
     */
    private function shouldTriggerAlert(ExchangePriceAlert $alert, $currentPrice): bool
    {
        if ($alert->condition === 'above') {
            return $currentPrice >= $alert->target_price;
        } elseif ($alert->condition === 'below') {
            return $currentPrice <= $alert->target_price;
        }

        return false;
    }

    /**
     * Trigger alert and send notification
     *
     * @param ExchangePriceAlert $alert
     * @param float $currentPrice
     * @return bool
     */
    private function triggerAlert(ExchangePriceAlert $alert, $currentPrice): bool
    {
        try {
            DB::beginTransaction();
            $alert->update([
                'is_triggered' => true,
                'triggered_at' => now(),
                'is_active' => false,
            ]);

            $this->sendAlertEmail($alert, $currentPrice);
            DB::commit();

            Log::info('Price alert triggered', [
                'alert_id' => $alert->id,
                'user_id' => $alert->user_id,
                'pair' => $alert->exchangePair->symbol,
                'condition' => $alert->condition,
                'target_price' => $alert->target_price,
                'current_price' => $currentPrice,
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            $this->error("Failed to trigger alert {$alert->id}: {$e->getMessage()}");
            Log::error('Failed to trigger price alert', [
                'alert_id' => $alert->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send alert notification email
     *
     * @param ExchangePriceAlert $alert
     * @param float $currentPrice
     * @return void
     */
    private function sendAlertEmail(ExchangePriceAlert $alert, $currentPrice): void
    {
        try {
            $fromCurrency = $alert->exchangePair->fromCurrency;
            $toCurrency = $alert->exchangePair->toCurrency;

            EmailTemplateService::sendTemplateEmail('exchange_price_alert', $alert->user, [
                'user_name' => $alert->user->name,
                'pair_symbol' => $alert->exchangePair->symbol,
                'target_price' => number_format($alert->target_price, 8) . ' ' . ($toCurrency->symbol ?? $toCurrency->code),
                'current_price' => number_format($currentPrice, 8) . ' ' . ($toCurrency->symbol ?? $toCurrency->code),
                'condition' => ucfirst($alert->condition),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send price alert email', [
                'alert_id' => $alert->id,
                'user_id' => $alert->user_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
