<?php

namespace App\Observers;

use App\Enums\User\RoleStatus;
use App\Models\User;
use App\Models\Currency;
use App\Models\Wallet;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

readonly class UserObserver
{

    /**
     * @param User $user
     * @return void
     */
    public function creating(User $user): void
    {
        Log::info("User creating event triggered", ['email' => $user->email]);
    }


    /**
     * @param User $user
     * @return void
     */
    public function created(User $user): void
    {
        try {
            if($user->role == RoleStatus::ADMIN->value) {
                Log::info("Skipping wallet creation for admin user", ['user_id' => $user->id]);
                return;
            }

            $currencies = Currency::where('is_active', true)
                ->get();

            if ($currencies->isEmpty()) {
                Log::warning("No active crypto currencies found. Skipping wallet creation.", [
                    'user_id' => $user->id
                ]);
                return;
            }

            DB::transaction(function () use ($user, $currencies) {
                foreach ($currencies as $currency) {
                    Wallet::create([
                        'user_id' => $user->id,
                        'currency_id' => $currency->id,
                        'balance' => 0,
                        'available_balance' => 0,
                        'locked_balance' => 0,
                    ]);
                }
            });

            Log::info("Default wallets created successfully", [
                'user_id' => $user->id,
                'wallets_count' => $currencies->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to create default wallets for user", [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * @param User $user
     * @return void
     */
    public function updated(User $user): void
    {

    }


    /**
     * @param User $user
     * @return void
     */
    public function deleted(User $user): void
    {

    }


    /**
     * @param User $user
     * @return void
     */
    public function restored(User $user): void
    {

    }


    /**
     * @param User $user
     * @return void
     */
    public function forceDeleted(User $user): void
    {

    }
}
