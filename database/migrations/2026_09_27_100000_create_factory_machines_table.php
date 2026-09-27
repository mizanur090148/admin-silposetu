<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('factory_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->foreignId('machine_type_id')->constrained('machine_types')->cascadeOnDelete();
            $table->string('category')->default('knitting')->index();
            $table->integer('no_of_machine')->default(1);
            $table->decimal('capacity_per_machine', 12, 2)->default(0);
            $table->decimal('total_capacity_per_day', 12, 2)->default(0);
            $table->string('unit_type', 50)->default('Kg');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['factory_id', 'category']);
        });

        // Migrate existing machinery rows from factories.production_capacities JSON
        $factories = DB::table('factories')->whereNotNull('production_capacities')->get();
        foreach ($factories as $factory) {
            $capacities = json_decode($factory->production_capacities, true);
            if (! is_array($capacities)) {
                continue;
            }

            foreach (['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'] as $dept) {
                if (isset($capacities[$dept]) && is_array($capacities[$dept])) {
                    $order = 1;
                    foreach ($capacities[$dept] as $row) {
                        $machineTypeId = ! empty($row['machine_type_id']) ? (int) $row['machine_type_id'] : null;
                        if (! $machineTypeId && ! empty($row['machine_type'])) {
                            $machineTypeId = DB::table('machine_types')->where('name', $row['machine_type'])->value('id');
                        }

                        if ($machineTypeId && DB::table('machine_types')->where('id', $machineTypeId)->exists()) {
                            DB::table('factory_machines')->insert([
                                'factory_id' => $factory->id,
                                'machine_type_id' => $machineTypeId,
                                'category' => $dept ?: 'knitting',
                                'no_of_machine' => (int) ($row['no_of_machine'] ?? 1),
                                'capacity_per_machine' => (float) ($row['capacity_per_machine'] ?? 0),
                                'total_capacity_per_day' => (float) ($row['total_capacity_per_day'] ?? 0),
                                'unit_type' => $row['unit_type'] ?? 'Kg',
                                'sort_order' => $order++,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factory_machines');
    }
};
