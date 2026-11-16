<?php

namespace Tests\Feature\Auth;

use Database\Factories\UserFactory;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_renders_successfully_for_guests(): void
    {
        $response = $this->withoutVite()->get('/login');

        $response->assertOk();
    }

    public function test_active_admin_can_authenticate_with_valid_credentials(): void
    {
        $admin = UserFactory::new()->admin()->create();

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.dashboard', absolute: false));
        $this->assertNotNull($admin->fresh()?->last_login_label);
    }

    public function test_non_admin_user_is_rejected_on_login_and_signed_out(): void
    {
        $factoryUser = UserFactory::new()->create(['role' => 'fac']);

        $response = $this->post('/login', [
            'email' => $factoryUser->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'Access denied. Administrator credentials required.');
    }

    public function test_inactive_admin_is_rejected_on_login_and_signed_out(): void
    {
        $inactiveAdmin = UserFactory::new()->admin()->inactive()->create();

        $response = $this->post('/login', [
            'email' => $inactiveAdmin->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'Your administrator account is inactive.');
    }

    public function test_admin_cannot_authenticate_with_invalid_password(): void
    {
        $admin = UserFactory::new()->admin()->create();

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_authenticated_admin_can_logout(): void
    {
        $admin = UserFactory::new()->admin()->create();

        $response = $this->actingAs($admin)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect(route('login'));
    }

    public function test_seeded_super_admin_can_authenticate_with_configured_credentials(): void
    {
        $this->seed(AdminSeeder::class);

        $response = $this->post('/login', [
            'email' => 'admin@gentlestyle.com',
            'password' => '12345678',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }
}
