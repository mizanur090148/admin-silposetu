<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('subcontract_order_id')->constrained('subcontract_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('order_no', 40);
            $table->integer('placement_index')->default(0);
            $table->string('date_label', 20);
            $table->string('shift', 10)->default('A');
            $table->string('machine_code', 20);
            $table->string('operator_name', 60)->nullable();
            $table->decimal('qty_kg', 10, 2)->default(0.00);
            $table->integer('rolls_count')->default(0);
            $table->string('yarn_lot', 60)->nullable();
            $table->string('fault_code', 60)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
