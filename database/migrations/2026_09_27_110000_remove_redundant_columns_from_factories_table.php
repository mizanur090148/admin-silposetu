<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('factories', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('factories', 'production_capacities')) {
                $columnsToDrop[] = 'production_capacities';
            }
            if (Schema::hasColumn('factories', 'capabilities')) {
                $columnsToDrop[] = 'capabilities';
            }
            if (Schema::hasColumn('factories', 'total_lines')) {
                $columnsToDrop[] = 'total_lines';
            }
            if (Schema::hasColumn('factories', 'rating')) {
                $columnsToDrop[] = 'rating';
            }

            if (! empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factories', function (Blueprint $table) {
            $table->unsignedInteger('total_lines')->default(0);
            $table->decimal('rating', 3, 2)->default(4.80);
            $table->json('capabilities')->nullable();
            $table->json('production_capacities')->nullable();
        });
    }
};
