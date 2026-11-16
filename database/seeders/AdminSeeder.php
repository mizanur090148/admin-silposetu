<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the admin account using the new users table structure.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gentlestyle.com'],
            [
                'name' => 'System Administrator',
                'phone' => '01700000000',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'designation' => 'Super Admin',
                'organization_name' => 'ShilpoSetu HQ',
                'is_owner' => true,
                'is_vendor_rep' => false,
                'can_message' => true,
                'is_active' => true,
                'phone_verified_at' => now(),
                'subscription_plan' => 'pro',
                'billing_cycle' => 'y',
            ]
        );
    }
}
