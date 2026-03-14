<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\UploadedFile;
use App\Http\Controllers\Controller;
use App\Jobs\ImportContactsJob;
use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ContactController extends Controller
{
    use UploadedFile;
    public function index(Request $request): Response
    {
        $query = Contact::with('lists:id,name');

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

        if ($request->filled('list_id') && $request->list_id !== 'all') {
            $query->whereHas('lists', function ($q) use ($request) {
                $q->where('contact_lists.id', $request->list_id);
            });
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
                'lists'               => $c->lists->map(fn($list) => [
                    'id'   => $list->id,
                    'name' => $list->name,
                ])->toArray(),
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
            'filters'  => $request->only(['search', 'status', 'ai_label', 'list_id']),
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
        if ($request->has('tags') && is_string($request->tags)) {
            $request->merge([
                'tags' => array_filter(array_map('trim', explode(',', $request->tags)))
            ]);
        }

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
            $this->recalculateListCounts($request->list_ids);
        }

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    public function edit(Contact $contact): Response
    {
        $lists = ContactList::select('id', 'name')->get();

        return Inertia::render('Admin/Contacts/Edit', [
            'contact' => [
                'id'          => $contact->id,
                'name'        => $contact->name,
                'phone'       => $contact->phone,
                'telegram_id' => $contact->telegram_id,
                'email'       => $contact->email,
                'country'     => $contact->country,
                'language'    => $contact->language,
                'tags'        => $contact->tags ?? [],
                'status'      => $contact->status,
                'list_ids'    => $contact->lists()->pluck('contact_lists.id')->toArray(),
            ],
            'lists' => $lists,
        ]);
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        if ($request->has('tags') && is_string($request->tags)) {
            $request->merge([
                'tags' => array_filter(array_map('trim', explode(',', $request->tags)))
            ]);
        }

        $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'nullable|string|unique:contacts,phone,' . $contact->id,
            'telegram_id' => 'nullable|string|unique:contacts,telegram_id,' . $contact->id,
            'email'       => 'nullable|email',
            'country'     => 'nullable|string|max:10',
            'language'    => 'nullable|string|max:10',
            'tags'        => 'nullable|array',
            'status'      => 'nullable|in:active,opted_out,unsubscribed',
            'list_ids'    => 'nullable|array',
            'list_ids.*'  => 'exists:contact_lists,id',
        ]);

        $oldStatus  = $contact->status;
        $newStatus  = $request->input('status', $oldStatus);
        $oldListIds = $contact->lists()->pluck('contact_lists.id')->toArray();

        $contact->update($request->only([
            'name', 'phone', 'telegram_id', 'email',
            'country', 'language', 'tags', 'status',
        ]));

        $newListIds    = $request->input('list_ids', []);
        $contact->lists()->sync($newListIds);

        $affectedIds = array_unique(array_merge($oldListIds, $newListIds));

        if (!empty($affectedIds)) {
            $statusChanged = $oldStatus !== $newStatus;
            if ($statusChanged) {
                $this->recalculateListCounts($affectedIds);
            } else {
                $this->recalculateListCounts($affectedIds);
            }
        }

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact updated successfully.');
    }

    private function recalculateListCounts(array $listIds): void
    {
        ContactList::whereIn('id', $listIds)->each(function ($list) {
            $list->update([
                'contacts_count' => $list->contacts()->where('status', 'active')->count(),
            ]);
        });
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
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'list_ids'   => 'nullable|array',
            'list_ids.*' => 'exists:contact_lists,id',
        ]);

        $filename = $this->move($request->file('file'));

        ImportContactsJob::dispatch($filename, $request->input('list_ids', []));

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Import queued. Contacts will be added in the background.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $listIds = $contact->lists()->pluck('contact_lists.id')->toArray();

        $contact->delete();

        if (!empty($listIds)) {
            $this->recalculateListCounts($listIds);
        }

        return redirect()->back()
            ->with('success', 'Contact deleted successfully.');
    }

}
