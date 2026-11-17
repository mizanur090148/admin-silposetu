<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\SupplierRfq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupplierRfqController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = (string) $request->input('status', 'all');
        $factoryCode = (string) $request->input('factory_code', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = SupplierRfq::query()
            ->with('factory:id,code,name,area')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('rfq_no', 'like', "%{$search}%")
                        ->orWhere('item_name', 'like', "%{$search}%")
                        ->orWhere('factory_code', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($factoryCode !== 'all', function ($q) use ($factoryCode): void {
                $q->where('factory_code', $factoryCode);
            });

        $rfqs = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => SupplierRfq::count(),
            'new' => SupplierRfq::where('status', 'new')->count(),
            'quoted' => SupplierRfq::where('status', 'quoted')->count(),
            'won' => SupplierRfq::where('status', 'won')->count(),
            'lost' => SupplierRfq::where('status', 'lost')->count(),
        ];

        return Inertia::render('Admin/SupplierRfqs/Index', [
            'rfqs' => $rfqs,
            'counts' => $counts,
            'factoryCodes' => SupplierRfq::query()->distinct()->orderBy('factory_code')->pluck('factory_code'),
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'factory_code' => $factoryCode,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rfq_no' => ['nullable', 'string', 'max:40', Rule::unique('supplier_rfqs', 'rfq_no')],
            'factory_code' => ['required', 'string', 'max:20'],
            'category' => ['nullable', 'string', 'max:40'],
            'item_name' => ['required', 'string', 'max:255'],
            'qty_label' => ['required', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'need_by_label' => ['required', 'string', 'max:100'],
            'status' => ['required', 'string', Rule::in(['new', 'quoted', 'won', 'lost'])],
            'quoted_price' => ['nullable', 'string', 'max:255'],
            'delivery_days' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $rfqNo = trim((string) ($validated['rfq_no'] ?? ''));
        if ($rfqNo === '') {
            $seq = SupplierRfq::count() + 101;
            while (SupplierRfq::where('rfq_no', 'RFQ-'.$seq)->exists()) {
                $seq++;
            }
            $rfqNo = 'RFQ-'.$seq;
        }

        SupplierRfq::create([
            ...$validated,
            'rfq_no' => $rfqNo,
        ]);

        return back()->with('success', "Supplier RFQ {$rfqNo} created.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $rfq = SupplierRfq::findOrFail($id);

        $validated = $request->validate([
            'factory_code' => ['nullable', 'string', 'max:20'],
            'category' => ['nullable', 'string', 'max:40'],
            'item_name' => ['nullable', 'string', 'max:255'],
            'qty_label' => ['nullable', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'need_by_label' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', Rule::in(['new', 'quoted', 'won', 'lost'])],
            'quoted_price' => ['nullable', 'string', 'max:255'],
            'delivery_days' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $rfq->update([
            'factory_code' => ! empty($validated['factory_code']) ? trim($validated['factory_code']) : $rfq->factory_code,
            'category' => array_key_exists('category', $validated) ? $validated['category'] : $rfq->category,
            'item_name' => ! empty($validated['item_name']) ? trim($validated['item_name']) : $rfq->item_name,
            'qty_label' => ! empty($validated['qty_label']) ? trim($validated['qty_label']) : $rfq->qty_label,
            'area' => array_key_exists('area', $validated) ? $validated['area'] : $rfq->area,
            'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : $rfq->phone,
            'need_by_label' => ! empty($validated['need_by_label']) ? trim($validated['need_by_label']) : $rfq->need_by_label,
            'status' => $validated['status'],
            'quoted_price' => $validated['quoted_price'] ?? null,
            'delivery_days' => $validated['delivery_days'] ?? null,
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', "RFQ {$rfq->rfq_no} updated.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $rfq = SupplierRfq::findOrFail($id);
        $rfqNo = $rfq->rfq_no;
        $rfq->delete();

        return back()->with('success', "RFQ {$rfqNo} deleted.");
    }
}
