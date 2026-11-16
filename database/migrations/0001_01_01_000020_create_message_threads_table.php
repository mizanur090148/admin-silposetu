<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_threads', function (Blueprint $table): void {
            $table->id();
            $table->string('thread_code', 40)->unique();
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40)->default('abc');
            $table->string('order_no', 40)->nullable();
            $table->string('title');
            $table->integer('unread_count')->default(0);
            $table->json('messages_json');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_threads');
    }
};
