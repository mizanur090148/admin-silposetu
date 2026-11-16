<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('employee_type', 30)->default('operator');
            $table->string('id_no', 50)->nullable();
            $table->string('name', 120);
            $table->string('mobile', 30)->nullable();
            $table->string('address')->nullable();
            $table->string('designation', 80)->nullable();
            $table->string('shift', 10)->default('A');
            $table->string('machine_assigned', 50)->nullable();
            $table->decimal('daily_wage', 10, 2)->default(500.00);
            $table->date('joining_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        if (DB::getDriverName() === 'sqlite') {
            DB::statement("CREATE VIEW IF NOT EXISTS operators AS SELECT * FROM employees WHERE employee_type = 'operator'");
        } else {
            DB::statement("CREATE OR REPLACE VIEW operators AS SELECT * FROM employees WHERE employee_type = 'operator'");
        }
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS operators');
        Schema::dropIfExists('employees');
    }
};
