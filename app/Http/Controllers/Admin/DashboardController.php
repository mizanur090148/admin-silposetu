<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display admin control center dashboard.
     */
    public function index(): Response
    {
        $stats = [
            'pending_factories' => User::where('account_type', 'factory')->where('status', 'pending')->count(),
            'active_factories' => User::where('account_type', 'factory')->where('status', 'active')->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
            'total_posts' => SubcontractPost::count(),
            'total_quotations' => Quotation::count(),
            'total_users' => User::count(),
        ];

        $recentPending = User::with('factory')
            ->where('account_type', 'factory')
            ->where('status', 'pending')
            ->latest()
            ->take(6)
            ->get();

        $recentPosts = SubcontractPost::with([
            'user:id,name,customer_id',
            'factory:id,user_id,business_name,district',
        ])
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentPending' => $recentPending,
            'recentPosts' => $recentPosts,
        ]);
    }
}
