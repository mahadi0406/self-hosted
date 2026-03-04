<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\UploadedFile;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    use UploadedFile;

    public function index(): Response
    {
        $settings = Setting::all()->groupBy('group')->map(fn($group) =>
        $group->mapWithKeys(fn($s) => [$s->key => [
            'key'         => $s->key,
            'value'       => $s->value,
            'type'        => $s->type,
            'label'       => $s->label,
            'description' => $s->description,
            'group'       => $s->group,
        ]])
        );

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        \Log::info('Settings update', [
            'group' => $group,
            'data' => $request->all(),
            'files' => $request->allFiles(),
        ]);
        $settings = Setting::where('group', $group)->get();

        foreach ($settings as $setting) {
            $key = $setting->key;

            if ($setting->type === 'file') {
                if ($request->hasFile($key)) {
                    $newPath = $this->move($request->file($key), null, $setting->value ?: null);
                    if ($newPath) {
                        $setting->update(['value' => $newPath]);
                    }
                } elseif ($request->input($key) === '__REMOVE__') {
                    if ($setting->value) {
                        $this->removeFile($setting->value);
                    }
                    $setting->update(['value' => '']);
                }
                continue;
            }

            if ($setting->type === 'boolean') {
                $value = $request->input($key);
                $setting->update(['value' => ($value === '1' || $value === 'true' || $value === true) ? '1' : '0']);
                continue;
            }

            if ($setting->type === 'json') {
                if ($request->has($key)) {
                    $value = $request->input($key);
                    if (is_array($value)) {
                        $value = json_encode($value);
                    }
                    $setting->update(['value' => $value]);
                }
                continue;
            }

            if ($request->has($key)) {
                $setting->update(['value' => $request->input($key)]);
            }
        }

        Cache::forget('all_frontend_settings');
        return back()->with('success', ucfirst(str_replace('_', ' ', $group)) . ' settings saved successfully.');
    }
}
