<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => '017'.fake()->unique()->numerify('########'),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'fac',
            'designation' => 'Factory Staff',
            'organization_name' => fake()->company(),
            'is_owner' => false,
            'is_vendor_rep' => false,
            'can_message' => true,
            'is_active' => true,
            'phone_verified_at' => now(),
            'subscription_plan' => 'free',
            'billing_cycle' => 'm',
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes): array => [
            'role' => 'admin',
            'designation' => 'System Administrator',
            'organization_name' => 'ShilpoSetu HQ',
            'is_owner' => true,
            'is_active' => true,
            'subscription_plan' => 'pro',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
