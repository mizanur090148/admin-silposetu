<?php

namespace Tests\Feature\Admin;

use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\Factory;
use App\Models\FactoryExpense;
use App\Models\MessageThread;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\Production;
use App\Models\QcInspection;
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
}
