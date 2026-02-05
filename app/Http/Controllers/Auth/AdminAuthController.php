<?php

namespace App\Http\Controllers\Auth;

use App\Enums\User\Status;
use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Models\User;
use App\Services\EmailTemplateService;
use App\Services\EmailVerificationService;
use Carbon\Carbon;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    /**
     * @return Response
     */
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Admin');
    }

    /**
     * Handle login authentication with enhanced security
     * @param Request $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    public function login(Request $request): RedirectResponse
    {
        $request->merge(array_map(function($value) {
            return is_string($value) ? strip_tags(trim($value)) : $value;
        }, $request->all()));

        $this->ensureIsNotRateLimited($request);

        $credentials = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:255',
            'remember' => 'boolean'
        ]);

        $credentials['email'] = strtolower(trim($credentials['email']));

        try {
            $user = User::where('email', $credentials['email'])->first();
            $genericError = 'The provided credentials are incorrect.';

            if (!$user) {
                RateLimiter::hit($this->throttleKey($request));
                Log::warning('Login attempt with non-existent email', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                return redirect()->back()->with(['error' => $genericError]);
            }

            if ($user->status != Status::ACTIVE->value) {
                Log::warning('Login attempt on inactive account', [
                    'user_id' => $user->id,
                    'email' => $credentials['email'],
                    'ip' => $request->ip()
                ]);

                return redirect()->back()->with(['error' => 'Your account has been deactivated. Please contact support']);
            }

            if (!Hash::check($credentials['password'], $user->password)) {
                RateLimiter::hit($this->throttleKey($request));
                Log::warning('Failed password attempt', [
                    'user_id' => $user->id,
                    'email' => $credentials['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                return redirect()->back()->with(['error' => $genericError]);
            }


            if ($this->isAccountLocked($user)) {
                Log::warning('Login attempt on locked account', [
                    'user_id' => $user->id,
                    'email' => $credentials['email'],
                    'ip' => $request->ip()
                ]);

                return redirect()->back()->with(['error' => 'Account temporarily locked due to suspicious activity. Please try again later or contact support.']);
            }

            Auth::login($user, $credentials['remember'] ?? false);
            $request->session()->regenerate();
            $request->session()->put('last_activity', time());
            $request->session()->put('user_ip', $request->ip());
            $request->session()->put('user_agent_hash', hash('sha256', $request->userAgent() ?? ''));

            Log::info('Successful login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return redirect('/admin/dashboard');

        } catch (\Exception $e) {
            Log::error('Login error', [
                'email' => $credentials['email'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip()
            ]);

            return redirect()->back()->with(['error' => 'An error occurred during login. Please try again.']);
        }
    }


    /**
     * Handle user logout with enhanced security
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function logout(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            Log::info('User logged out', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->forget(['2fa_verified', 'login_attempts', 'last_activity']);

        return redirect('/admin')->with('success', 'You have been logged out successfully.');
    }

    /**
     * @param Request $request
     * @return void
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(Request $request): void
    {
        $key = $this->throttleKey($request);
        $maxAttempts = Setting::get('login_attempts', 5);

        if (!RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return;
        }

        $seconds = RateLimiter::availableIn($key);
        $minutes = ceil($seconds / 60);

        Log::warning('Rate limit exceeded for login', [
            'email' => $request->input('email'),
            'ip' => $request->ip(),
            'attempts' => RateLimiter::attempts($key),
            'max_attempts' => $maxAttempts
        ]);

        throw ValidationException::withMessages([
            'email' => [
                "Too many login attempts. Please try again in {$minutes} minute" . ($minutes > 1 ? 's' : '') . '.'
            ],
        ]);
    }

    /**
     * Get the throttle key for rate limiting
     * @param Request $request
     * @return string
     */
    protected function throttleKey(Request $request): string
    {
        $email = strtolower($request->input('email', ''));
        return "login_attempts:{$email}:{$request->ip()}";
    }

    /**
     * Check if an account is locked due to suspicious activity
     * @param User $user
     * @return bool
     */
    protected function isAccountLocked(User $user): bool
    {
        $lockKey = "account_locked:{$user->id}";
        return Cache::has($lockKey);
    }
}
