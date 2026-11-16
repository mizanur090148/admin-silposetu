<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Machinery',
            'category' => 'mc',
            'also_categories_json' => ['spare'],
            'area' => 'গাজীপুর',
            'rating' => 4.6,
            'reviews_count' => 20,
            'description' => fake()->sentence(),
            'is_sponsored' => false,
            'is_verified' => true,
        ];
    }
}
