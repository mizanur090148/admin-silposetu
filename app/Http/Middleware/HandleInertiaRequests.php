<?php

namespace App\Http\Middleware;

use App\Models\Advertisement;
use App\Models\FreeMachineRequest;
use App\Models\MessageThread;
use App\Models\QcInspection;
use App\Models\SupplierRfq;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin' && $user->is_active;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'designation' => $user->designation,
                    'organization_name' => $user->organization_name,
                    'is_active' => $user->is_active,
                    'subscription_plan' => $user->subscription_plan,
                    'billing_cycle' => $user->billing_cycle,
                ] : null,
            ],
            'badges' => $isAdmin ? [
                'newMachineRequests' => fn (): int => FreeMachineRequest::where('status', 'new')->count(),
                'newRfqs' => fn (): int => SupplierRfq::where('status', 'new')->count(),
                'pendingAds' => fn (): int => Advertisement::where('status', 'pending')->count(),
                'unreadThreads' => fn (): int => MessageThread::where('unread_count', '>', 0)->count(),
                'pendingQc' => fn (): int => QcInspection::all(['factory_sign_json', 'vendor_sign_json'])
                    ->filter(fn (QcInspection $qc): bool => empty(($qc->factory_sign_json ?? [])['v']) || empty(($qc->vendor_sign_json ?? [])['v']))
                    ->count(),
            ] : [
                'newMachineRequests' => 0,
                'newRfqs' => 0,
                'pendingAds' => 0,
                'unreadThreads' => 0,
                'pendingQc' => 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'importReport' => fn () => $request->session()->get('importReport'),
            ],
        ];
    }
}
