<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_issue_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('item_code', 20);
            $table->string('date_label', 20);
            $table->string('machine_code', 30);
            $table->integer('qty');
            $table->string('issued_by', 60);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_issue_logs');
    }
};
