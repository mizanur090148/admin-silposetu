<?php

namespace Database\Factories;

use App\Models\Factory as FactoryModel;
use App\Models\FactoryMachine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FactoryMachine>
 */
class FactoryMachineFactory extends Factory
{
    protected $model = FactoryMachine::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'factory_id' => FactoryModel::factory(),
            'code' => 'M-'.fake()->unique()->numerify('##'),
            'knit_type' => 'c',
            'dia' => 30,
            'gauge' => 24,
            'spec_label' => '30" × 24G',
            'brand' => 'Pailung',
            'status' => 'idle',
            'broadcast_free' => false,
            'daily_capacity_kg' => 190,
            'rate_label' => '৳১৩–১৫ / kg',
            'supported_fabrics_json' => ['Single Jersey', '1×1 Rib'],
        ];
    }
}
