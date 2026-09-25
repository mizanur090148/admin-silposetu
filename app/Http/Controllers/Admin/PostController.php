<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
