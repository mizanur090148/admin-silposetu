<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('subcontract_post_id')->constrained('subcontract_posts')->cascadeOnDelete();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->string('bidder_name');
            $table->string('bidder_phone', 30)->nullable();
            $table->decimal('offered_rate_tk', 10, 2);
            $table->integer('estimated_days')->default(7);
            $table->integer('allocated_machines')->default(2);
            $table->text('note')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
