<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
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
        $settings = Setting::where('group', $group)->get();

        foreach ($settings as $setting) {
            $key = $setting->key;

            if ($setting->type === 'file' && $request->hasFile($key)) {
                $path = $request->file($key)->store("settings/{$group}", 'public');
                if ($setting->value && Storage::disk('public')->exists($setting->value)) {
                    Storage::disk('public')->delete($setting->value);
                }
                $setting->update(['value' => $path]);
                continue;
            }

            if ($setting->type === 'boolean') {
                $setting->update(['value' => $request->has($key) ? '1' : '0']);
                continue;
            }

            if ($request->has($key)) {
                $setting->update(['value' => $request->input($key)]);
            }
        }

        return back()->with('success', ucfirst($group) . ' settings saved successfully.');
    }
}
