<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_machine_requests', function (Blueprint $table): void {
            $table->id();
            $table->string('request_no', 30)->unique();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('party_code', 30);
            $table->string('contact_person');
            $table->string('fabrication');
            $table->decimal('qty_kg', 12, 2);
            $table->integer('machines_needed')->default(1);
            $table->string('spec_label', 100)->default('30" × 24G');
            $table->date('start_date')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 20)->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('free_machine_requests');
    }
};
