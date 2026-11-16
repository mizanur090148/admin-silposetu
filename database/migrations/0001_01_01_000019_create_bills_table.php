<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table): void {
            $table->id();
            $table->string('bill_no', 40)->unique();
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40);
            $table->date('bill_date');
            $table->string('jv_no', 40);
            $table->json('lines_json');
            $table->json('payments_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
