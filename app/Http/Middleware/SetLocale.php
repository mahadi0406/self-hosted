<?php
// app/Http/Middleware/SetLocale.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale');
        $availableLocales = config('app.available_locales', ['en']);
        if ($locale && in_array($locale, $availableLocales)) {
            App::setLocale($locale);
            Session::put('locale', $locale);
        } else {
            $sessionLocale = Session::get('locale', config('app.locale', 'en'));
            if (!in_array($sessionLocale, $availableLocales)) {
                $sessionLocale = config('app.locale', 'en');
            }
            $path = ltrim($request->path(), '/');
            return redirect("/{$sessionLocale}/{$path}");
        }

        return $next($request);
    }
}
