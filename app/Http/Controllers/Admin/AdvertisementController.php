<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdvertisementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status', 'all');
        $placement = $request->input('placement', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = Advertisement::query()
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('org_name', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('contact_phone', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($placement !== 'all', function ($q) use ($placement): void {
                $q->where('placement', $placement);
            });

        $advertisements = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => Advertisement::count(),
            'pending' => Advertisement::where('status', 'pending')->count(),
            'active' => Advertisement::where('status', 'active')->count(),
            'paused' => Advertisement::where('status', 'paused')->count(),
        ];

        return Inertia::render('Admin/Advertisements/Index', [
            'advertisements' => $advertisements,
            'counts' => $counts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'placement' => $placement,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'org_name' => ['required', 'string', 'max:255'],
            'placement' => ['required', 'string', 'max:30'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['required', 'string', 'max:255'],
            'duration_label' => ['required', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'status' => ['required', 'string', Rule::in(['pending', 'active', 'paused', 'rejected'])],
        ]);

        Advertisement::create($validated);

        return back()->with('success', "Advertisement \"{$validated['title']}\" created.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'org_name' => ['required', 'string', 'max:255'],
            'placement' => ['required', 'string', 'max:30'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['required', 'string', 'max:255'],
            'duration_label' => ['required', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'status' => ['required', 'string', Rule::in(['pending', 'active', 'paused', 'rejected'])],
        ]);

        $ad->update($validated);

        return back()->with('success', "Advertisement \"{$ad->title}\" updated.");
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'active', 'paused', 'rejected'])],
        ]);

        $ad->update(['status' => $validated['status']]);

        return back()->with('success', "Advertisement status set to {$validated['status']}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $ad = Advertisement::findOrFail($id);
        $title = $ad->title;
        $ad->delete();

        return back()->with('success', "Advertisement \"{$title}\" deleted.");
    }
}
