<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('code', 40);
            $table->string('name');
            $table->string('type', 10)->default('ven');
            $table->string('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('bin_tin', 50)->nullable();
            $table->decimal('default_rate_tk', 10, 2)->default(0.00);
            $table->string('payment_terms')->default('বিলের ৩০ দিনের মধ্যে');
            $table->decimal('opening_balance', 14, 2)->default(0.00);
            $table->date('added_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['factory_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parties');
    }
};
