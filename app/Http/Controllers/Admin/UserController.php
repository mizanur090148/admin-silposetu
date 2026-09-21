<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display list of all users.
     */
    public function index(Request $request): Response
    {
        $role = $request->input('role', 'all');
        $status = $request->input('status', 'all');
        $search = $request->input('search', '');

        $query = User::with('factory');

        if ($role !== 'all') {
            $query->where('account_type', $role);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('customer_id', 'like', $term);
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'role' => $role,
                'status' => $status,
                'search' => $search,
            ],
            'stats' => [
                'total' => User::count(),
                'factories' => User::where('account_type', 'factory')->count(),
                'buyers' => User::where('account_type', 'buyer')->count(),
                'admins' => User::where('account_type', 'admin')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
            ],
        ]);
    }

    /**
     * Toggle status between active and suspended.
     */
    public function toggleStatus(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot suspend your own administrator account.');
        }

        $newStatus = $user->status === 'active' ? 'suspended' : 'active';
        $user->update(['status' => $newStatus]);

        $statusText = $newStatus === 'active' ? 'activated' : 'suspended';

        return back()->with('success', "User '{$user->name}' has been successfully {$statusText}.");
    }
}
