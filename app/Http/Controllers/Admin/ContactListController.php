<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ContactListController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ContactList::query();
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        $lists = $query->latest()->paginate(15)->withQueryString()
            ->through(fn($l) => [
                'id'             => $l->id,
                'name'           => $l->name,
                'description'    => $l->description,
                'contacts_count' => $l->contacts_count,
                'created_at'     => $l->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total'    => ContactList::count(),
            'contacts' => ContactList::sum('contacts_count'),
        ];

        return Inertia::render('Admin/ContactLists/Index', [
            'lists'   => $lists,
            'stats'   => $stats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ContactLists/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        ContactList::create([
            'name'        => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('admin.contact-lists.index')
            ->with('success', 'Contact list created successfully.');
    }

    public function destroy(ContactList $contactList): RedirectResponse
    {
        $contactList->delete();

        return redirect()->route('admin.contact-lists.index')
            ->with('success', 'Contact list deleted successfully.');
    }
}
