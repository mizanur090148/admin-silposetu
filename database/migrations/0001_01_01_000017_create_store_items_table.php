<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_items', function (Blueprint $table): void {
            $table->id();
            $table->string('item_code', 20)->unique();
            $table->string('name');
            $table->string('category', 60);
            $table->string('unit', 20)->default('পিস');
            $table->integer('stock_qty')->default(0);
            $table->integer('min_qty')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0.00);
            $table->boolean('rfq_sent')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_items');
    }
};
