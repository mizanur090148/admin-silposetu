<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $category = $request->input('category', 'all');
        $verified = $request->input('is_verified', 'all');
        $sponsored = $request->input('is_sponsored', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = Supplier::query()
            ->with('user:id,name,phone,email')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($category !== 'all', function ($q) use ($category): void {
                $q->where('category', $category);
            })
            ->when($verified !== 'all', function ($q) use ($verified): void {
                $q->where('is_verified', $verified === '1');
            })
            ->when($sponsored !== 'all', function ($q) use ($sponsored): void {
                $q->where('is_sponsored', $sponsored === '1');
            });

        $suppliers = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => Supplier::count(),
            'verified' => Supplier::where('is_verified', true)->count(),
            'sponsored' => Supplier::where('is_sponsored', true)->count(),
        ];

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'counts' => $counts,
            'users' => User::orderBy('name')->get(['id', 'name', 'phone', 'role']),
            'filters' => [
                'search' => $search,
                'category' => $category,
                'is_verified' => $verified,
                'is_sponsored' => $sponsored,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:30'],
            'also_categories' => ['nullable', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews_count' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:255'],
            'is_sponsored' => ['boolean'],
            'is_verified' => ['boolean'],
        ]);

        Supplier::create([
            'user_id' => $validated['user_id'] ?? null,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'also_categories_json' => $this->parseCategories($validated['also_categories'] ?? null),
            'area' => $validated['area'],
            'rating' => $validated['rating'] ?? 4.6,
            'reviews_count' => $validated['reviews_count'] ?? 20,
            'description' => $validated['description'],
            'is_sponsored' => $request->boolean('is_sponsored'),
            'is_verified' => $request->boolean('is_verified', true),
        ]);

        return back()->with('success', "Supplier \"{$validated['name']}\" added successfully.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:30'],
            'also_categories' => ['nullable', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews_count' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:255'],
            'is_sponsored' => ['boolean'],
            'is_verified' => ['boolean'],
        ]);

        $supplier->update([
            'user_id' => $validated['user_id'] ?? null,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'also_categories_json' => $this->parseCategories($validated['also_categories'] ?? null),
            'area' => $validated['area'],
            'rating' => $validated['rating'] ?? $supplier->rating,
            'reviews_count' => $validated['reviews_count'] ?? $supplier->reviews_count,
            'description' => $validated['description'],
            'is_sponsored' => $request->boolean('is_sponsored'),
            'is_verified' => $request->boolean('is_verified'),
        ]);

        return back()->with('success', "Supplier \"{$supplier->name}\" updated.");
    }

    public function toggleVerified(int $id): RedirectResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update(['is_verified' => ! $supplier->is_verified]);

        return back()->with('success', "Supplier verification updated for \"{$supplier->name}\".");
    }

    public function toggleSponsored(int $id): RedirectResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update(['is_sponsored' => ! $supplier->is_sponsored]);

        return back()->with('success', "Supplier sponsorship updated for \"{$supplier->name}\".");
    }

    public function destroy(int $id): RedirectResponse
    {
        $supplier = Supplier::findOrFail($id);
        $name = $supplier->name;

        DB::transaction(function () use ($supplier): void {
            User::where('supplier_id', $supplier->id)->update(['supplier_id' => null]);
            $supplier->delete();
        });

        return back()->with('success', "Supplier \"{$name}\" deleted.");
    }

    /**
     * @return list<string>
     */
    private function parseCategories(?string $input): array
    {
        return collect(explode(',', (string) $input))
            ->map(fn (string $v): string => trim($v))
            ->filter()
            ->values()
            ->all();
    }
}
