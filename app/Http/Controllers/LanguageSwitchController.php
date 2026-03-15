<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;

class LanguageSwitchController extends Controller
{
    public function change(Request $request)
    {
        $data = $request->validate([
            'language' => 'required|string|max:10',
        ]);

        $language = Language::where('code', $data['language'])
            ->where('is_active', true)
            ->first();

        if (! $language) {
            return response()->json(['error' => 'Language not found.'], 422);
        }

        $request->session()->put('app_language', $data['language']);

        return response()->json(['success' => true, 'language' => $data['language']]);
    }
}
