<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table): void {
            $table->id();
            $table->string('org_name');
            $table->string('placement', 30)->default('home');
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('cta_label')->default('কল করুন');
            $table->string('duration_label')->default('১৫ দিন');
            $table->string('contact_phone', 30)->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
