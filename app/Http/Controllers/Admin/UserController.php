<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $role = $request->input('role', 'all');
        $activeFilter = $request->input('is_active', 'all');
        $plan = $request->input('subscription_plan', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = User::query()
            ->with(['factory:id,code,name', 'vendor:id,code,name', 'supplier:id,name'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('organization_name', 'like', "%{$search}%")
                        ->orWhere('partner_code', 'like', "%{$search}%");
                });
            })
            ->when($role !== 'all', function ($q) use ($role): void {
                $q->where('role', $role);
            })
            ->when($activeFilter !== 'all', function ($q) use ($activeFilter): void {
                $q->where('is_active', $activeFilter === '1');
            })
            ->when($plan !== 'all', function ($q) use ($plan): void {
                $q->where('subscription_plan', $plan);
            });

        $users = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'fac' => User::where('role', 'fac')->count(),
            'ven' => User::where('role', 'ven')->count(),
            'sup' => User::where('role', 'sup')->count(),
            'par' => User::where('role', 'par')->count(),
            'admin' => User::where('role', 'admin')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'counts' => $counts,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'is_active' => $activeFilter,
                'subscription_plan' => $plan,
                'per_page' => $perPage,
            ],
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'vendors' => Vendor::orderBy('name')->get(['id', 'code', 'name']),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', Rule::unique('users', 'phone')],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['admin', 'fac', 'ven', 'sup', 'par'])],
            'designation' => ['nullable', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'factory_id' => ['nullable', 'integer', 'exists:factories,id'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'partner_code' => ['nullable', 'string', 'max:30'],
            'party_code' => ['nullable', 'string', 'max:50'],
            'is_owner' => ['boolean'],
            'is_vendor_rep' => ['boolean'],
            'can_message' => ['boolean'],
            'is_active' => ['boolean'],
            'subscription_plan' => ['required', 'string', 'max:20'],
            'billing_cycle' => ['required', 'string', Rule::in(['m', 'y'])],
            'trial_ends_at' => ['nullable', 'date'],
        ]);

        User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'],
            'designation' => $validated['designation'] ?? null,
            'organization_name' => $validated['organization_name'] ?? null,
            'factory_id' => $validated['factory_id'] ?? null,
            'vendor_id' => $validated['vendor_id'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'partner_code' => $validated['partner_code'] ?? null,
            'party_code' => $validated['party_code'] ?? null,
            'is_owner' => $request->boolean('is_owner'),
            'is_vendor_rep' => $request->boolean('is_vendor_rep'),
            'can_message' => $request->boolean('can_message', true),
            'is_active' => $request->boolean('is_active', true),
            'phone_verified_at' => now(),
            'subscription_plan' => $validated['subscription_plan'],
            'billing_cycle' => $validated['billing_cycle'],
            'trial_ends_at' => $validated['trial_ends_at'] ?? null,
        ]);

        return back()->with('success', "User \"{$validated['name']}\" created successfully.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', Rule::unique('users', 'phone')->ignore($user->id)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['admin', 'fac', 'ven', 'sup', 'par'])],
            'designation' => ['nullable', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'factory_id' => ['nullable', 'integer', 'exists:factories,id'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'partner_code' => ['nullable', 'string', 'max:30'],
            'party_code' => ['nullable', 'string', 'max:50'],
            'is_owner' => ['boolean'],
            'is_vendor_rep' => ['boolean'],
            'can_message' => ['boolean'],
            'is_active' => ['boolean'],
            'subscription_plan' => ['required', 'string', 'max:20'],
            'billing_cycle' => ['required', 'string', Rule::in(['m', 'y'])],
            'trial_ends_at' => ['nullable', 'date'],
        ]);

        if ($user->id === Auth::id() && $validated['role'] !== 'admin') {
            return back()->with('error', 'You cannot remove your own admin role.');
        }

        if ($user->id === Auth::id() && ! $request->boolean('is_active', true)) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $payload = [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'role' => $validated['role'],
            'designation' => $validated['designation'] ?? null,
            'organization_name' => $validated['organization_name'] ?? null,
            'factory_id' => $validated['factory_id'] ?? null,
            'vendor_id' => $validated['vendor_id'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'partner_code' => $validated['partner_code'] ?? null,
            'party_code' => $validated['party_code'] ?? null,
            'is_owner' => $request->boolean('is_owner'),
            'is_vendor_rep' => $request->boolean('is_vendor_rep'),
            'can_message' => $request->boolean('can_message', true),
            'is_active' => $request->boolean('is_active', true),
            'subscription_plan' => $validated['subscription_plan'],
            'billing_cycle' => $validated['billing_cycle'],
            'trial_ends_at' => $validated['trial_ends_at'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

        return back()->with('success', "User \"{$user->name}\" updated successfully.");
    }

    public function toggleStatus(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot deactivate your own active session account.');
        }

        $user->update(['is_active' => ! $user->is_active]);
        $state = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User \"{$user->name}\" has been {$state}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own signed-in account.');
        }

        $name = $user->name;

        DB::transaction(function () use ($user): void {
            Factory::where('owner_id', $user->id)->update(['owner_id' => null]);
            $user->delete();
        });

        return back()->with('success', "User \"{$name}\" deleted successfully.");
    }
}
