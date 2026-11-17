<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\Party;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkforceController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = (string) $request->input('tab', 'employees');
        if (! in_array($tab, ['employees', 'attendance', 'parties'], true)) {
            $tab = 'employees';
        }

        $search = trim((string) $request->input('search', ''));
        $factoryId = (string) $request->input('factory_id', 'all');
        $employeeType = (string) $request->input('employee_type', 'all');
        $shift = (string) $request->input('shift', 'all');
        $status = (string) $request->input('status', 'all');
        $attendanceDate = (string) $request->input('attendance_date', '');
        $partyType = (string) $request->input('party_type', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $employees = Employee::query()
            ->with('factory:id,code,name')
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            })
            ->when($employeeType !== 'all', function ($q) use ($employeeType): void {
                $q->where('employee_type', $employeeType);
            })
            ->when($shift !== 'all', function ($q) use ($shift): void {
                $q->where('shift', $shift);
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('id_no', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%")
                        ->orWhere('designation', 'like', "%{$search}%")
                        ->orWhere('machine_assigned', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate($perPage, ['*'], 'emp_page')
            ->withQueryString();

        $attendances = FactoryAttendance::query()
            ->with('factory:id,code,name')
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            })
            ->when($shift !== 'all', function ($q) use ($shift): void {
                $q->where('shift', $shift);
            })
            ->when($attendanceDate !== '', function ($q) use ($attendanceDate): void {
                $q->whereDate('attendance_date', $attendanceDate);
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('worker_name', 'like', "%{$search}%")
                        ->orWhere('role_type', 'like', "%{$search}%")
                        ->orWhere('note', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('attendance_date')
            ->latest('id')
            ->paginate($perPage, ['*'], 'att_page')
            ->withQueryString();

        $parties = Party::query()
            ->with('factory:id,code,name')
            ->withCount('subcontractOrders')
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            })
            ->when($partyType !== 'all', function ($q) use ($partyType): void {
                $q->where('type', $partyType);
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate($perPage, ['*'], 'party_page')
            ->withQueryString();

        $summary = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::where('status', 'active')->count(),
            'operators' => Employee::where('employee_type', 'operator')->count(),
            'attendance_records' => FactoryAttendance::count(),
            'present_attendance' => FactoryAttendance::whereIn('status', ['present', 'overtime'])->count(),
            'total_parties' => Party::count(),
            'active_parties' => Party::where('is_active', true)->count(),
            'daily_wage_pool_tk' => (float) Employee::where('status', 'active')->sum('daily_wage'),
        ];

        return Inertia::render('Admin/Workforce/Index', [
            'tab' => $tab,
            'employees' => $employees,
            'attendances' => $attendances,
            'parties' => $parties,
            'summary' => $summary,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'employeeRoster' => Employee::orderBy('name')->get(['id', 'factory_id', 'name', 'employee_type', 'shift', 'daily_wage']),
            'filters' => [
                'search' => $search,
                'factory_id' => $factoryId,
                'employee_type' => $employeeType,
                'shift' => $shift,
                'status' => $status,
                'attendance_date' => $attendanceDate,
                'party_type' => $partyType,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function storeEmployee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'employee_type' => ['required', 'string', 'max:30'],
            'id_no' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:120'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:80'],
            'shift' => ['required', 'string', 'max:10'],
            'machine_assigned' => ['nullable', 'string', 'max:50'],
            'daily_wage' => ['required', 'numeric', 'min:0'],
            'joining_date' => ['nullable', 'date'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Employee::create($validated);

        return back()->with('success', "Employee \"{$validated['name']}\" added.");
    }

    public function updateEmployee(Request $request, int $id): RedirectResponse
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'employee_type' => ['required', 'string', 'max:30'],
            'id_no' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:120'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:80'],
            'shift' => ['required', 'string', 'max:10'],
            'machine_assigned' => ['nullable', 'string', 'max:50'],
            'daily_wage' => ['required', 'numeric', 'min:0'],
            'joining_date' => ['nullable', 'date'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $employee->update($validated);

        return back()->with('success', "Employee \"{$employee->name}\" updated.");
    }

    public function destroyEmployee(int $id): RedirectResponse
    {
        $employee = Employee::findOrFail($id);
        $name = $employee->name;
        $employee->delete();

        return back()->with('success', "Employee \"{$name}\" removed.");
    }

    public function storeAttendance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'worker_name' => ['required', 'string', 'max:100'],
            'role_type' => ['required', 'string', 'max:40'],
            'shift' => ['required', 'string', 'max:10'],
            'status' => ['required', 'string', Rule::in(['present', 'absent', 'late', 'leave', 'overtime'])],
            'attendance_date' => ['required', 'date'],
            'in_time' => ['nullable', 'string', 'max:20'],
            'out_time' => ['nullable', 'string', 'max:20'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'daily_wage_tk' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        FactoryAttendance::updateOrCreate(
            [
                'factory_id' => (int) $validated['factory_id'],
                'worker_name' => trim($validated['worker_name']),
                'attendance_date' => $validated['attendance_date'],
                'shift' => $validated['shift'],
            ],
            [
                'role_type' => $validated['role_type'],
                'status' => $validated['status'],
                'in_time' => $validated['in_time'] ?? ($validated['status'] === 'present' ? '08:00 AM' : null),
                'out_time' => $validated['out_time'] ?? ($validated['status'] === 'present' ? '05:00 PM' : null),
                'overtime_hours' => (float) ($validated['overtime_hours'] ?? 0),
                'daily_wage_tk' => (float) ($validated['daily_wage_tk'] ?? 500),
                'note' => $validated['note'] ?? null,
            ]
        );

        return back()->with('success', "Attendance logged for {$validated['worker_name']}.");
    }

    public function destroyAttendance(int $id): RedirectResponse
    {
        $att = FactoryAttendance::findOrFail($id);
        $worker = $att->worker_name;
        $att->delete();

        return back()->with('success', "Attendance entry for {$worker} deleted.");
    }

    public function storeParty(Request $request): RedirectResponse
    {
        $factoryId = $request->integer('factory_id');
        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'code' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('parties', 'code')->where('factory_id', $factoryId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['ven', 'sup'])],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'bin_tin' => ['nullable', 'string', 'max:50'],
            'default_rate_tk' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'opening_balance' => ['nullable', 'numeric'],
            'is_active' => ['boolean'],
        ]);

        $code = trim((string) ($validated['code'] ?? ''));
        if ($code === '') {
            $code = 'p'.substr((string) time(), -6).random_int(10, 99);
        }

        Party::create([
            'factory_id' => $validated['factory_id'],
            'code' => $code,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'contact_person' => $validated['contact_person'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'bin_tin' => $validated['bin_tin'] ?? null,
            'default_rate_tk' => $validated['default_rate_tk'] ?? 0,
            'payment_terms' => ! empty($validated['payment_terms']) ? $validated['payment_terms'] : 'বিলের ৩০ দিনের মধ্যে',
            'opening_balance' => $validated['opening_balance'] ?? 0,
            'added_date' => now()->toDateString(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Party \"{$validated['name']}\" added.");
    }

    public function updateParty(Request $request, int $id): RedirectResponse
    {
        $party = Party::findOrFail($id);
        $factoryId = $request->integer('factory_id');

        $validated = $request->validate([
            'factory_id' => ['required', 'integer', 'exists:factories,id'],
            'code' => [
                'required',
                'string',
                'max:40',
                Rule::unique('parties', 'code')->where('factory_id', $factoryId)->ignore($party->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['ven', 'sup'])],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'bin_tin' => ['nullable', 'string', 'max:50'],
            'default_rate_tk' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'opening_balance' => ['nullable', 'numeric'],
            'is_active' => ['boolean'],
        ]);

        $party->update([
            'factory_id' => $validated['factory_id'],
            'code' => trim($validated['code']),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'contact_person' => $validated['contact_person'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'bin_tin' => $validated['bin_tin'] ?? null,
            'default_rate_tk' => $validated['default_rate_tk'] ?? 0,
            'payment_terms' => ! empty($validated['payment_terms']) ? $validated['payment_terms'] : $party->payment_terms,
            'opening_balance' => $validated['opening_balance'] ?? $party->opening_balance,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Party \"{$party->name}\" updated.");
    }

    public function toggleParty(int $id): RedirectResponse
    {
        $party = Party::findOrFail($id);
        $party->update(['is_active' => ! $party->is_active]);

        return back()->with('success', "Party \"{$party->name}\" status updated.");
    }

    public function destroyParty(int $id): RedirectResponse
    {
        $party = Party::findOrFail($id);
        $name = $party->name;
        $party->delete();

        return back()->with('success', "Party \"{$name}\" removed.");
    }
}
