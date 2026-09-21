<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FactoryController extends Controller
{
    /**
     * Display list of factories filtered by tab & search query.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'pending');
        $search = $request->input('search', '');
        $district = $request->input('district', 'all');

        $query = User::with('factory')
            ->where('account_type', 'factory');

        // Apply tab status filter
        if ($tab === 'pending') {
            $query->where('status', 'pending');
        } elseif ($tab === 'active') {
            $query->where('status', 'active');
        } elseif ($tab === 'suspended') {
            $query->where('status', 'suspended');
        }

        // Apply search
        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('customer_id', 'like', $term)
                    ->orWhereHas('factory', function ($fq) use ($term) {
                        $fq->where('business_name', 'like', $term)
                            ->orWhere('district', 'like', $term);
                    });
            });
        }

        // Apply district filter
        if (! empty($district) && $district !== 'all') {
            $query->whereHas('factory', function ($fq) use ($district) {
                $fq->where('district', $district);
            });
        }

        $factories = $query->latest()->paginate(15)->withQueryString();

        $counts = [
            'pending' => User::where('account_type', 'factory')->where('status', 'pending')->count(),
            'active' => User::where('account_type', 'factory')->where('status', 'active')->count(),
            'suspended' => User::where('account_type', 'factory')->where('status', 'suspended')->count(),
            'all' => User::where('account_type', 'factory')->count(),
        ];

        $districts = Factory::select('district')
            ->whereNotNull('district')
            ->distinct()
            ->pluck('district');

        return Inertia::render('Admin/Factories/Index', [
            'factories' => $factories,
            'counts' => $counts,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'district' => $district,
            ],
            'districts' => $districts,
        ]);
    }

    /**
     * Show full factory KYC profile & details for admin review.
     */
    public function show(int $id): Response
    {
        $user = User::with([
            'factory',
            'subcontractPosts' => fn ($q) => $q->latest()->take(5),
            'quotations' => fn ($q) => $q->latest()->take(5),
        ])->findOrFail($id);

        return Inertia::render('Admin/Factories/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Approve & activate factory account.
     */
    public function approve(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        if ($user->factory) {
            $user->factory->update(['is_verified' => true]);
        }

        return back()->with('success', "ফ্যাক্টরি '{$user->name}' সফলভাবে অ্যাক্টিভ ও ভেরিফাইড করা হয়েছে।");
    }

    /**
     * Block/Suspend factory account.
     */
    public function block(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'suspended']);

        return back()->with('success', "ফ্যাক্টরি '{$user->name}' সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে।");
    }

    /**
     * Unblock factory account.
     */
    public function unblock(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        return back()->with('success', "ফ্যাক্টরি '{$user->name}' সফলভাবে আনব্লক করা হয়েছে।");
    }
}
