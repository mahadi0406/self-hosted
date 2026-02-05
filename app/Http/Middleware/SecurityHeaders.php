<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        $csp = "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' " .
            "https://js.stripe.com " .
            "https://checkout.stripe.com " .
            "https://s3.tradingview.com " .
            "https://charting-library.tradingview.com " .
            "https://www.tradingview.com " .
            "*.tradingview.com " .
            "https://embed.tawk.to " .
            "*.tawk.to; " .
            "style-src 'self' 'unsafe-inline' " .
            "https://fonts.googleapis.com " .
            "https://s3.tradingview.com " .
            "*.tradingview.com " .
            "*.tawk.to; " .
            "img-src 'self' data: blob: https: " .
            "https://s3.tradingview.com " .
            "*.tradingview.com " .
            "*.tawk.to " .
            "https://api.web3modal.org " .
            "https://imagedelivery.net " .
            "https://avatars.githubusercontent.com; " .
            "connect-src 'self' " .
            "https://api.stripe.com " .
            "https://data-feed.tradingview.com " .
            "wss://data.tradingview.com " .
            "https://symbol-search.tradingview.com " .
            "*.tradingview.com " .
            "*.tawk.to " .
            "wss://*.tawk.to " .
            "https://api.web3modal.org " .
            "https://verify.walletconnect.org " .
            "https://relay.walletconnect.org " .
            "wss://relay.walletconnect.org " .
            "https://rpc.walletconnect.org " .
            "https://pulse.walletconnect.org; " .
            "frame-src 'self' " .
            "https://js.stripe.com " .
            "https://checkout.stripe.com " .
            "https://s3.tradingview.com " .
            "*.tradingview.com " .
            "*.tawk.to " .
            "https://verify.walletconnect.org; " .
            "worker-src 'self' blob: " .
            "https://s3.tradingview.com " .
            "*.tradingview.com; " .
            "font-src 'self' data: " .
            "https://fonts.gstatic.com " .
            "https://s3.tradingview.com " .
            "*.tradingview.com " .
            "*.tawk.to " .
            "https://api.web3modal.org; " .
            "object-src 'none'; " .
            "base-uri 'self'; " .
            "form-action 'self'; " .
            "frame-ancestors 'none';";

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
