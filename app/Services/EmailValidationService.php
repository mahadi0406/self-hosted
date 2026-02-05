<?php

namespace App\Services;

use App\Models\DisposableDomain;
use App\Models\FreeEmailProvider;
use App\Models\RoleBasedKeyword;
use App\Models\DomainReputation;
use Illuminate\Support\Facades\Cache;

class EmailValidationService
{
    private array $disposableDomains = [];
    private array $freeProviders = [];
    private array $roleKeywords = [];
    private array $commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

    public function __construct()
    {
        $this->loadDomainLists();
    }


    /**
     * @param string $email
     * @return array
     */
    public function validate(string $email): array
    {
        $result = [
            'valid' => false,
            'email' => $email,
            'score' => 0,
            'checks' => [],
            'suggestion' => null
        ];

        if (!$this->isValidFormat($email)) {
            $result['checks']['format'] = false;
            $result['checks']['typo'] = $this->checkTypo($email);
            if ($result['checks']['typo']) {
                $result['suggestion'] = $result['checks']['typo'];
            }
            return $result;
        }
        $result['checks']['format'] = true;
        $result['score'] += 15;

        list($localPart, $domain) = explode('@', $email);

        $typoCheck = $this->checkTypo($email);
        if ($typoCheck && $typoCheck !== $email) {
            $result['checks']['typo'] = true;
            $result['suggestion'] = $typoCheck;
            $result['score'] -= 5;
        } else {
            $result['checks']['typo'] = false;
        }

        $result['checks']['dns'] = $this->hasDnsRecord($domain);
        if ($result['checks']['dns']) {
            $result['score'] += 20;
        } else {
            return $result;
        }

        $result['checks']['mx_records'] = $this->hasMxRecord($domain);
        if ($result['checks']['mx_records']) {
            $result['score'] += 20;
        } else {
            return $result;
        }

        $result['checks']['disposable'] = !$this->isDisposable($domain);
        if ($result['checks']['disposable']) {
            $result['score'] += 10;
        } else {
            $result['score'] -= 20;
        }

        $result['checks']['free_provider'] = $this->isFreeProvider($domain);
        if (!$result['checks']['free_provider']) {
            $result['score'] += 5;
        }

        $result['checks']['role_based'] = !$this->isRoleBased($localPart);
        if ($result['checks']['role_based']) {
            $result['score'] += 10;
        } else {
            $result['score'] -= 10;
        }

        $result['checks']['bot_pattern'] = !$this->isBotPattern($localPart);
        if ($result['checks']['bot_pattern']) {
            $result['score'] += 10;
        } else {
            $result['score'] -= 15;
        }

        $corrected = $this->correctSyntaxErrors($email);
        if ($corrected !== $email) {
            $result['checks']['syntax_corrected'] = true;
            $result['suggestion'] = $corrected;
        } else {
            $result['checks']['syntax_corrected'] = false;
        }

        $result['checks']['catch_all'] = $this->isCatchAll($domain);
        if ($result['checks']['catch_all']) {
            $result['score'] -= 5;
        }

        // 11. SMTP Verification (Optional - can be slow)
        // $result['checks']['smtp'] = $this->verifySmtp($email, $domain);
        // if ($result['checks']['smtp']) {
        //     $result['score'] += 10;
        // }

        $reputation = $this->getDomainReputation($domain);
        $result['checks']['domain_reputation'] = $reputation;
        $result['score'] += ($reputation - 50) / 10;

        $result['score'] = max(0, min(100, round($result['score'])));

        $result['valid'] = $result['score'] >= 60 &&
            $result['checks']['format'] &&
            $result['checks']['dns'] &&
            $result['checks']['mx_records'] &&
            $result['checks']['disposable'];

        return $result;
    }

    /**
     * @param string $email
     * @return bool
     */
    private function isValidFormat(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * @param string $email
     * @return string|null
     */
    private function checkTypo(string $email): ?string
    {
        if (!str_contains($email, '@')) {
            return null;
        }

        list($localPart, $domain) = explode('@', $email);

        foreach ($this->commonDomains as $commonDomain) {
            $distance = levenshtein(strtolower($domain), strtolower($commonDomain));
            if ($distance > 0 && $distance <= 2) {
                return $localPart . '@' . $commonDomain;
            }
        }

        return null;
    }


    /**
     * @param string $domain
     * @return bool
     */
    private function hasDnsRecord(string $domain): bool
    {
        return checkdnsrr($domain, 'A') || checkdnsrr($domain, 'AAAA');
    }

    /**
     * @param string $domain
     * @return bool
     */
    private function hasMxRecord(string $domain): bool
    {
        return checkdnsrr($domain, 'MX');
    }


    /**
     * @param string $domain
     * @return bool
     */
    private function isDisposable(string $domain): bool
    {
        return in_array(strtolower($domain), $this->disposableDomains);
    }


    /**
     * @param string $domain
     * @return bool
     */
    private function isFreeProvider(string $domain): bool
    {
        return in_array(strtolower($domain), $this->freeProviders);
    }

    /**
     * @param string $localPart
     * @return bool
     */
    private function isRoleBased(string $localPart): bool
    {
        $localPart = strtolower($localPart);

        foreach ($this->roleKeywords as $keyword) {
            if ($localPart === $keyword || str_starts_with($localPart, $keyword . '.')) {
                return true;
            }
        }

        return false;
    }


    /**
     * @param string $localPart
     * @return bool
     */
    private function isBotPattern(string $localPart): bool
    {
        preg_match_all('/\d/', $localPart, $matches);
        $numberCount = count($matches[0]);
        $totalLength = strlen($localPart);

        if ($totalLength > 0 && ($numberCount / $totalLength) > 0.5) {
            return true;
        }

        $specialCount = substr_count($localPart, '_') + substr_count($localPart, '-');
        if ($specialCount > 3) {
            return true;
        }

        $vowels = ['a', 'e', 'i', 'o', 'u'];
        $hasVowel = false;
        foreach ($vowels as $vowel) {
            if (str_contains(strtolower($localPart), $vowel)) {
                $hasVowel = true;
                break;
            }
        }

        if (!$hasVowel && strlen($localPart) > 5) {
            return true;
        }

        return false;
    }


    /**
     * @param string $email
     * @return string
     */
    private function correctSyntaxErrors(string $email): string
    {
        $email = trim($email);
        $email = preg_replace('/\s+/', '', $email);

        $email = preg_replace('/\.{2,}/', '.', $email);
        return preg_replace('/@([a-z0-9-]+)(com|net|org|edu)$/i', '@$1.$2', $email);
    }


    /**
     * @param string $domain
     * @return bool
     */
    private function isCatchAll(string $domain): bool
    {
        // This requires SMTP check with random email
        // For now, return false (implement if needed)
        return false;
    }

    /**
     * @param string $email
     * @param string $domain
     * @return bool
     */
    private function verifySmtp(string $email, string $domain): bool
    {
        try {
            // Get MX records
            if (!getmxrr($domain, $mxHosts, $mxWeights)) {
                return false;
            }

            // Sort by priority
            array_multisort($mxWeights, $mxHosts);

            $mxHost = $mxHosts[0];

            // Connect to SMTP server
            $socket = @fsockopen($mxHost, 25, $errno, $errstr, 10);

            if (!$socket) {
                return false;
            }

            // Read greeting
            fgets($socket);

            // HELO
            fputs($socket, "HELO example.com\r\n");
            fgets($socket);

            // MAIL FROM
            fputs($socket, "MAIL FROM: <verify@example.com>\r\n");
            fgets($socket);

            // RCPT TO
            fputs($socket, "RCPT TO: <{$email}>\r\n");
            $response = fgets($socket);

            // QUIT
            fputs($socket, "QUIT\r\n");
            fclose($socket);

            // Check if 250 code (success)
            return str_contains($response, '250');

        } catch (\Exception $e) {
            return false;
        }
    }


    /**
     * @param string $domain
     * @return int
     */
    private function getDomainReputation(string $domain): int
    {
        // Check cache first
        $cacheKey = 'domain_reputation_' . $domain;

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Get from a database
        $reputation = DomainReputation::where('domain', $domain)->first();

        if ($reputation) {
            $score = $reputation->score;
            Cache::put($cacheKey, $score, now()->addHours(24));
            return $score;
        }

        return 50;
    }


    /**
     * @param string $domain
     * @param bool $isValid
     * @return void
     */
    public function updateDomainReputation(string $domain, bool $isValid): void
    {
        $reputation = DomainReputation::firstOrCreate(
            ['domain' => $domain],
            [
                'score' => 50,
                'total_validations' => 0,
                'valid_count' => 0,
                'invalid_count' => 0,
                'is_blacklisted' => false
            ]
        );

        $reputation->increment('total_validations');

        if ($isValid) {
            $reputation->increment('valid_count');
        } else {
            $reputation->increment('invalid_count');
        }

        $validRate = $reputation->total_validations > 0
            ? ($reputation->valid_count / $reputation->total_validations) * 100
            : 50;

        $reputation->score = round($validRate);
        $reputation->save();

        Cache::forget('domain_reputation_' . $domain);
    }


    /**
     * @return void
     */
    private function loadDomainLists(): void
    {
        $this->disposableDomains = Cache::remember('disposable_domains', 3600, function() {
            return DisposableDomain::where('is_active', true)
                ->pluck('domain')
                ->map(fn($d) => strtolower($d))
                ->toArray();
        });

        $this->freeProviders = Cache::remember('free_providers', 3600, function() {
            return FreeEmailProvider::where('is_active', true)
                ->pluck('domain')
                ->map(fn($d) => strtolower($d))
                ->toArray();
        });

        $this->roleKeywords = Cache::remember('role_keywords', 3600, function() {
            return RoleBasedKeyword::where('is_active', true)
                ->pluck('keyword')
                ->map(fn($k) => strtolower($k))
                ->toArray();
        });
    }


    /**
     * @return void
     */
    public function refreshCache(): void
    {
        Cache::forget('disposable_domains');
        Cache::forget('free_providers');
        Cache::forget('role_keywords');
        $this->loadDomainLists();
    }
}
