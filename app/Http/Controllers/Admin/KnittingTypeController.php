<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KnittingType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KnittingTypeController extends Controller
{
    /**
     * Display a listing of knitting types.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');

        $query = KnittingType::withCount('factories');

        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('slug', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $knittingTypes = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        $stats = [
            'total' => KnittingType::count(),
            'active' => KnittingType::where('is_active', true)->count(),
            'inactive' => KnittingType::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/KnittingTypes/Index', [
            'knittingTypes' => $knittingTypes,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created knitting type.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:knitting_types,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        
        // Ensure slug uniqueness if auto-generated
        $originalSlug = $slug;
        $counter = 1;
        while (KnittingType::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $maxSort = KnittingType::max('sort_order') ?? 0;

        KnittingType::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? ($maxSort + 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.knitting-types.index')
            ->with('success', "Knitting type '{$validated['name']}' created successfully.");
    }

    /**
     * Update the specified knitting type.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $knittingType = KnittingType::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:knitting_types,slug,' . $id],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $knittingType->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $knittingType->sort_order,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.knitting-types.index')
            ->with('success', "Knitting type '{$knittingType->name}' updated successfully.");
    }

    /**
     * Toggle active status of the specified knitting type.
     */
    public function toggle(int $id): RedirectResponse
    {
        $knittingType = KnittingType::findOrFail($id);
        $knittingType->update([
            'is_active' => ! $knittingType->is_active,
        ]);

        $statusStr = $knittingType->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Knitting type '{$knittingType->name}' is now {$statusStr}.");
    }

    /**
     * Remove the specified knitting type.
     */
    public function destroy(int $id): RedirectResponse
    {
        $knittingType = KnittingType::findOrFail($id);
        $name = $knittingType->name;

        // Detach related factories
        $knittingType->factories()->detach();
        $knittingType->delete();

        return redirect()->route('admin.knitting-types.index')
            ->with('success', "Knitting type '{$name}' deleted successfully.");
    }
}
