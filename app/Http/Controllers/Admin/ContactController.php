<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Contact::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('phone', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('telegram_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('ai_label') && $request->ai_label !== 'all') {
            $query->where('ai_engagement_label', $request->ai_label);
        }

        $contacts = $query->latest()->paginate(15)->withQueryString()
            ->through(fn($c) => [
                'id'                  => $c->id,
                'name'                => $c->name,
                'phone'               => $c->phone,
                'telegram_id'         => $c->telegram_id,
                'email'               => $c->email,
                'country'             => $c->country,
                'language'            => $c->language,
                'tags'                => $c->tags,
                'status'              => $c->status,
                'ai_engagement_label' => $c->ai_engagement_label,
                'last_messaged_at'    => $c->last_messaged_at?->format('Y-m-d H:i'),
                'created_at'          => $c->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'      => Contact::count(),
            'active'     => Contact::where('status', 'active')->count(),
            'opted_out'  => Contact::where('status', 'opted_out')->count(),
            'hot_leads'  => Contact::where('ai_engagement_label', 'hot')->count(),
        ];

        $lists = ContactList::select('id', 'name')->get();

        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => $contacts,
            'stats'    => $stats,
            'lists'    => $lists,
            'filters'  => $request->only(['search', 'status', 'ai_label']),
        ]);
    }

    public function create(): Response
    {
        $lists = ContactList::select('id', 'name')->get();

        return Inertia::render('Admin/Contacts/Create', [
            'lists' => $lists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'nullable|string|unique:contacts,phone',
            'telegram_id' => 'nullable|string|unique:contacts,telegram_id',
            'email'       => 'nullable|email',
            'country'     => 'nullable|string|max:10',
            'language'    => 'nullable|string|max:10',
            'tags'        => 'nullable|array',
            'list_ids'    => 'nullable|array',
            'list_ids.*'  => 'exists:contact_lists,id',
        ]);

        $contact = Contact::create($request->only([
            'name', 'phone', 'telegram_id', 'email',
            'country', 'language', 'tags',
        ]));

        if ($request->filled('list_ids')) {
            $contact->lists()->sync($request->list_ids);
        }

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    public function importView(): Response
    {
        $lists = ContactList::select('id', 'name')->get();

        return Inertia::render('Admin/Contacts/Import', [
            'lists' => $lists,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file'       => 'required|file|mimes:csv,txt|max:10240',
            'list_ids'   => 'nullable|array',
            'list_ids.*' => 'exists:contact_lists,id',
        ]);

        $file  = $request->file('file');
        $rows  = array_map('str_getcsv', file($file->getRealPath()));
        $header = array_map('strtolower', array_map('trim', array_shift($rows)));

        $imported = 0;
        $skipped  = 0;

        foreach ($rows as $row) {
            if (count($row) !== count($header)) continue;
            $data = array_combine($header, $row);

            $phone      = !empty($data['phone'])       ? trim($data['phone'])       : null;
            $telegramId = !empty($data['telegram_id']) ? trim($data['telegram_id']) : null;

            if (!$phone && !$telegramId) { $skipped++; continue; }

            $exists = Contact::where(function ($q) use ($phone, $telegramId) {
                if ($phone)      $q->orWhere('phone', $phone);
                if ($telegramId) $q->orWhere('telegram_id', $telegramId);
            })->exists();

            if ($exists) { $skipped++; continue; }

            $contact = Contact::create([
                'name'        => trim($data['name']     ?? 'Unknown'),
                'phone'       => $phone,
                'telegram_id' => $telegramId,
                'email'       => !empty($data['email'])   ? trim($data['email'])   : null,
                'country'     => !empty($data['country']) ? trim($data['country']) : null,
                'language'    => !empty($data['language'])? trim($data['language']): 'en',
            ]);

            if ($request->filled('list_ids')) {
                $contact->lists()->sync($request->list_ids);
            }

            $imported++;
        }

        return redirect()->route('admin.contacts.index')
            ->with('success', "Import complete. {$imported} imported, {$skipped} skipped.");
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact deleted successfully.');
    }
}
