<?php

namespace Tests\Feature\Admin;

use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryExpense;
use App\Models\MessageThread;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\Production;
use App\Models\QcInspection;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Support\PlanCatalog;
use Database\Factories\FactoryMachineFactory;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OperationsAndErpTest extends TestCase
{
    use RefreshDatabase;

    public function test_plan_catalog_computes_mrr_health_quotas_and_bill_totals(): void
    {
        $factory = Factory::factory()->create([
            'plan_code' => 's',
            'billing_cycle' => 'm',
            'total_machines' => 14,
            'trial_ends_at' => now()->addDays(5),
        ]);
        $bill = new Bill([
            'lines_json' => [
                ['o' => 'SC-1', 'kg' => 100, 'rate' => 25],
                ['o' => 'SC-2', 'amount' => 500],
            ],
            'payments_json' => [
                ['amt' => 1200, 'pend' => false],
                ['amt' => 300, 'pend' => true],
            ],
        ]);

        $mrr = PlanCatalog::monthlyRevenueFor($factory);
        $health = PlanCatalog::factoryHealth($factory, 12);
        $totals = PlanCatalog::billTotals($bill);

        $this->assertSame(1000.0, $mrr);
        $this->assertTrue($health['over_quota']);
        $this->assertSame('expiring', $health['trial_state']);
        $this->assertSame(3000.0, $totals['gross_tk']);
        $this->assertSame(1200.0, $totals['paid_tk']);
        $this->assertSame(300.0, $totals['pending_tk']);
        $this->assertSame(1800.0, $totals['due_tk']);
    }

    public function test_admin_can_extend_factory_trial_by_30_days(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create(['trial_ends_at' => now()->subDays(2)]);

        $response = $this->actingAs($admin)->post(route('admin.factories.extendTrial', $factory->id), [
            'days' => 30,
        ]);

        $response->assertRedirect();
        $this->assertTrue($factory->fresh()?->trial_ends_at?->isFuture());
    }

    public function test_admin_can_view_orders_erp_drilldown_and_update_order_status(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create(['code' => 'f71']);
        $party = Party::create([
            'factory_id' => $factory->id,
            'code' => 'abc',
            'name' => 'ABC Composite',
            'type' => 'ven',
            'default_rate_tk' => 25,
            'is_active' => true,
        ]);
        $order = SubcontractOrder::create([
            'order_no' => 'SC-2611-001',
            'factory_id' => $factory->id,
            'party_id' => $party->id,
            'party_code' => 'abc',
            'buyer' => 'H&M',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 3000,
            'delivered_kg' => 2000,
            'rate_tk' => 25,
            'status' => 'run',
        ]);
        OrderLine::create([
            'subcontract_order_id' => $order->id,
            'line_index' => 0,
            'placement' => 'Body',
            'fabrication' => 'Single Jersey',
            'qty' => 5000,
            'done_qty' => 3000,
        ]);
        Production::create([
            'subcontract_order_id' => $order->id,
            'order_no' => $order->order_no,
            'date_label' => '16 Nov',
            'machine_code' => 'M-01',
            'qty_kg' => 300,
        ]);
        QcInspection::create([
            'qc_no' => 'QC-9001',
            'order_no' => $order->order_no,
            'date_label' => '16 Nov',
            'roll_no' => 'R-10',
            'weight_kg' => 22.5,
            'issue_description' => 'Minor lycra miss',
            'source' => 'fac',
            'factory_sign_json' => ['v' => 'ok', 'by' => 'QC Lead'],
            'vendor_sign_json' => ['v' => null],
        ]);
        DeliveryChallan::create([
            'challan_no' => 'CH-9001',
            'factory_code' => $factory->code,
            'party_code' => 'abc',
            'order_no' => $order->order_no,
            'date_label' => '16 Nov',
            'rolls_json' => ['R-10'],
            'vehicle_no' => 'Dhaka Metro T-11',
            'factory_sign_json' => ['v' => 'ok'],
        ]);

        $this->withoutVite()->actingAs($admin);

        $this->get(route('admin.orders.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Orders/Index')->where('orders.data.0.order_no', 'SC-2611-001'));

        $this->get(route('admin.orders.show', $order->id))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Orders/Show')->has('order.lines', 1)->has('order.qc_inspections', 1));

        $this->post(route('admin.orders.status', $order->id), ['status' => 'done'])->assertRedirect();
        $this->assertSame('done', $order->fresh()?->status);
        $this->assertNotNull($order->fresh()?->complete_date);
    }

    public function test_admin_can_view_billing_expenses_low_stock_and_reply_to_message_threads(): void
    {
        $admin = UserFactory::new()->admin()->create(['name' => 'ShilpoSetu Admin']);
        $factory = Factory::factory()->create(['code' => 'f72']);
        FactoryMachineFactory::new()->create(['factory_id' => $factory->id, 'broadcast_free' => true]);

        Bill::create([
            'bill_no' => 'BL-7201',
            'factory_code' => $factory->code,
            'party_code' => 'abc',
            'bill_date' => now()->toDateString(),
            'jv_no' => 'JV-7201',
            'lines_json' => [['o' => 'SC-1', 'kg' => 200, 'rate' => 20]],
            'payments_json' => [['amt' => 1500, 'pend' => false]],
        ]);
        FactoryExpense::create([
            'factory_id' => $factory->id,
            'category' => 'Gas',
            'title' => 'Boiler Gas Bill',
            'amount_tk' => 12500,
            'payment_method' => 'bank',
            'expense_date' => now()->toDateString(),
        ]);
        StoreItem::create([
            'item_code' => 'ST-01',
            'name' => '24G Groz Needle',
            'category' => 'Needle',
            'stock_qty' => 5,
            'min_qty' => 20,
            'unit_price' => 45,
        ]);
        $thread = MessageThread::create([
            'thread_code' => 'TH-7201',
            'factory_code' => $factory->code,
            'party_code' => 'abc',
            'title' => 'GSM clarification for lot 4',
            'unread_count' => 2,
            'messages_json' => [
                ['s' => 'fac', 'who' => 'them', 'n' => 'Manager', 't' => '10:00 AM', 'txt' => 'Please confirm finish GSM'],
            ],
        ]);

        $this->withoutVite()->actingAs($admin);

        $this->get(route('admin.bills.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Billing/Index')
                ->where('summary.billed_tk', 4000)
                ->where('summary.collected_tk', 1500)
                ->has('lowStockItems', 1)
            );

        $this->get(route('admin.threads.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Threads/Index')->where('threads.data.0.thread_code', 'TH-7201'));

        $this->get(route('admin.threads.show', $thread->id))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Threads/Show'));

        $this->post(route('admin.threads.reply', $thread->id), [
            'message' => 'Admin verified tolerance at +/- 5 GSM.',
        ])->assertRedirect();

        $freshThread = $thread->fresh();
        $this->assertSame(0, $freshThread?->unread_count);
        $this->assertCount(2, $freshThread?->messages_json ?? []);
        $this->assertSame('sys', $freshThread?->messages_json[1]['s'] ?? null);
    }

    public function test_admin_can_crud_orders_record_production_with_rolls_and_track_yarn_in_and_return(): void
    {
        $admin = UserFactory::new()->admin()->create(['name' => 'Order Admin']);
        $factory = Factory::factory()->create(['code' => 'f73']);

        $this->withoutVite()->actingAs($admin);

        $createResponse = $this->post(route('admin.orders.store'), [
            'order_no' => 'SC-7300-01',
            'factory_id' => $factory->id,
            'party_code' => 'pty73',
            'buyer' => 'Zara',
            'fabric_summary' => 'Single Jersey 180 GSM',
            'total_qty_kg' => 1500,
            'rate_tk' => 25,
            'status' => 'run',
            'machines' => 'M-01, M-02',
        ]);

        $order = SubcontractOrder::where('order_no', 'SC-7300-01')->firstOrFail();
        $createResponse->assertRedirect(route('admin.orders.show', $order->id));
        $this->assertSame(['M-01', 'M-02'], $order->machines_json);
        $this->assertSame(1, $order->lines()->count());

        $this->put(route('admin.orders.update', $order->id), [
            'buyer' => 'Zara Kids',
            'party_code' => 'pty73',
            'fabric_summary' => 'Single Jersey 190 GSM',
            'total_qty_kg' => 1800,
            'rate_tk' => 26,
            'status' => 'run',
            'machines' => 'M-01',
        ])->assertRedirect();
        $this->assertSame('Zara Kids', $order->fresh()?->buyer);

        $this->post(route('admin.orders.productions.store', $order->id), [
            'placement_index' => 0,
            'shift' => 'D',
            'machine_code' => 'M-01',
            'operator_name' => 'Sumon',
            'qty_kg' => 44,
            'rolls_count' => 2,
            'yarn_lot' => 'LOT-73',
            'fault_code' => 'LYCRA',
            'generate_rolls' => true,
        ])->assertRedirect();

        $this->assertSame(44.0, (float) $order->fresh()?->done_kg);
        $this->assertSame(2, FabricRoll::where('order_no', $order->order_no)->count());
        $lastRoll = FabricRoll::where('order_no', $order->order_no)->where('roll_no', 'M-01/002')->firstOrFail();
        $this->assertSame(['LYCRA' => 1], $lastRoll->faults_json);

        $this->post(route('admin.orders.yarn.store', $order->id), [
            'count' => '30/1 Combed',
            'spinner' => 'Square',
            'lot' => 'LOT-73',
            'bags' => 10,
            'kg' => 500,
        ])->assertRedirect();
        $this->assertCount(1, $order->fresh()?->yarn_in_json ?? []);

        $this->post(route('admin.orders.yarnReturn.store', $order->id), [
            'lot' => 'LOT-73',
            'kg' => 35,
        ])->assertRedirect();
        $this->assertCount(1, $order->fresh()?->yarn_returns_json ?? []);

        $this->delete(route('admin.orders.destroy', $order->id))->assertRedirect(route('admin.orders.index'));
        $this->assertSoftDeleted($order);
    }

    public function test_admin_can_crud_billing_expenses_store_items_stock_movements_and_threads(): void
    {
        $admin = UserFactory::new()->admin()->create(['name' => 'Accounts Admin']);
        $factory = Factory::factory()->create(['code' => 'f74']);

        $this->withoutVite()->actingAs($admin);

        $this->post(route('admin.bills.store'), [
            'bill_no' => 'BL-7401',
            'factory_code' => $factory->code,
            'party_code' => 'pty74',
            'bill_date' => now()->toDateString(),
            'order_no' => 'SC-7401',
            'fabrication' => 'Pique Knit',
            'qty_kg' => 100,
            'rate_tk' => 30,
        ])->assertRedirect();

        $bill = Bill::where('bill_no', 'BL-7401')->firstOrFail();

        $this->post(route('admin.bills.payments.store', $bill->id), [
            'amount' => 1200,
            'mode' => 'Cheque',
            'pend' => true,
        ])->assertRedirect();
        $this->assertSame(1200.0, PlanCatalog::billTotals($bill->fresh())['pending_tk']);

        $this->post(route('admin.bills.payments.clear', [$bill->id, 0]))->assertRedirect();
        $this->assertSame(1200.0, PlanCatalog::billTotals($bill->fresh())['paid_tk']);

        $this->delete(route('admin.bills.destroy', $bill->id))->assertRedirect();
        $this->assertModelMissing($bill);

        $this->post(route('admin.expenses.store'), [
            'factory_id' => $factory->id,
            'category' => 'Oil',
            'title' => 'Knitting Oil Drum',
            'amount_tk' => 8500,
            'payment_method' => 'cash',
            'expense_date' => now()->toDateString(),
        ])->assertRedirect();
        $expense = FactoryExpense::where('title', 'Knitting Oil Drum')->firstOrFail();

        $this->put(route('admin.expenses.update', $expense->id), [
            'factory_id' => $factory->id,
            'category' => 'Oil',
            'title' => 'Knitting Oil 200L Drum',
            'amount_tk' => 9000,
            'payment_method' => 'bank',
            'expense_date' => now()->toDateString(),
        ])->assertRedirect();
        $this->assertSame(9000.0, (float) $expense->fresh()?->amount_tk);
        $this->delete(route('admin.expenses.destroy', $expense->id))->assertRedirect();

        $this->post(route('admin.store.items.store'), [
            'item_code' => 'ST-74',
            'name' => 'Sinkers 24G',
            'category' => 'Needle',
            'unit' => 'pcs',
            'stock_qty' => 20,
            'min_qty' => 25,
            'unit_price' => 30,
        ])->assertRedirect();
        $item = StoreItem::where('item_code', 'ST-74')->firstOrFail();

        $this->post(route('admin.store.items.toggleRfq', $item->id))->assertRedirect();
        $this->assertTrue($item->fresh()?->rfq_sent);

        $this->post(route('admin.store.items.movement', $item->id), [
            'type' => 'out',
            'qty' => 50,
            'machine_code' => 'M-01',
        ])->assertRedirect()->assertSessionHas('error');

        $this->post(route('admin.store.items.movement', $item->id), [
            'type' => 'out',
            'qty' => 5,
            'machine_code' => 'M-01',
        ])->assertRedirect();
        $this->assertSame(15, $item->fresh()?->stock_qty);
        $this->assertNotNull(StoreIssueLog::where('item_code', 'ST-74')->first());

        $this->post(route('admin.store.items.movement', $item->id), [
            'type' => 'in',
            'qty' => 25,
            'unit_price' => 32,
        ])->assertRedirect();
        $this->assertSame(40, $item->fresh()?->stock_qty);

        $this->put(route('admin.store.items.update', $item->id), [
            'name' => 'Sinkers 24G Groz',
            'category' => 'Needle',
            'unit' => 'pcs',
            'stock_qty' => 40,
            'min_qty' => 25,
            'unit_price' => 32,
        ])->assertRedirect();
        $this->delete(route('admin.store.items.destroy', $item->id))->assertRedirect();

        $this->post(route('admin.threads.store'), [
            'thread_code' => 'TH-7401',
            'factory_code' => $factory->code,
            'party_code' => 'pty74',
            'title' => 'Roll Weight Variance',
            'message' => 'Please verify calibration before night shift.',
        ])->assertRedirect();
        $thread = MessageThread::where('thread_code', 'TH-7401')->firstOrFail();
        $this->assertCount(1, $thread->messages_json ?? []);

        $this->delete(route('admin.threads.destroy', $thread->id))->assertRedirect();
        $this->assertModelMissing($thread);
    }
}
