<?php

namespace Tests\Feature\Admin;

use App\Models\Factory;
use App\Models\FactoryMachine;
use Database\Factories\FactoryMachineFactory;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class FactoriesAndMachinesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_factory_with_nested_machines_and_view_details(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $owner = UserFactory::new()->create(['role' => 'fac', 'factory_id' => null]);

        $response = $this->actingAs($admin)->post(route('admin.factories.store'), [
            'code' => 'f55',
            'name' => 'Savar Knit Composite',
            'area' => 'আশুলিয়া, সাভার',
            'total_machines' => 24,
            'plan_code' => 'g',
            'owner_id' => $owner->id,
            'billing_cycle' => 'm',
            'qr_sticker_enabled' => true,
            'machines' => [
                [
                    'code' => 'M-01',
                    'knit_type' => 'c',
                    'dia' => 30,
                    'gauge' => 24,
                    'brand' => 'Pailung',
                    'status' => 'idle',
                    'broadcast_free' => true,
                    'daily_capacity_kg' => 220,
                    'supported_fabrics' => 'Single Jersey, Rib 1x1',
                ],
            ],
        ]);

        $factory = Factory::where('code', 'f55')->firstOrFail();
        $response->assertRedirect(route('admin.factories.show', $factory->id));
        $this->assertSame($factory->id, $owner->fresh()?->factory_id);

        $machine = FactoryMachine::where('factory_id', $factory->id)->where('code', 'M-01')->firstOrFail();
        $this->assertSame('30" × 24G', $machine->spec_label);
        $this->assertSame(['Single Jersey', 'Rib 1x1'], $machine->supported_fabrics_json);

        $showResponse = $this->withoutVite()->actingAs($admin)->get(route('admin.factories.show', $factory->id));
        $showResponse->assertOk();
    }

    public function test_deleting_factory_nullifies_user_links_and_cascades_machines(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create();
        $staff = UserFactory::new()->create(['factory_id' => $factory->id]);
        $machine = FactoryMachineFactory::new()->create(['factory_id' => $factory->id]);

        $response = $this->actingAs($admin)->delete(route('admin.factories.destroy', $factory->id));

        $response->assertRedirect(route('admin.factories.index'));
        $this->assertModelMissing($factory);
        $this->assertModelMissing($machine);
        $this->assertNull($staff->fresh()?->factory_id);
    }

    public function test_admin_can_import_factories_and_machines_via_csv(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factoryCsv = UploadedFile::fake()->createWithContent(
            'factories.csv',
            "code,name,area,address,phone,total_machines,plan_code,billing_cycle,qr_sticker_enabled\n".
            "f88,Jamuna Knitwear,গাজীপুর,Plot 10,01700001122,30,g,m,1\n"
        );

        $factoryImportResponse = $this->actingAs($admin)->post(route('admin.factories.import.store'), [
            'file' => $factoryCsv,
            'skip_duplicates' => true,
        ]);

        $factoryImportResponse->assertRedirect();
        $factory = Factory::where('code', 'f88')->firstOrFail();
        $this->assertSame('Jamuna Knitwear', $factory->name);

        $machineCsv = UploadedFile::fake()->createWithContent(
            'machines.csv',
            "factory_code,code,knit_type,dia,gauge,brand,status,daily_capacity_kg,rate_label,supported_fabrics,broadcast_free\n".
            "f88,MC-01,c,34,24,Terrot,idle,250,৳15/kg,Single Jersey|Fleece,1\n"
        );

        $machineImportResponse = $this->actingAs($admin)->post(route('admin.factory-machines.import'), [
            'file' => $machineCsv,
        ]);

        $machineImportResponse->assertRedirect();
        $machine = FactoryMachine::where('factory_id', $factory->id)->where('code', 'MC-01')->firstOrFail();
        $this->assertTrue($machine->broadcast_free);
        $this->assertSame(['Single Jersey', 'Fleece'], $machine->supported_fabrics_json);
    }

    public function test_machine_creation_enforces_unique_code_per_factory(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create();
        FactoryMachineFactory::new()->create(['factory_id' => $factory->id, 'code' => 'M-10']);

        $response = $this->actingAs($admin)->post(route('admin.factory-machines.store'), [
            'factory_id' => $factory->id,
            'code' => 'M-10',
            'knit_type' => 'c',
            'dia' => 30,
            'gauge' => 24,
            'status' => 'idle',
            'daily_capacity_kg' => 180,
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertSame(1, FactoryMachine::where('factory_id', $factory->id)->count());
    }
}
