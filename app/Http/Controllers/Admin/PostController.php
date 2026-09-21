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

        $posts = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'filters' => [
                'search' => $search,
                'status' => $status,
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

        return back()->with('success', "সাবকন্ট্রাক্ট পোস্ট '{$title}' সফলভাবে মুছে ফেলা হয়েছে।");
    }
}
