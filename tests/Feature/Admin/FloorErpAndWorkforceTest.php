<?php

namespace Tests\Feature\Admin;

use App\Models\DeliveryChallan;
use App\Models\Employee;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\Party;
use App\Models\Production;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FloorErpAndWorkforceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_floor_erp_tabs_sign_qc_issue_and_sign_challan_and_delete_production(): void
    {
        $admin = UserFactory::new()->admin()->create(['name' => 'QC Supervisor']);
        $factory = Factory::factory()->create(['code' => 'f501']);
        $order = SubcontractOrder::create([
            'order_no' => 'SC-501-01',
            'factory_id' => $factory->id,
            'party_code' => 'pty5',
            'fabric_summary' => 'Fleece 280 GSM',
            'total_qty_kg' => 1000,
            'done_kg' => 120,
            'rate_tk' => 22,
            'status' => 'run',
        ]);
        $production = Production::create([
            'subcontract_order_id' => $order->id,
            'order_no' => $order->order_no,
            'placement_index' => 0,
            'date_label' => '17 Nov',
            'shift' => 'D',
            'machine_code' => 'M-01',
            'operator_name' => 'Karim',
            'qty_kg' => 45.5,
            'rolls_count' => 2,
            'yarn_lot' => 'YL-88',
        ]);
        $roll = FabricRoll::create([
            'roll_no' => 'M-01/001',
            'jc_seq' => '001',
            'order_no' => $order->order_no,
            'placement_index' => 0,
            'machine_code' => 'M-01',
            'date_label' => '17 Nov',
            'shift' => 'D',
            'operator_name' => 'Karim',
            'weight_kg' => 22.5,
            'yarn_lot' => 'YL-88',
            'faults_json' => [],
        ]);
        $qc = QcInspection::create([
            'qc_no' => 'QC-501',
            'order_no' => $order->order_no,
            'placement_index' => 0,
            'placement_name' => 'Body',
            'date_label' => '17 Nov',
            'roll_no' => $roll->roll_no,
            'machine_code' => 'M-01',
            'weight_kg' => 22.5,
            'issue_description' => 'Lycra miss in middle course',
            'source' => 'fac',
            'factory_sign_json' => ['v' => 'ok', 'by' => 'Floor QC', 'at' => '17 Nov, 09:00', 'note' => ''],
            'vendor_sign_json' => null,
        ]);

        $this->withoutVite()->actingAs($admin);

        foreach (['production', 'rolls', 'qc', 'challans'] as $tab) {
            $this->get(route('admin.floor-erp.index', ['tab' => $tab]))
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/FloorErp/Index')
                    ->where('tab', $tab)
                );
        }

        $this->post(route('admin.floor-erp.qc.sign', $qc->id), [
            'side' => 'ven',
            'verdict' => 'ok',
            'signed_by' => 'Buyer Rep',
            'note' => 'Accepted with allowance',
            'action_taken' => 'Allowance Approved',
        ])->assertRedirect();

        $freshQc = $qc->fresh();
        $this->assertSame('ok', $freshQc?->vendor_sign_json['v'] ?? null);
        $this->assertSame('Allowance Approved', $freshQc?->action_taken);

        $this->post(route('admin.floor-erp.qc.action', $qc->id), [
            'action_taken' => 'Re-check at Compactor',
        ])->assertRedirect();
        $this->assertSame('Re-check at Compactor', $qc->fresh()?->action_taken);

        $this->post(route('admin.floor-erp.challans.store'), [
            'order_no' => $order->order_no,
            'rolls_text' => 'M-01/001',
            'vehicle_no' => 'Dhaka Metro-T 11-2233',
            'driver_name' => 'Jamal',
        ])->assertRedirect();

        $challan = DeliveryChallan::where('order_no', $order->order_no)->firstOrFail();
        $this->assertSame($challan->challan_no, $roll->fresh()?->challan_no);
        $this->assertContains($challan->challan_no, $order->fresh()?->challans_json ?? []);

        $this->post(route('admin.floor-erp.challans.sign', $challan->id), [
            'signed_by' => 'Vendor Gate',
            'received_rolls' => 1,
        ])->assertRedirect();
        $this->assertSame(1, $challan->fresh()?->vendor_sign_json['got'] ?? null);

        $this->delete(route('admin.floor-erp.challans.destroy', $challan->id))->assertRedirect();
        $this->assertModelMissing($challan);
        $this->assertNull($roll->fresh()?->challan_no);

        $this->delete(route('admin.floor-erp.productions.destroy', $production->id))->assertRedirect();
        $this->assertModelMissing($production);
        $this->assertSame(74.5, (float) $order->fresh()?->done_kg);
    }

    public function test_admin_can_manage_employees_attendance_and_parties_in_workforce_hub(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create(['code' => 'f502']);

        $this->withoutVite()->actingAs($admin);

        $this->post(route('admin.workforce.employees.store'), [
            'factory_id' => $factory->id,
            'employee_type' => 'operator',
            'id_no' => 'EMP-01',
            'name' => 'Babul Miah',
            'mobile' => '01711009988',
            'designation' => 'Senior Operator',
            'shift' => 'D',
            'machine_assigned' => 'M-02',
            'daily_wage' => 650,
            'status' => 'active',
        ])->assertRedirect();

        $employee = Employee::where('factory_id', $factory->id)->where('name', 'Babul Miah')->firstOrFail();

        $this->put(route('admin.workforce.employees.update', $employee->id), [
            'factory_id' => $factory->id,
            'employee_type' => 'supervisor',
            'name' => 'Babul Miah',
            'shift' => 'N',
            'daily_wage' => 800,
            'status' => 'active',
        ])->assertRedirect();
        $this->assertSame('supervisor', $employee->fresh()?->employee_type);
        $this->assertSame(800.0, (float) $employee->fresh()?->daily_wage);

        $date = now()->toDateString();
        $this->post(route('admin.workforce.attendance.store'), [
            'factory_id' => $factory->id,
            'worker_name' => 'Babul Miah',
            'role_type' => 'supervisor',
            'shift' => 'N',
            'status' => 'present',
            'attendance_date' => $date,
            'daily_wage_tk' => 800,
        ])->assertRedirect();

        $this->post(route('admin.workforce.attendance.store'), [
            'factory_id' => $factory->id,
            'worker_name' => 'Babul Miah',
            'role_type' => 'supervisor',
            'shift' => 'N',
            'status' => 'overtime',
            'attendance_date' => $date,
            'overtime_hours' => 3,
            'daily_wage_tk' => 950,
        ])->assertRedirect();

        $this->assertSame(1, FactoryAttendance::where('factory_id', $factory->id)->count());
        $att = FactoryAttendance::where('factory_id', $factory->id)->firstOrFail();
        $this->assertSame('overtime', $att->status);

        $this->post(route('admin.workforce.parties.store'), [
            'factory_id' => $factory->id,
            'code' => 'pty502',
            'name' => 'Delta Dyeing',
            'type' => 'ven',
            'default_rate_tk' => 24,
            'is_active' => true,
        ])->assertRedirect();

        $party = Party::where('factory_id', $factory->id)->where('code', 'pty502')->firstOrFail();
        $this->put(route('admin.workforce.parties.update', $party->id), [
            'factory_id' => $factory->id,
            'code' => 'pty502',
            'name' => 'Delta Dyeing & Knit',
            'type' => 'ven',
            'default_rate_tk' => 26,
            'is_active' => true,
        ])->assertRedirect();
        $this->assertSame('Delta Dyeing & Knit', $party->fresh()?->name);

        $this->post(route('admin.workforce.parties.toggle', $party->id))->assertRedirect();
        $this->assertFalse($party->fresh()?->is_active);

        foreach (['employees', 'attendance', 'parties'] as $tab) {
            $this->get(route('admin.workforce.index', ['tab' => $tab]))
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/Workforce/Index')
                    ->where('tab', $tab)
                );
        }

        $this->delete(route('admin.workforce.attendance.destroy', $att->id))->assertRedirect();
        $this->delete(route('admin.workforce.parties.destroy', $party->id))->assertRedirect();
        $this->delete(route('admin.workforce.employees.destroy', $employee->id))->assertRedirect();
        $this->assertModelMissing($att);
        $this->assertSoftDeleted($party);
        $this->assertSoftDeleted($employee);
    }
}
