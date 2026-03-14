<?php

namespace App\Http\Middleware;

use App\Services\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckLicense
{
    public function __construct(private LicenseService $license) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->license->isValid()) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Your license is invalid or has expired. Please contact support.',
                ], 402);
            }

            return Inertia::render('Errors/LicenseInvalid', [
                'purchase_code'    => env('PURCHASE_CODE', ''),
                'licensed_domain'  => env('LICENSED_DOMAIN', ''),
                'support_url'      => 'https://kloudinnovation.com',
            ])->toResponse($request)->setStatusCode(402);
        }

        return $next($request);
    }
}
