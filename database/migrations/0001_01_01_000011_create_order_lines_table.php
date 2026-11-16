<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('subcontract_order_id')->constrained('subcontract_orders')->cascadeOnDelete();
            $table->integer('line_index')->default(0);
            $table->string('knit_type', 10)->default('c');
            $table->boolean('is_yarn_dyed')->default(false);
            $table->string('unit', 10)->default('kg');
            $table->string('placement', 191);
            $table->string('fabrication');
            $table->string('color', 191)->nullable();
            $table->decimal('qty', 12, 2)->default(0.00);
            $table->decimal('done_qty', 12, 2)->default(0.00);
            $table->decimal('delivered_qty', 12, 2)->default(0.00);
            $table->string('grey_gsm', 100)->nullable();
            $table->string('finish_gsm', 100)->nullable();
            $table->string('stitch_length', 100)->nullable();
            $table->string('grey_dia', 100)->nullable();
            $table->string('dia_gauge', 191)->nullable();
            $table->string('flat_size', 191)->nullable();
            $table->string('piece_weight_gm', 100)->nullable();
            $table->text('flat_design')->nullable();
            $table->json('machines_json')->nullable();
            $table->json('yarns_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_lines');
    }
};
