<?php

namespace App\Http\Middleware;

use App\Enums\User\RoleStatus;
use App\Enums\User\Status;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (!Auth::check()) {
            return redirect('/');
        }

        $user = Auth::user();
        if (
            ($role === 'admin' && $user->role !== RoleStatus::ADMIN->value) ||
            ($role === 'user' && $user->role !== RoleStatus::USER->value)
        ) {
            abort(403, 'Unauthorized');
        }

        if ($user->status != Status::ACTIVE->value) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your account has been deactivated. Please contact administrator.'
                ], 401);
            }

            return redirect('/')->with('error', 'Your account has been deactivated. Please contact administrator.');
        }
        return $next($request);
    }
}
