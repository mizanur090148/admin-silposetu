<?php

namespace Database\Factories;

use App\Models\Factory as FactoryModel;
use App\Models\SubcontractPost;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubcontractPost>
 */
class SubcontractPostFactory extends Factory
{
    protected $model = SubcontractPost::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => UserFactory::new(),
            'factory_id' => FactoryModel::factory(),
            'post_type' => 'work_offer',
            'title' => 'Single Jersey 160 GSM 5,000 kg Subcontract',
            'fabric_type' => 'Single Jersey',
            'gsm' => '160 GSM',
            'dia' => 30,
            'gauge' => 24,
            'quantity_kg' => 5000,
            'target_rate_tk' => 14.50,
            'yarn_count' => '30/1 Combed Cotton',
            'location' => 'গাজীপুর',
            'delivery_deadline' => now()->addDays(14)->toDateString(),
            'description' => fake()->sentence(),
            'status' => 'open',
        ];
    }
}
