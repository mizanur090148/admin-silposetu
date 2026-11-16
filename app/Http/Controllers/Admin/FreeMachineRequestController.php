<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\FreeMachineRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FreeMachineRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status', 'all');
        $factoryId = $request->input('factory_id', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = FreeMachineRequest::query()
            ->with('factory:id,code,name,area')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('request_no', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('fabrication', 'like', "%{$search}%")
                        ->orWhere('party_code', 'like', "%{$search}%")
                        ->orWhere('spec_label', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            });

        $requests = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => FreeMachineRequest::count(),
            'new' => FreeMachineRequest::where('status', 'new')->count(),
            'open' => FreeMachineRequest::where('status', 'open')->count(),
            'conf' => FreeMachineRequest::where('status', 'conf')->count(),
        ];

        $matchingFreeMachines = FactoryMachine::query()
            ->with('factory:id,code,name,area')
            ->where(function ($q): void {
                $q->where('broadcast_free', true)
                    ->orWhere('status', 'idle');
            })
            ->orderByDesc('broadcast_free')
            ->orderByDesc('daily_capacity_kg')
            ->take(15)
            ->get();

        return Inertia::render('Admin/FreeMachineRequests/Index', [
            'requests' => $requests,
            'counts' => $counts,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'matchingFreeMachines' => $matchingFreeMachines,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'factory_id' => $factoryId,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $machineRequest = FreeMachineRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['new', 'open', 'conf', 'rejected', 'done'])],
            'machines_needed' => ['nullable', 'integer', 'min:1'],
            'spec_label' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $machineRequest->update([
            'status' => $validated['status'],
            'machines_needed' => $validated['machines_needed'] ?? $machineRequest->machines_needed,
            'spec_label' => ! empty($validated['spec_label']) ? $validated['spec_label'] : $machineRequest->spec_label,
            'start_date' => $validated['start_date'] ?? $machineRequest->start_date,
            'message' => $validated['message'] ?? $machineRequest->message,
        ]);

        return back()->with('success', "Request {$machineRequest->request_no} updated.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $machineRequest = FreeMachineRequest::findOrFail($id);
        $requestNo = $machineRequest->request_no;
        $machineRequest->delete();

        return back()->with('success', "Request {$requestNo} deleted.");
    }
}
