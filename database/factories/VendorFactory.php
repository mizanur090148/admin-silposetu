<?php

namespace Database\Factories;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    protected $model = Vendor::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'v'.fake()->unique()->numerify('###'),
            'name' => fake()->company().' Textiles',
            'type' => 'কম্পোজিট',
            'contact_person' => fake()->name(),
            'phone' => '018'.fake()->numerify('########'),
            'email' => fake()->safeEmail(),
            'area' => 'সাভার',
            'is_verified' => true,
        ];
    }
}
