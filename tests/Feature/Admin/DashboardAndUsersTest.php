<?php

namespace Tests\Feature\Admin;

use App\Models\Factory;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DashboardAndUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_user_is_redirected_when_requesting_admin_dashboard(): void
    {
        $factoryUser = UserFactory::new()->create(['role' => 'fac']);

        $response = $this->actingAs($factoryUser)->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_inactive_admin_session_is_invalidated_on_protected_routes(): void
    {
        $inactiveAdmin = UserFactory::new()->admin()->inactive()->create();

        $response = $this->actingAs($inactiveAdmin)->get(route('admin.users.index'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_dashboard_renders_live_stats_and_operators_view_runs_on_database(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create();
        DB::table('employees')->insert([
            'factory_id' => $factory->id,
            'employee_type' => 'operator',
            'name' => 'Kamrul Hasan',
            'designation' => 'Senior Operator',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $operatorsCount = DB::table('operators')->count();
        $response = $this->withoutVite()->actingAs($admin)->get(route('admin.dashboard'));

        $this->assertSame(1, $operatorsCount);
        $response->assertOk();
    }

    public function test_admin_can_create_update_toggle_and_delete_users_while_self_is_protected(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create();

        $createResponse = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Rafiq Mia',
            'phone' => '01755001122',
            'email' => 'rafiq@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'fac',
            'designation' => 'Production Manager',
            'organization_name' => $factory->name,
            'factory_id' => $factory->id,
            'is_owner' => true,
            'is_active' => true,
            'can_message' => true,
            'subscription_plan' => 'pro',
            'billing_cycle' => 'm',
        ]);

        $createResponse->assertRedirect();
        $createdUser = User::where('phone', '01755001122')->firstOrFail();
        $this->assertSame('fac', $createdUser->role);
        $this->assertTrue($createdUser->is_owner);

        $toggleResponse = $this->actingAs($admin)->post(route('admin.users.toggleStatus', $createdUser->id));

        $toggleResponse->assertRedirect();
        $this->assertFalse($createdUser->fresh()->is_active);

        $selfDeleteResponse = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin->id));

        $selfDeleteResponse->assertRedirect();
        $selfDeleteResponse->assertSessionHas('error', 'You cannot delete your own signed-in account.');
        $this->assertModelExists($admin);

        $deleteResponse = $this->actingAs($admin)->delete(route('admin.users.destroy', $createdUser->id));

        $deleteResponse->assertRedirect();
        $this->assertModelMissing($createdUser);
    }

    public function test_user_creation_rejects_duplicate_phone_and_invalid_role(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $existing = UserFactory::new()->create(['phone' => '01811223344']);

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Duplicate Phone',
            'phone' => $existing->phone,
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'invalid_role',
            'subscription_plan' => 'free',
            'billing_cycle' => 'm',
        ]);

        $response->assertSessionHasErrors(['phone', 'role']);
        $this->assertSame(2, User::count());
    }

    public function test_users_index_filters_by_subscription_plan(): void
    {
        $admin = UserFactory::new()->admin()->create(['subscription_plan' => 'free']);
        $growth = UserFactory::new()->create(['subscription_plan' => 'g']);

        $this->withoutVite()->actingAs($admin);

        $this->get(route('admin.users.index', ['subscription_plan' => 'g']))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 1)
                ->where('users.data.0.id', $growth->id)
            );
    }
}
