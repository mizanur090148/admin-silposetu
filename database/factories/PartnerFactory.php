<?php

namespace Database\Factories;

use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Partner>
 */
class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => UserFactory::new(),
            'partner_code' => 'PRT-'.fake()->unique()->numerify('###'),
            'total_referrals' => 5,
            'active_factories_count' => 3,
            'total_commission_tk' => 5000.00,
            'withdrawn_commission_tk' => 1000.00,
            'balance_commission_tk' => 4000.00,
            'payout_method' => 'bkash',
            'payout_number' => '01711111111',
        ];
    }
}
