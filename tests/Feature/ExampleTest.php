<?php

namespace Tests\Feature;

use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_root_request_redirects_to_login(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_admin_can_access_root_dashboard(): void
    {
        $admin = UserFactory::new()->admin()->create();

        $response = $this->withoutVite()->actingAs($admin)->get('/');

        $response->assertOk();
    }
}
