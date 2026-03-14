<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LicenseService
{
    private const CACHE_KEY      = 'license_status';
    private const CACHE_TTL      = 86400;
    private const FAIL_CACHE_KEY = 'license_fail_count';
    private const MAX_FAILS      = 3;
    private const API_URL        = 'https://kloudinnovation.com/api/license/revalidate';
    private const API_TOKEN      = 'B77MsI9905rTCtdoWy8v06WkeMgrsiXDpZH3WDpO';

    // Neutral DB key — looks like a normal app config, not a license field
    private const DB_SIG_KEY     = 'app_integrity_hash';
    // Internal secret used to sign the DB token
    private const SIG_SECRET     = 'kli_7f3c9a1b2d4e8f0a5c6b9d2e1f4a7c8b';

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fast check: use cache. Falls back to full revalidation if cache is cold.
     */
    public function isValid(): bool
    {
        $cached = Cache::get(self::CACHE_KEY);
        if ($cached !== null) {
            return (bool) $cached;
        }

        return $this->revalidate();
    }

    /**
     * Deep check used by AppServiceProvider — verifies the DB signature
     * in addition to the cache, without hitting the remote API.
     * This catches attackers who clear the cache or edit .env.
     */
    public function isValidDeep(): bool
    {
        // No purchase code at all → legacy / unset install
        if (! env('PURCHASE_CODE')) {
            return true;
        }

        // DB signature must be present and correct
        if (! $this->verifyDbSignature()) {
            Log::critical('App integrity check failed — DB signature invalid or missing.');
            return false;
        }

        // Then also honour the cached remote result
        return $this->isValid();
    }

    /**
     * Force a full remote revalidation and refresh DB signature.
     */
    public function revalidate(): bool
    {
        $purchaseCode   = env('PURCHASE_CODE');
        $licensedDomain = env('LICENSED_DOMAIN');
        $productName    = env('LICENSE_PRODUCT', 'BlastBot');

        if (! $purchaseCode || ! $licensedDomain) {
            Cache::put(self::CACHE_KEY, true, self::CACHE_TTL);
            return true;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . self::API_TOKEN,
                    'Accept'        => 'application/json',
                ])->post(self::API_URL, [
                    'purchase_code' => $purchaseCode,
                    'domain'        => $licensedDomain,
                    'product_name'  => $productName,
                    'server'        => $this->collectFingerprint(),
                ]);

            if ($response->successful() && $response->json('valid') === true) {
                Cache::put(self::CACHE_KEY, true, self::CACHE_TTL);
                Cache::forget(self::FAIL_CACHE_KEY);
                $this->writeDbSignature($purchaseCode, $licensedDomain);
                return true;
            }

            $message = $response->json('message') ?? 'License invalid';
            Log::warning("License check failed: {$message}");

            Cache::put(self::CACHE_KEY, false, self::CACHE_TTL);
            return false;

        } catch (\Exception $e) {
            Log::error('License server unreachable: ' . $e->getMessage());

            $fails = (int) Cache::get(self::FAIL_CACHE_KEY, 0) + 1;
            Cache::put(self::FAIL_CACHE_KEY, $fails, self::CACHE_TTL * self::MAX_FAILS);

            if ($fails >= self::MAX_FAILS) {
                Cache::put(self::CACHE_KEY, false, self::CACHE_TTL);
                return false;
            }

            // Fail open — allow access while server is temporarily unreachable
            Cache::put(self::CACHE_KEY, true, 3600);
            return true;
        }
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::FAIL_CACHE_KEY);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DB Signature — stores a signed token in the settings table
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Write a signed token to the settings table after a successful remote check.
     * Called from install.php (via direct DB) and after each remote revalidation.
     */
    public function writeDbSignature(string $purchaseCode, string $licensedDomain): void
    {
        try {
            $sig = $this->buildSignature($purchaseCode, $licensedDomain);

            DB::table('settings')->updateOrInsert(
                ['key' => self::DB_SIG_KEY],
                [
                    'key'         => self::DB_SIG_KEY,
                    'value'       => $sig,
                    'type'        => 'text',
                    'group'       => 'system',
                    'label'       => 'App Integrity',
                    'description' => 'Core application configuration hash',
                    'updated_at'  => now(),
                    'created_at'  => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Could not write app integrity: ' . $e->getMessage());
        }
    }

    /**
     * Verify the stored DB signature matches the current .env values.
     */
    public function verifyDbSignature(): bool
    {
        try {
            $stored = DB::table('settings')
                ->where('key', self::DB_SIG_KEY)
                ->value('value');

            if (! $stored) {
                return false;
            }

            $expected = $this->buildSignature(
                env('PURCHASE_CODE', ''),
                env('LICENSED_DOMAIN', '')
            );

            return hash_equals($expected, $stored);
        } catch (\Exception) {
            // DB not ready (e.g. fresh migration) — skip check
            return true;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Server fingerprint — sent to your license server on each revalidation
    // ─────────────────────────────────────────────────────────────────────────

    public function collectFingerprint(): array
    {
        return [
            'server_ip'       => $_SERVER['SERVER_ADDR']    ?? gethostbyname(gethostname()),
            'hostname'        => gethostname(),
            'http_host'       => $_SERVER['HTTP_HOST']      ?? '',
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'os'              => php_uname('s') . ' ' . php_uname('r'),
            'php_version'     => PHP_VERSION,
            'php_sapi'        => PHP_SAPI,
            'timezone'        => date_default_timezone_get(),
            'checked_at'      => now()->toDateTimeString(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internals
    // ─────────────────────────────────────────────────────────────────────────

    private function buildSignature(string $purchaseCode, string $domain): string
    {
        $payload = implode('|', [
            $purchaseCode,
            strtolower(trim($domain)),
            gethostname(),
            self::SIG_SECRET,
        ]);

        return hash_hmac('sha256', $payload, self::SIG_SECRET);
    }
}
