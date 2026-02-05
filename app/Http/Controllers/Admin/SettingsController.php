<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\UploadedFile;
use App\Http\Controllers\Controller;
use App\Mail\GlobalMail;
use App\Models\Setting;
use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    use UploadedFile;

    public function index(): Response
    {
        $logo = Setting::get('site_logo', '');
        $favicon = Setting::get('site_favicon', '');

        $emailTemplates = EmailTemplate::all()->map(function($template) {
            return [
                'id' => $template->id,
                'slug' => $template->slug,
                'name' => $template->name,
                'subject' => $template->subject,
                'body' => $template->body,
                'variables' => is_array($template->variables) ? $template->variables : [],
                'is_active' => (bool) $template->is_active,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ];
        });

        return Inertia::render('Admin/Settings/Index', [
            'generalSettings' => Setting::getByGroup('general'),
            'emailSettings' => Setting::getByGroup('email'),
            'securitySettings' => Setting::getByGroup('security'),
            'seoSettings' => Setting::getByGroup('seo'),
            'p2pSettings' => Setting::getByGroup('p2p'),
            'exchangeSettings' => Setting::getByGroup('exchange'),
            'walletSettings' => Setting::getByGroup('wallet'),
            'web3Settings' => Setting::getByGroup('web3'),
            'emailTemplates' => $emailTemplates,
            'site_logo_url' => $logo ? $this->fullPath($logo) : null,
            'site_favicon_url' => $favicon ? $this->fullPath($favicon) : null,
        ]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateWeb3(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'walletconnect_project_id' => 'nullable|string|max:255',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                'text',
                ucwords(str_replace('_', ' ', $key)),
                'web3'
            );
        }

        return back()->with('success', 'Web3 settings updated successfully.');
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'site_name' => 'required|string|max:255',
                'site_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'site_favicon' => 'nullable|image|mimes:ico,png,gif|max:1024',
                'primary_color' => 'nullable|string|max:7',
                'default_currency' => 'required|string|max:3',
                'currency_symbol' => 'required|string|max:5',
                'default_timezone' => 'required|string|max:50',
                'tawk_property_id' => 'nullable|string',
                'tawk_widget_id' => 'nullable|string',
            ]);

            Cache::forget('all_frontend_settings');
            $validated['site_logo'] = Setting::get('site_logo', '');
            $validated['site_favicon'] = Setting::get('site_favicon', '');

            if ($request->hasFile('site_logo')) {
                $logoFileName = Setting::get('site_logo', '');
                $logoPath = $this->move($request->file('site_logo'), null, $logoFileName);
                $validated['site_logo'] = $logoPath;
            }

            if ($request->hasFile('site_favicon')) {
                $faviconName = Setting::get('site_favicon', '');
                $faviconPath = $this->move($request->file('site_favicon'), null, $faviconName);
                $validated['site_favicon'] = $faviconPath;
            }

            foreach ($validated as $key => $value) {
                Setting::set(
                    $key,
                    $value,
                    in_array($key, ['site_logo', 'site_favicon']) ? 'file' : (is_bool($value) ? 'boolean' : 'text'),
                    ucwords(str_replace('_', ' ', $key)),
                    'general'
                );
            }

            return back()->with('success', 'General settings updated successfully.');
        }catch (\Exception $e) {
            return back()->with('error', 'General settings updated failed.');
        }
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateEmail(Request $request): RedirectResponse
    {
        $settings = $request->validate([
            'mail_driver' => 'required|in:smtp,mailgun,ses',
            'mail_host' => 'required_if:mail_driver,smtp|string',
            'mail_port' => 'required_if:mail_driver,smtp|integer',
            'mail_username' => 'required_if:mail_driver,smtp|string',
            'mail_password' => 'required_if:mail_driver,smtp|string',
            'mail_encryption' => 'nullable|in:tls,ssl',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($settings as $key => $value) {
            Setting::set(
                $key,
                $value,
                'text',
                ucwords(str_replace('_', ' ', $key)),
                'email'
            );
        }

        return back()->with('success', 'Email settings updated successfully.');
    }


    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateSecurity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'two_factor_auth' => 'boolean',
            'login_attempts' => 'required|integer|min:3|max:10',
            'session_timeout' => 'required|integer|min:5|max:1440',
            'password_min_length' => 'required|integer|min:6|max:20',
            'require_email_verification' => 'boolean',
            'kyc_status' => 'boolean',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                is_bool($value) ? 'boolean' : 'text',
                ucwords(str_replace('_', ' ', $key)),
                'security'
            );
        }

        return back()->with('success', 'Security settings updated successfully.');
    }


    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateSeo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'google_analytics' => 'nullable|string',
        ]);

        Cache::forget('all_frontend_settings');
        $validated['og_image'] = Setting::get('og_image', '');

        if ($request->hasFile('og_image')) {
            $ogImageName = Setting::get('og_image', '');
            $ogImagePath = $this->move($request->file('og_image'), null, $ogImageName);
            $validated['og_image'] = $ogImagePath;
        }

        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                $key === 'og_image' ? 'file' : 'text',
                ucwords(str_replace('_', ' ', $key)),
                'seo'
            );
        }

        return back()->with('success', 'SEO settings updated successfully.');
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateP2p(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'p2p_enabled' => 'boolean',
            'p2p_fee_percentage' => 'required|numeric|min:0|max:100',
            'p2p_min_trade_amount' => 'required|numeric|min:0',
            'p2p_max_trade_amount' => 'required|numeric|min:0',
            'p2p_default_time_limit' => 'required|integer|min:5|max:60',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                is_bool($value) ? 'boolean' : 'number',
                ucwords(str_replace('_', ' ', $key)),
                'p2p'
            );
        }

        return back()->with('success', 'P2P settings updated successfully.');
    }


    /**
     * @param Request $request
     * @param EmailTemplate $emailTemplate
     * @return RedirectResponse
     */
    public function updateEmailTemplate(Request $request, EmailTemplate $emailTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $emailTemplate->update($validated);
        return back()->with('success', 'Email template updated successfully.');
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateExchange(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exchange_enabled' => 'boolean',
            'exchange_fee_percentage' => 'required|numeric|min:0|max:100',
            'exchange_daily_limit' => 'required|numeric|min:0',
            'exchange_price_alerts_enabled' => 'boolean',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                is_bool($value) ? 'boolean' : 'number',
                ucwords(str_replace('_', ' ', $key)),
                'exchange'
            );
        }

        return back()->with('success', 'Exchange settings updated successfully.');
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function updateWallet(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'withdrawal_enabled' => 'boolean',
            'withdrawal_min_amount' => 'required|numeric|min:0',
            'withdrawal_crypto_fee_percentage' => 'required|numeric|min:0|max:100',
            'withdrawal_crypto_fee_fixed' => 'required|numeric|min:0',
            'withdrawal_fiat_fee_percentage' => 'required|numeric|min:0|max:100',
            'withdrawal_fiat_fee_fixed' => 'required|numeric|min:0',
        ]);

        Cache::forget('all_frontend_settings');
        foreach ($validated as $key => $value) {
            Setting::set(
                $key,
                $value,
                is_bool($value) ? 'boolean' : 'number',
                ucwords(str_replace('_', ' ', $key)),
                'wallet'
            );
        }

        return back()->with('success', 'Wallet settings updated successfully.');
    }


    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function testEmail(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'required|max:255',
        ]);

        $user = User::where('role', 'admin')->first();
        Mail::to($request->input('email'))->send(new GlobalMail($user, 'Test Email', $request->input('message')));
        return back()->with('success', 'Test email sent successfully.');
    }
}
