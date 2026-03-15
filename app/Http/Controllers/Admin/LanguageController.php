<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function index()
    {
        $languages = Language::withCount('translations')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Languages/Index', [
            'languages' => $languages,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'        => 'required|string|max:10|unique:languages,code',
            'name'        => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'flag'        => 'nullable|string|max:20',
            'is_active'   => 'boolean',
        ]);

        $data['is_default'] = false;
        $data['is_active']  = $data['is_active'] ?? true;

        // Seed translations from en.json for new language as a starting point
        $language = Language::create($data);

        $jsonPath = resource_path('js/lang/en.json');
        if (file_exists($jsonPath)) {
            $translations = json_decode(file_get_contents($jsonPath), true) ?? [];
            foreach ($translations as $key => $value) {
                Translation::create([
                    'language_id' => $language->id,
                    'key'         => $key,
                    'value'       => $value,
                ]);
            }
        }

        $this->clearCache();

        return back()->with('success', 'Language created successfully.');
    }

    public function update(Request $request, Language $language)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'flag'        => 'nullable|string|max:20',
            'is_active'   => 'boolean',
            'is_default'  => 'boolean',
        ]);

        if (! empty($data['is_default'])) {
            Language::where('id', '!=', $language->id)->update(['is_default' => false]);
        }

        $language->update($data);
        $this->clearCache($language->code);

        return back()->with('success', 'Language updated successfully.');
    }

    public function destroy(Language $language)
    {
        if ($language->is_default) {
            return back()->with('error', 'Cannot delete the default language.');
        }

        $code = $language->code;
        $language->delete();
        $this->clearCache($code);

        return back()->with('success', 'Language deleted successfully.');
    }

    public function translations(Language $language, Request $request)
    {
        $search = $request->get('search');

        $query = $language->translations()->orderBy('key');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%");
            });
        }

        $translations = $query->paginate(50)->withQueryString();

        return Inertia::render('Admin/Languages/Translations', [
            'language'     => $language,
            'translations' => $translations,
            'filters'      => ['search' => $search],
        ]);
    }

    public function bulkUpdateTranslations(Request $request, Language $language)
    {
        $data = $request->validate([
            'translations'   => 'required|array',
            'translations.*' => 'string',
        ]);

        foreach ($data['translations'] as $key => $value) {
            Translation::updateOrCreate(
                ['language_id' => $language->id, 'key' => $key],
                ['value'       => $value]
            );
        }

        $this->clearCache($language->code);

        return back()->with('success', 'Translations saved successfully.');
    }

    private function clearCache(?string $code = null): void
    {
        Cache::forget('languages_active');
        Cache::forget('languages_all');
        if ($code) {
            Cache::forget("translations_{$code}");
            Cache::forget("lang_{$code}");
        }
    }
}
