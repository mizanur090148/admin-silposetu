<?php

namespace Database\Factories;

use App\Models\Factory as FactoryModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FactoryModel>
 */
class FactoryFactory extends Factory
{
    protected $model = FactoryModel::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'f'.fake()->unique()->numerify('###'),
            'name' => fake()->company().' Knit Industries',
            'area' => fake()->randomElement(['কোনাবাড়ি, গাজীপুর', 'আশুলিয়া, সাভার', 'ফতুল্লা, নারায়ণগঞ্জ']),
            'address' => fake()->streetAddress(),
            'phone' => '017'.fake()->numerify('########'),
            'total_machines' => fake()->numberBetween(12, 48),
            'plan_code' => 'g',
            'billing_cycle' => 'm',
            'qr_sticker_enabled' => true,
            'last_update_label' => 'আজ ২:০০',
            'yearly_orders_count' => fake()->numberBetween(5, 30),
            'ontime_delivery_pct' => 93.00,
            'qc_reject_pct' => 0.60,
        ];
    }
}
