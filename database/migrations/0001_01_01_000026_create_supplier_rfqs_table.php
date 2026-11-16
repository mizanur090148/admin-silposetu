<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_rfqs', function (Blueprint $table): void {
            $table->id();
            $table->string('rfq_no', 30)->unique();
            $table->string('factory_code', 20)->default('f1');
            $table->string('category', 40)->nullable();
            $table->string('item_name');
            $table->string('qty_label');
            $table->string('area')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('need_by_label')->default('06 Oct');
            $table->string('status', 20)->default('new');
            $table->string('quoted_price')->nullable();
            $table->string('delivery_days')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_rfqs');
    }
};
