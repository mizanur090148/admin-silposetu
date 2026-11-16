<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcontract_orders', function (Blueprint $table): void {
            $table->id();
            $table->string('order_no', 100)->unique();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->foreignId('party_id')->nullable()->constrained('parties')->nullOnDelete();
            $table->string('party_code', 100);
            $table->string('buyer')->nullable();
            $table->text('fabric_summary');
            $table->string('gsm', 100)->nullable();
            $table->string('finish_gsm', 100)->nullable();
            $table->string('stitch_length', 100)->nullable();
            $table->string('grey_dia', 100)->nullable();
            $table->string('dia_gauge', 191)->nullable();
            $table->string('color')->nullable();
            $table->text('yarn_summary')->nullable();
            $table->decimal('total_qty_kg', 12, 2)->default(0.00);
            $table->decimal('done_kg', 12, 2)->default(0.00);
            $table->decimal('delivered_kg', 12, 2)->default(0.00);
            $table->decimal('daily_rate_kg', 10, 2)->default(300.00);
            $table->decimal('rate_tk', 10, 2)->default(14.00);
            $table->string('status', 20)->default('run');
            $table->string('start_label', 30)->default('—');
            $table->date('order_date')->nullable();
            $table->date('delivery_due_date')->nullable();
            $table->date('complete_date')->nullable();
            $table->decimal('today_prod_kg', 10, 2)->default(0.00);
            $table->json('week_prod_json')->nullable();
            $table->json('machines_json')->nullable();
            $table->json('challans_json')->nullable();
            $table->json('yarn_in_json')->nullable();
            $table->json('yarn_requests_json')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcontract_orders');
    }
};
