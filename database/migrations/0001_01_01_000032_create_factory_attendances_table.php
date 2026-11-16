<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factory_attendances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('worker_name', 100);
            $table->string('role_type', 40)->default('operator');
            $table->string('shift', 10)->default('A');
            $table->string('status', 20)->default('present');
            $table->date('attendance_date');
            $table->string('in_time', 20)->nullable();
            $table->string('out_time', 20)->nullable();
            $table->decimal('overtime_hours', 4, 1)->default(0.0);
            $table->decimal('daily_wage_tk', 10, 2)->default(500.00);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['factory_id', 'worker_name', 'attendance_date', 'shift'], 'factory_worker_shift_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_attendances');
    }
};
