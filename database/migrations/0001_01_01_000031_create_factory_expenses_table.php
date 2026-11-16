<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factory_expenses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('category', 40);
            $table->string('title');
            $table->decimal('amount_tk', 14, 2);
            $table->string('payment_method', 30)->default('cash');
            $table->string('reference_no', 40)->nullable();
            $table->date('expense_date');
            $table->string('created_by', 60)->default('ম্যানেজার');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_expenses');
    }
};
