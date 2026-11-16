<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcontract_posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->enum('post_type', ['work_offer', 'machine_available'])->default('work_offer');
            $table->string('title');
            $table->string('fabric_type');
            $table->string('gsm', 30)->nullable();
            $table->integer('dia')->nullable();
            $table->integer('gauge')->nullable();
            $table->decimal('quantity_kg', 12, 2)->default(0.00);
            $table->decimal('target_rate_tk', 10, 2)->nullable();
            $table->string('yarn_count')->nullable();
            $table->string('location')->nullable();
            $table->date('delivery_deadline')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcontract_posts');
    }
};
