<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use App\Models\MachineType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MachineController extends Controller
{
    public const DEFAULT_UNITS = [
        'Kg',
        'Pcs',
        'Yards',
        'Meters',
        'Batches',
    ];

    /**
     * Display list of machines.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');
        $machineTypeId = $request->input('machine_type_id', '');
        $perPage = (int) $request->input('per_page', 25);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 25;
        }

        $query = Machine::query()->with([
            'machineType:id,name,category,brand_or_model,default_unit',
            'createdBy:id,name,email',
            'updatedBy:id,name,email',
        ]);

        if ($status === 'trashed') {
            $query->onlyTrashed();
        } else {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if (! empty($machineTypeId)) {
            $query->where('machine_type_id', $machineTypeId);
        }

        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('brand_or_model', 'like', $term)
                    ->orWhere('serial_number', 'like', $term)
                    ->orWhereHas('machineType', function ($tq) use ($term) {
                        $tq->where('name', 'like', $term);
                    });
            });
        }

        $machines = $query->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total' => Machine::count(),
            'active' => Machine::where('is_active', true)->count(),
            'inactive' => Machine::where('is_active', false)->count(),
            'trashed' => Machine::onlyTrashed()->count(),
        ];

        $machineTypes = MachineType::query()
            ->select(['id', 'name', 'category', 'brand_or_model', 'default_unit', 'is_active'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Machines/Index', [
            'machines' => $machines,
            'machineTypes' => $machineTypes,
            'defaultUnits' => self::DEFAULT_UNITS,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'machine_type_id' => $machineTypeId,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created machine.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'machine_type_id' => ['required', 'integer', 'exists:machine_types,id'],
            'cph' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'brand_or_model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['created_by_id'] = Auth::id();
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['unit'] = $validated['unit'] ?? 'Kg';
        $validated['is_active'] = $request->boolean('is_active', true);

        $machine = Machine::create($validated);

        return back()->with('success', "Machine '{$machine->name}' created successfully.");
    }

    /**
     * Update the specified machine.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $machine = Machine::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'machine_type_id' => ['required', 'integer', 'exists:machine_types,id'],
            'cph' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'brand_or_model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['updated_by_id'] = Auth::id();
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['unit'] = $validated['unit'] ?? 'Kg';
        $validated['is_active'] = $request->boolean('is_active', true);

        $machine->update($validated);

        return back()->with('success', "Machine '{$machine->name}' updated successfully.");
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggle(int $id): RedirectResponse
    {
        $machine = Machine::findOrFail($id);
        $machine->is_active = ! $machine->is_active;
        $machine->updated_by_id = Auth::id();
        $machine->save();

        $statusStr = $machine->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Machine '{$machine->name}' {$statusStr}.");
    }

    /**
     * Soft delete the specified machine.
     */
    public function destroy(int $id): RedirectResponse
    {
        $machine = Machine::findOrFail($id);
        $name = $machine->name;
        $machine->delete();

        return back()->with('success', "Machine '{$name}' moved to trash (soft deleted).");
    }

    /**
     * Restore a soft deleted machine.
     */
    public function restore(int $id): RedirectResponse
    {
        $machine = Machine::onlyTrashed()->findOrFail($id);
        $name = $machine->name;
        $machine->restore();

        return back()->with('success', "Machine '{$name}' restored successfully.");
    }

    /**
     * Permanently delete a trashed machine.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $machine = Machine::onlyTrashed()->findOrFail($id);
        $name = $machine->name;
        $machine->forceDelete();

        return back()->with('success', "Machine '{$name}' permanently deleted.");
    }
}
