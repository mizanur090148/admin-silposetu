<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fabric_rolls', function (Blueprint $table): void {
            $table->id();
            $table->string('roll_no', 40);
            $table->string('jc_seq', 10);
            $table->string('order_no', 40)->index();
            $table->integer('placement_index')->default(0);
            $table->string('machine_code', 20);
            $table->string('date_label', 20);
            $table->string('shift', 10)->default('A');
            $table->string('operator_name', 60)->nullable();
            $table->decimal('weight_kg', 8, 2);
            $table->string('yarn_lot', 80)->nullable();
            $table->json('faults_json')->nullable();
            $table->string('challan_no', 40)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fabric_rolls');
    }
};
