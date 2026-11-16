<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factories', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->string('area')->nullable();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->integer('total_machines')->default(24);
            $table->string('plan_code', 10)->default('g');
            $table->timestamp('trial_ends_at')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->string('billing_cycle', 10)->default('m');
            $table->boolean('qr_sticker_enabled')->default(true);
            $table->string('last_update_label')->default('আজ ২:০০');
            $table->integer('yearly_orders_count')->default(14);
            $table->decimal('ontime_delivery_pct', 5, 2)->default(93.00);
            $table->decimal('qc_reject_pct', 5, 2)->default(0.60);
            $table->json('settings_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factories');
    }
};
