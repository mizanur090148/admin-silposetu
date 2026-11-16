<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_challans', function (Blueprint $table): void {
            $table->id();
            $table->string('challan_no', 30)->unique();
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40);
            $table->string('order_no', 40);
            $table->string('date_label', 20);
            $table->json('rolls_json');
            $table->string('vehicle_no', 80);
            $table->string('driver_name', 80)->nullable();
            $table->string('driver_phone', 40)->nullable();
            $table->json('factory_sign_json');
            $table->json('vendor_sign_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_challans');
    }
};
