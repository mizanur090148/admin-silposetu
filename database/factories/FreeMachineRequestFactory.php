<?php

namespace Database\Factories;

use App\Models\Factory as FactoryModel;
use App\Models\FreeMachineRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FreeMachineRequest>
 */
class FreeMachineRequestFactory extends Factory
{
    protected $model = FreeMachineRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_no' => 'RQ-'.fake()->unique()->numerify('####'),
            'factory_id' => FactoryModel::factory(),
            'party_code' => 'abc',
            'contact_person' => fake()->name(),
            'fabrication' => 'Single Jersey',
            'qty_kg' => 2000,
            'machines_needed' => 2,
            'spec_label' => '30" × 24G',
            'start_date' => now()->addDays(3)->toDateString(),
            'status' => 'new',
        ];
    }
}
