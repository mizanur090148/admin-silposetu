<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
        $status = $request->input('status', 'all');
        $factoryCode = $request->input('factory_code', 'all');
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
            'filters' => [
                'search' => $search,
                'status' => $status,
                'factory_code' => $factoryCode,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $rfq = SupplierRfq::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['new', 'quoted', 'won', 'lost'])],
            'quoted_price' => ['nullable', 'string', 'max:255'],
            'delivery_days' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $rfq->update($validated);

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
