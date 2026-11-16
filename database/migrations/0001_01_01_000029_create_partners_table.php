<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('partner_code', 30)->unique();
            $table->integer('total_referrals')->default(0);
            $table->integer('active_factories_count')->default(0);
            $table->decimal('total_commission_tk', 14, 2)->default(0.00);
            $table->decimal('withdrawn_commission_tk', 14, 2)->default(0.00);
            $table->decimal('balance_commission_tk', 14, 2)->default(0.00);
            $table->string('payout_method', 30)->default('bkash');
            $table->string('payout_number', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
