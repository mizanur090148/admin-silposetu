<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\SubcontractPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Display list of subcontract posts for moderation.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 15;
        }

        $query = SubcontractPost::with([
            'user:id,name,customer_id,phone',
            'factory:id,user_id,business_name,district',
        ]);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('district', 'like', $term);
            });
        }

        $posts = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'totalPosts' => SubcontractPost::count(),
        ]);
    }

    /**
     * Show form to create a new subcontract post on behalf of a factory.
     */
    public function create(Request $request): Response
    {
        $selectedFactoryId = $request->query('factory_id');

        $factories = Factory::query()
            ->select('id', 'user_id', 'business_name', 'district', 'address', 'contact_person', 'phone', 'is_verified')
            ->orderBy('business_name')
            ->get();

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Admin/Posts/Create', [
            'factories' => $factories,
            'knittingTypes' => $knittingTypes,
            'selectedFactoryId' => $selectedFactoryId ? (int) $selectedFactoryId : null,
        ]);
    }

    /**
     * Store newly created subcontract post for a factory.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factory_id' => ['required', 'exists:factories,id'],
            'post_type' => ['required', 'in:DEMAND,SUPPLY'],
            'category' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'target_quantity' => ['required', 'integer', 'min:1'],
            'unit' => ['required', 'string', 'max:30'],
            'target_rate' => ['nullable', 'numeric', 'min:0'],
            'rate_negotiable' => ['boolean'],
            'deadline' => ['nullable', 'date'],
            'district' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'is_urgent' => ['boolean'],
            'specs' => ['nullable', 'array'],
        ]);

        $factory = Factory::with('user')->findOrFail($validated['factory_id']);
        $userId = $factory->user_id ?? $request->user()->id;

        $post = SubcontractPost::create([
            'user_id' => $userId,
            'factory_id' => $factory->id,
            'post_type' => $validated['post_type'],
            'category' => $validated['category'],
            'title' => $validated['title'],
            'target_quantity' => $validated['target_quantity'],
            'unit' => $validated['unit'],
            'target_rate' => $validated['target_rate'] ?? null,
            'rate_negotiable' => $validated['rate_negotiable'] ?? true,
            'deadline' => $validated['deadline'] ?? null,
            'district' => $validated['district'],
            'address' => $validated['address'] ?? $factory->address,
            'description' => $validated['description'],
            'specs' => $validated['specs'] ?? [],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'status' => 'open',
        ]);

        return redirect()->route('admin.posts.index')
            ->with('success', "Subcontract post '{$post->title}' published successfully for factory '{$factory->business_name}'.");
    }

    /**
     * Delete/Remove a post as admin.
     */
    public function destroy(int $id): RedirectResponse
    {
        $post = SubcontractPost::findOrFail($id);
        $title = $post->title;
        $post->delete();

        return back()->with('success', "Subcontract post '{$title}' has been deleted successfully.");
    }
}
