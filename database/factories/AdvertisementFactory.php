<?php

namespace Database\Factories;

use App\Models\Advertisement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Advertisement>
 */
class AdvertisementFactory extends Factory
{
    protected $model = Advertisement::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'org_name' => fake()->company(),
            'placement' => 'home',
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(8),
            'cta_label' => 'কল করুন',
            'duration_label' => '১৫ দিন',
            'contact_phone' => '017'.fake()->numerify('########'),
            'status' => 'pending',
        ];
    }
}
