<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subcontract_orders', function (Blueprint $table): void {
            $table->json('yarn_returns_json')->nullable()->after('yarn_in_json');
        });
    }

    public function down(): void
    {
        Schema::table('subcontract_orders', function (Blueprint $table): void {
            $table->dropColumn('yarn_returns_json');
        });
    }
};
