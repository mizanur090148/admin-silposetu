<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_listings', function (Blueprint $table): void {
            $table->id();
            $table->string('role_title');
            $table->string('company_name');
            $table->string('area');
            $table->string('category', 20);
            $table->string('shift_label')->nullable();
            $table->string('experience_label')->nullable();
            $table->string('salary_label')->default('আলোচনা সাপেক্ষে');
            $table->string('posted_label')->default('আজ');
            $table->string('contact_phone', 30)->nullable();
            $table->boolean('is_new')->default(true);
            $table->integer('vacancies')->default(1);
            $table->json('requirements_json');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
