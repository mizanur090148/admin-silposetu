<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factory_machines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('knit_type', 10)->default('c');
            $table->integer('dia')->nullable();
            $table->integer('gauge')->default(24);
            $table->string('spec_label', 40)->nullable();
            $table->string('brand')->nullable();
            $table->string('status', 50)->default('idle');
            $table->string('current_order_no', 50)->nullable();
            $table->boolean('broadcast_free')->default(false);
            $table->date('free_from')->nullable();
            $table->integer('daily_capacity_kg')->default(190);
            $table->string('rate_label')->nullable();
            $table->json('supported_fabrics_json')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['factory_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_machines');
    }
};
