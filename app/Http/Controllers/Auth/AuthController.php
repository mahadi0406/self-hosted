<?php

namespace App\Http\Controllers\Auth;

use App\Enums\User\RoleStatus;
use App\Enums\User\Status;
use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Models\User;
use App\Services\EmailTemplateService;
use App\Services\EmailVerificationService;
use App\Services\LoginHistoryService;
use App\Services\SettingsService;
use Carbon\Carbon;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class AuthController extends Controller
{
    public function __construct(
        protected readonly LoginHistoryService $loginHistoryService,
    ){

    }

    /**
     * @return Response
     */
    public function showLogin(): Response
    {
        $appName = Setting::get('site_name',  '');
        return Inertia::render('Auth/Login', [
            'registrationEnabled' => SettingsService::isRegistrationEnabled(),
            'appName' => $appName,
        ]);
    }


    /**
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
                $this->loginHistoryService->logAttempt($credentials['email'], false, $request);
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

                $this->loginHistoryService->logAttempt($credentials['email'], false, $request);
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

                $this->loginHistoryService->logAttempt($credentials['email'], false, $request);
                return redirect()->back()->with(['error' => $genericError]);
            }

            if (EmailVerificationService::isVerificationRequired() && !$user->email_verified_at) {
                return redirect()->back()->with(['error' => 'Please verify your email address before logging in.']);
            }

            if ($this->isAccountLocked($user)) {
                Log::warning('Login attempt on locked account', [
                    'user_id' => $user->id,
                    'email' => $credentials['email'],
                    'ip' => $request->ip()
                ]);

                $this->loginHistoryService->logAttempt($credentials['email'], false, $request);
                return redirect()->back()->with(['error' => 'Account temporarily locked due to suspicious activity. Please try again later or contact support.']);
            }

            $this->performSuccessfulLogin($user, $request, $credentials);
            return $this->redirectBasedOnRole($user);

        } catch (\Exception $e) {
            Log::error('Login error', [
                'email' => $credentials['email'],
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            return redirect()->back()->with(['error' => 'An error occurred during login. Please try again.']);
        }
    }

    /**
     * @param Request $request
     * @return RedirectResponse|JsonResponse
     * @throws ValidationException
     */
    public function forgotPassword(Request $request): RedirectResponse|JsonResponse
    {
        $key = 'password-reset:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $errorMessage = 'Too many password reset attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.';

            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 429);
            }

            throw ValidationException::withMessages([
                'email' => [$errorMessage],
            ]);
        }

        $request->validate([
            'email' => 'required|email:rfc|max:255',
        ]);

        $email = strtolower(trim($request->email));
        try {
            $user = User::where('email', $email)->first();
            $successMessage = 'If an account with that email exists, we have sent a password reset link.';

            if (!$user) {
                RateLimiter::hit($key);

                Log::warning('Password reset attempt for non-existent email', [
                    'email' => $email,
                    'ip' => $request->ip()
                ]);

                if ($request->expectsJson()) {
                    return response()->json(['success' => true, 'message' => $successMessage]);
                }
                return back()->with('success', $successMessage);
            }

            $existingToken = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('created_at', '>', now()->subMinutes(5))
                ->first();

            if ($existingToken) {
                if ($request->expectsJson()) {
                    return response()->json(['success' => true, 'message' => $successMessage]);
                }
                return back()->with('success', $successMessage);
            }

            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now()
                ]
            );

            $emailTemplate = EmailTemplate::where('slug', 'password_reset')
                ->where('is_active', true)
                ->first();

            if ($emailTemplate) {
                $resetUrl = url('/reset-password') . '?' . http_build_query([
                        'token' => $token,
                        'email' => $email
                    ]);

                EmailTemplateService::sendTemplateEmail('password_reset', $user, [
                    'user_name' => e($user->name),
                    'reset_link' => $resetUrl,
                ]);
            }

            Log::info('Password reset requested', [
                'user_id' => $user->id,
                'email' => $email,
                'ip' => $request->ip()
            ]);

            RateLimiter::hit($key);

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'message' => $successMessage]);
            }
            return back()->with('success', $successMessage);

        } catch (\Exception $e) {
            Log::error('Password reset error', [
                'email' => $email,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred. Please try again later.'
                ], 500);
            }
            return back()->with('error', 'An error occurred. Please try again later.');
        }
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     * @throws ValidationException
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        $minPasswordLength = Setting::get('password_min_length', 8);
        $validated = $request->validate([
            'token' => 'required|string|max:255',
            'email' => 'required|email:rfc|max:255',
            'password' => [
                'required',
                'string',
                "min:{$minPasswordLength}",
                'max:255',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        ]);

        $email = strtolower(trim($validated['email']));

        try {
            DB::beginTransaction();
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->first();

            if (!$passwordReset || !Hash::check($validated['token'], $passwordReset->token)) {
                Log::warning('Invalid password reset token used', [
                    'email' => $email,
                    'ip' => $request->ip()
                ]);

                throw ValidationException::withMessages([
                    'email' => ['Invalid or expired password reset token.'],
                ]);
            }

            if (Carbon::parse($passwordReset->created_at)->addHour()->isPast()) {
                DB::table('password_reset_tokens')->where('email', $email)->delete();

                throw ValidationException::withMessages([
                    'email' => ['Password reset token has expired.'],
                ]);
            }

            $user = User::where('email', $email)->first();
            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['User not found.'],
                ]);
            }

            if (Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['Please choose a different password.'],
                ]);
            }

            $user->update([
                'password' => Hash::make($validated['password']),
                'remember_token' => Str::random(60),
                'password_changed_at' => now(),
            ]);

            DB::table('password_reset_tokens')->where('email', $email)->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            Log::info('Password reset completed', [
                'user_id' => $user->id,
                'email' => $email,
                'ip' => $request->ip()
            ]);

            DB::commit();
            event(new PasswordReset($user));
            return redirect('/')->with('success', 'Your password has been reset successfully. Please log in with your new password.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Password reset error', [
                'email' => $email,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            throw ValidationException::withMessages([
                'email' => ['An error occurred while resetting your password. Please try again.'],
            ]);
        }
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    /**
     * @param Request $request
     * @return RedirectResponse|\Illuminate\Http\Response
     */
    public function logout(Request $request): \Illuminate\Http\Response|RedirectResponse
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

        if ($request->header('X-Inertia')) {
            return response('', 409)
                ->header('X-Inertia-Location', '/?t=' . time());
        }

        return redirect('/?t=' . time())
            ->with('success', 'You have been logged out successfully.')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * @param User $user
     * @return RedirectResponse
     */
    public function redirectBasedOnRole(User $user): RedirectResponse
    {
        try {
            $intended = session()->pull('url.intended');
            if ($intended && str_starts_with($intended, url('/'))) {
                if ($user->role === RoleStatus::ADMIN->value && str_contains($intended, '/admin/')) {
                    return redirect()->to($intended);
                } elseif ($user->role === RoleStatus::USER->value && str_contains($intended, '/user/')) {
                    return redirect()->to($intended);
                }
            }

            if ($user->role === RoleStatus::ADMIN->value) {
                if (Route::has('admin.dashboard')) {
                    return redirect()->route('admin.dashboard');
                } else {
                    Log::warning('Admin dashboard route not found, redirecting to fallback', [
                        'user_id' => $user->id
                    ]);
                    return redirect('/admin/dashboard');
                }
            } else {
                if (Route::has('user.dashboard')) {
                    return redirect()->route('user.dashboard');
                } else {
                    Log::warning('User dashboard route not found, redirecting to fallback', [
                        'user_id' => $user->id
                    ]);
                    return redirect('/user/dashboard');
                }
            }

        } catch (\Exception $e) {
            Log::error('Role redirection error', [
                'user_id' => $user->id,
                'role' => $user->role,
                'error' => $e->getMessage()
            ]);
            return redirect('/');
        }
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
     * @param Request $request
     * @return string
     */
    protected function throttleKey(Request $request): string
    {
        $email = strtolower($request->input('email', ''));
        return "login_attempts:{$email}:{$request->ip()}";
    }

    /**
     * @param User $user
     * @param Request $request
     * @param array $credentials
     */
    protected function performSuccessfulLogin(User $user, Request $request, array $credentials): void
    {
        Auth::login($user, $credentials['remember'] ?? false);
        $request->session()->regenerate();
        $request->session()->put('last_activity', time());
        $request->session()->put('user_ip', $request->ip());
        $request->session()->put('user_agent_hash', hash('sha256', $request->userAgent() ?? ''));

        $user->update([
            'last_login_at' => now(),
        ]);

        $this->loginHistoryService->logAttempt($credentials['email'], true, $request);
        RateLimiter::clear($this->throttleKey($request));
        Log::info('Successful login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
    }

    /**
     * @param User $user
     * @return bool
     */
    protected function isAccountLocked(User $user): bool
    {
        $lockKey = "account_locked:{$user->id}";
        return Cache::has($lockKey);
    }
}
