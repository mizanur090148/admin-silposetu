<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\FactoryMachine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class FactoryMachineController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $factoryId = $request->input('factory_id', 'all');
        $knitType = $request->input('knit_type', 'all');
        $statusType = $request->input('status_type', 'all');
        $broadcast = $request->input('broadcast_free', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = FactoryMachine::query()
            ->with('factory:id,code,name,area')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('spec_label', 'like', "%{$search}%")
                        ->orWhere('current_order_no', 'like', "%{$search}%")
                        ->orWhere('note', 'like', "%{$search}%")
                        ->orWhereHas('factory', function ($fq) use ($search): void {
                            $fq->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            })
            ->when($knitType !== 'all', function ($q) use ($knitType): void {
                $q->where('knit_type', $knitType);
            })
            ->when($statusType !== 'all', function ($q) use ($statusType): void {
                if ($statusType === 'run') {
                    $q->where('status', 'like', 'run%');
                } else {
                    $q->where('status', $statusType);
                }
            })
            ->when($broadcast !== 'all', function ($q) use ($broadcast): void {
                $q->where('broadcast_free', $broadcast === '1');
            });

        $machines = $query->orderBy('factory_id')->orderBy('code')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => FactoryMachine::count(),
            'idle' => FactoryMachine::where('status', 'idle')->count(),
            'running' => FactoryMachine::where('status', 'like', 'run%')->count(),
            'down' => FactoryMachine::where('status', 'down')->count(),
            'broadcast_free' => FactoryMachine::where('broadcast_free', true)->count(),
            'total_capacity_kg' => (int) FactoryMachine::sum('daily_capacity_kg'),
        ];

        return Inertia::render('Admin/FactoryMachines/Index', [
            'machines' => $machines,
            'stats' => $stats,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'factory_id' => $factoryId,
                'knit_type' => $knitType,
                'status_type' => $statusType,
                'broadcast_free' => $broadcast,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('factory_machines', 'code')->where('factory_id', $request->integer('factory_id')),
            ],
            'knit_type' => ['required', 'string', Rule::in(['c', 'f'])],
            'dia' => ['nullable', 'integer', 'min:1', 'max:120'],
            'gauge' => ['required', 'integer', 'min:1', 'max:60'],
            'spec_label' => ['nullable', 'string', 'max:40'],
            'brand' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'current_order_no' => ['nullable', 'string', 'max:50'],
            'broadcast_free' => ['boolean'],
            'free_from' => ['nullable', 'date'],
            'daily_capacity_kg' => ['required', 'integer', 'min:1'],
            'rate_label' => ['nullable', 'string', 'max:255'],
            'supported_fabrics' => ['nullable', 'string', 'max:500'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        FactoryMachine::create([
            'factory_id' => $validated['factory_id'],
            'code' => trim($validated['code']),
            'knit_type' => $validated['knit_type'],
            'dia' => $validated['dia'] ?? null,
            'gauge' => $validated['gauge'],
            'spec_label' => $this->resolveSpecLabel($validated['knit_type'], $validated['dia'] ?? null, (int) $validated['gauge'], $validated['spec_label'] ?? null),
            'brand' => $validated['brand'] ?? null,
            'status' => trim($validated['status']),
            'current_order_no' => $validated['current_order_no'] ?? null,
            'broadcast_free' => $request->boolean('broadcast_free'),
            'free_from' => $validated['free_from'] ?? null,
            'daily_capacity_kg' => $validated['daily_capacity_kg'],
            'rate_label' => $validated['rate_label'] ?? null,
            'supported_fabrics_json' => $this->parseFabrics($validated['supported_fabrics'] ?? null),
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', "Machine \"{$validated['code']}\" added successfully.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $machine = FactoryMachine::findOrFail($id);

        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('factory_machines', 'code')->where('factory_id', $request->integer('factory_id'))->ignore($machine->id),
            ],
            'knit_type' => ['required', 'string', Rule::in(['c', 'f'])],
            'dia' => ['nullable', 'integer', 'min:1', 'max:120'],
            'gauge' => ['required', 'integer', 'min:1', 'max:60'],
            'spec_label' => ['nullable', 'string', 'max:40'],
            'brand' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'current_order_no' => ['nullable', 'string', 'max:50'],
            'broadcast_free' => ['boolean'],
            'free_from' => ['nullable', 'date'],
            'daily_capacity_kg' => ['required', 'integer', 'min:1'],
            'rate_label' => ['nullable', 'string', 'max:255'],
            'supported_fabrics' => ['nullable', 'string', 'max:500'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $machine->update([
            'factory_id' => $validated['factory_id'],
            'code' => trim($validated['code']),
            'knit_type' => $validated['knit_type'],
            'dia' => $validated['dia'] ?? null,
            'gauge' => $validated['gauge'],
            'spec_label' => $this->resolveSpecLabel($validated['knit_type'], $validated['dia'] ?? null, (int) $validated['gauge'], $validated['spec_label'] ?? null),
            'brand' => $validated['brand'] ?? null,
            'status' => trim($validated['status']),
            'current_order_no' => $validated['current_order_no'] ?? null,
            'broadcast_free' => $request->boolean('broadcast_free'),
            'free_from' => $validated['free_from'] ?? null,
            'daily_capacity_kg' => $validated['daily_capacity_kg'],
            'rate_label' => $validated['rate_label'] ?? null,
            'supported_fabrics_json' => $this->parseFabrics($validated['supported_fabrics'] ?? null),
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', "Machine \"{$machine->code}\" updated successfully.");
    }

    public function toggleBroadcast(int $id): RedirectResponse
    {
        $machine = FactoryMachine::findOrFail($id);
        $machine->update(['broadcast_free' => ! $machine->broadcast_free]);

        $state = $machine->broadcast_free ? 'broadcast as free' : 'removed from free broadcast';

        return back()->with('success', "Machine \"{$machine->code}\" {$state}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $machine = FactoryMachine::findOrFail($id);
        $code = $machine->code;
        $machine->delete();

        return back()->with('success', "Machine \"{$code}\" deleted.");
    }

    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['factory_code', 'code', 'knit_type', 'dia', 'gauge', 'spec_label', 'brand', 'status', 'daily_capacity_kg', 'rate_label', 'supported_fabrics', 'broadcast_free']);
            fputcsv($handle, ['f1', 'M-99', 'c', '30', '24', '30" × 24G', 'Pailung', 'idle', '190', '৳১৩–১৫ / kg', 'Single Jersey|1×1 Rib|Fleece', '1']);
            fclose($handle);
        }, 'factory-machines-template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function importStore(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if ($handle === false) {
            return back()->with('error', 'Unable to open uploaded CSV file.');
        }

        $header = fgetcsv($handle);
        if (! is_array($header)) {
            fclose($handle);

            return back()->with('error', 'CSV file is empty or invalid.');
        }

        $header = array_map(fn ($col): string => strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', (string) $col))), $header);
        $factoriesByCode = Factory::pluck('id', 'code');

        $created = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if (count(array_filter($row, fn ($v): bool => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $assoc = [];
            foreach ($header as $idx => $key) {
                $assoc[$key] = trim((string) ($row[$idx] ?? ''));
            }

            $factoryCode = $assoc['factory_code'] ?? '';
            $machineCode = $assoc['code'] ?? '';
            $factoryId = $factoriesByCode[$factoryCode] ?? null;

            if (! $factoryId || $machineCode === '') {
                $failed++;
                $errors[] = "Row {$line}: Valid factory_code and machine code are required.";

                continue;
            }

            try {
                $knitType = in_array($assoc['knit_type'] ?? 'c', ['c', 'f'], true) ? $assoc['knit_type'] : 'c';
                $dia = ($assoc['dia'] ?? '') !== '' ? (int) $assoc['dia'] : null;
                $gauge = max(1, (int) (($assoc['gauge'] ?? '') !== '' ? $assoc['gauge'] : 24));
                $fabrics = str_replace('|', ',', $assoc['supported_fabrics'] ?? '');

                $machine = FactoryMachine::updateOrCreate(
                    ['factory_id' => $factoryId, 'code' => $machineCode],
                    [
                        'knit_type' => $knitType,
                        'dia' => $dia,
                        'gauge' => $gauge,
                        'spec_label' => $this->resolveSpecLabel($knitType, $dia, $gauge, $assoc['spec_label'] ?? null),
                        'brand' => ($assoc['brand'] ?? '') !== '' ? $assoc['brand'] : null,
                        'status' => ($assoc['status'] ?? '') !== '' ? $assoc['status'] : 'idle',
                        'daily_capacity_kg' => max(1, (int) (($assoc['daily_capacity_kg'] ?? '') !== '' ? $assoc['daily_capacity_kg'] : 190)),
                        'rate_label' => ($assoc['rate_label'] ?? '') !== '' ? $assoc['rate_label'] : null,
                        'supported_fabrics_json' => $this->parseFabrics($fabrics),
                        'broadcast_free' => ($assoc['broadcast_free'] ?? '0') === '1',
                    ]
                );

                if ($machine->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            } catch (Throwable $e) {
                $failed++;
                $errors[] = "Row {$line}: {$e->getMessage()}";
            }
        }

        fclose($handle);

        return back()->with('success', "Machines imported: {$created} created, {$updated} updated, {$failed} failed.")
            ->with('importReport', [
                'created' => $created,
                'skipped' => $updated,
                'failed' => $failed,
                'errors' => array_slice($errors, 0, 20),
            ]);
    }

    private function resolveSpecLabel(string $knitType, ?int $dia, int $gauge, ?string $explicit): string
    {
        $trimmed = trim((string) $explicit);
        if ($trimmed !== '') {
            return $trimmed;
        }

        if ($knitType === 'f') {
            return "ফ্ল্যাট · {$gauge}G";
        }

        return $dia ? "{$dia}\" × {$gauge}G" : "{$gauge}G";
    }

    /**
     * @return list<string>|null
     */
    private function parseFabrics(?string $input): ?array
    {
        $items = collect(explode(',', (string) $input))
            ->map(fn (string $v): string => trim($v))
            ->filter()
            ->values()
            ->all();

        return ! empty($items) ? $items : null;
    }
}
