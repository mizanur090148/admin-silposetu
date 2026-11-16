<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->string('role', 20)->default('fac');
            $table->string('designation')->nullable();
            $table->string('organization_name')->nullable();
            $table->unsignedBigInteger('factory_id')->nullable();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->string('partner_code', 30)->nullable();
            $table->string('party_code', 50)->nullable();
            $table->boolean('is_owner')->default(false);
            $table->boolean('is_vendor_rep')->default(false);
            $table->boolean('can_message')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->string('subscription_plan', 20)->default('free');
            $table->string('billing_cycle', 10)->default('m');
            $table->string('last_login_label')->nullable();
            $table->json('permissions_json')->nullable();
            $table->json('profile_json')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
