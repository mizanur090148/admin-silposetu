<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the admin account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@silposetu.com'],
            [
                'customer_id' => 'ADM001',
                'name' => 'System Administrator',
                'phone' => '01700000000',
                'password' => Hash::make('password'),
                'account_type' => 'admin',
                'status' => 'active',
                'is_subscribed' => true,
            ]
        );
    }
}
