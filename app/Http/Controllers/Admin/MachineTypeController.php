<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MachineType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MachineTypeController extends Controller
{
    public const CATEGORIES = [
        'knitting' => 'Knitting Machinery',
        'yarn_dyeing' => 'Yarn Dyeing Machinery',
        'fabric_dyeing' => 'Fabric Dyeing Machinery',
        'print' => 'Printing Machinery',
        'embroidery' => 'Embroidery Machinery',
    ];

    public const DEFAULT_UNITS = [
        'Kg',
        'Pcs',
        'Yards',
        'Meters',
        'Batches',
    ];

    /**
     * Display list of machine types.
     */
    public function index(Request $request): Response
    {
        $category = $request->input('category', 'all');
        $search = $request->input('search', '');
        $perPage = (int) $request->input('per_page', 25);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 25;
        }

        $query = MachineType::query();

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('brand_or_model', 'like', $term)
                    ->orWhere('category', 'like', $term);
            });
        }

        $machineTypes = $query->orderBy('category')->orderBy('sort_order')->paginate($perPage)->withQueryString();

        $categoryCounts = [];
        foreach (self::CATEGORIES as $key => $label) {
            $categoryCounts[$key] = MachineType::where('category', $key)->count();
        }

        return Inertia::render('Admin/MachineTypes/Index', [
            'machineTypes' => $machineTypes,
            'categories' => self::CATEGORIES,
            'defaultUnits' => self::DEFAULT_UNITS,
            'categoryCounts' => $categoryCounts,
            'totalCount' => MachineType::count(),
            'filters' => [
                'category' => $category,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store newly created machine type via form filling.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(self::CATEGORIES))],
            'name' => ['required', 'string', 'max:255'],
            'brand_or_model' => ['nullable', 'string', 'max:255'],
            'default_unit' => ['required', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $maxSort = MachineType::where('category', $validated['category'])->max('sort_order') ?? 0;

        MachineType::create([
            'category' => $validated['category'],
            'name' => $validated['name'],
            'brand_or_model' => $validated['brand_or_model'] ?? null,
            'default_unit' => $validated['default_unit'] ?? 'Kg',
            'sort_order' => $validated['sort_order'] ?? ($maxSort + 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Machine type '{$validated['name']}' added successfully.");
    }

    /**
     * Toggle active state.
     */
    public function toggle(int $id): RedirectResponse
    {
        $machine = MachineType::findOrFail($id);
        $machine->update(['is_active' => ! $machine->is_active]);

        $statusStr = $machine->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Machine type '{$machine->name}' {$statusStr}.");
    }

    /**
     * Delete machine type.
     */
    public function destroy(int $id): RedirectResponse
    {
        $machine = MachineType::findOrFail($id);
        $name = $machine->name;
        $machine->delete();

        return back()->with('success', "Machine type '{$name}' deleted successfully.");
    }

    /**
     * Download sample CSV template for machine types bulk import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="machine_types_sample_template.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['category', 'name', 'brand_or_model', 'default_unit', 'sort_order', 'is_active']);

            $samples = [
                ['knitting', 'Single Jersey Circular Knitting Machine', 'Mayer & Cie / Fukuhara', 'Kg', '1', '1'],
                ['fabric_dyeing', 'High Temperature Rapid Dyeing Jet', 'Thies / Sclavos', 'Kg', '2', '1'],
                ['print', 'Automatic Oval Screen Printing Machine', 'MHM / ROQ', 'Pcs', '3', '1'],
                ['embroidery', '20-Head Computerized Embroidery Machine', 'Tajima / Barudan', 'Pcs', '4', '1'],
            ];

            foreach ($samples as $sample) {
                fputcsv($handle, $sample);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Bulk import machine types from CSV.
     */
    public function importStore(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $uploadedFile = $request->file('file');
        $fileHandle = fopen($uploadedFile->getRealPath(), 'r');
        if (! $fileHandle) {
            return back()->with('error', 'Unable to open and read uploaded CSV.');
        }

        $rawHeaders = fgetcsv($fileHandle);
        if (! $rawHeaders) {
            fclose($fileHandle);

            return back()->with('error', 'The uploaded file is empty.');
        }

        $rawHeaders[0] = preg_replace('/^\xEF\xBB\xBF/', '', $rawHeaders[0]);

        $headerMap = [];
        foreach ($rawHeaders as $idx => $col) {
            $key = strtolower(trim($col));
            if (in_array($key, ['category', 'dept', 'department'])) {
                $headerMap['category'] = $idx;
            } elseif (in_array($key, ['name', 'machine_name', 'machine_type'])) {
                $headerMap['name'] = $idx;
            } elseif (in_array($key, ['brand_or_model', 'brand', 'model'])) {
                $headerMap['brand_or_model'] = $idx;
            } elseif (in_array($key, ['default_unit', 'unit'])) {
                $headerMap['default_unit'] = $idx;
            } elseif (in_array($key, ['sort_order', 'sort', 'order'])) {
                $headerMap['sort_order'] = $idx;
            } elseif (in_array($key, ['is_active', 'active'])) {
                $headerMap['is_active'] = $idx;
            }
        }

        if (! isset($headerMap['name']) || ! isset($headerMap['category'])) {
            fclose($fileHandle);

            return back()->with('error', "CSV must contain 'category' and 'name' columns.");
        }

        $count = 0;
        while (($row = fgetcsv($fileHandle)) !== false) {
            if (empty(array_filter($row))) {
                continue;
            }

            $cat = strtolower(trim($row[$headerMap['category']] ?? ''));
            $name = trim($row[$headerMap['name']] ?? '');

            if (empty($cat) || empty($name)) {
                continue;
            }

            // Normalize category
            if (! array_key_exists($cat, self::CATEGORIES)) {
                // Try fuzzy match
                foreach (array_keys(self::CATEGORIES) as $validCat) {
                    if (str_contains($cat, $validCat) || str_contains($validCat, $cat)) {
                        $cat = $validCat;
                        break;
                    }
                }
            }

            $brand = isset($headerMap['brand_or_model']) ? trim($row[$headerMap['brand_or_model']] ?? '') : null;
            $unit = isset($headerMap['default_unit']) ? trim($row[$headerMap['default_unit']] ?? 'Kg') : 'Kg';
            $sort = isset($headerMap['sort_order']) ? (int) trim($row[$headerMap['sort_order']] ?? 0) : 0;
            $active = isset($headerMap['is_active']) ? in_array(strtolower(trim($row[$headerMap['is_active']] ?? '1')), ['1', 'true', 'yes']) : true;

            MachineType::updateOrCreate(
                ['category' => $cat, 'name' => $name],
                [
                    'brand_or_model' => $brand ?: null,
                    'default_unit' => $unit ?: 'Kg',
                    'sort_order' => $sort,
                    'is_active' => $active,
                ]
            );

            $count++;
        }

        fclose($fileHandle);

        return back()->with('success', "Successfully imported/updated {$count} machine types.");
    }
}
