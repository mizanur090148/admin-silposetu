<?php

namespace Tests\Feature\Admin;

use App\Models\Advertisement;
use App\Models\Factory;
use App\Models\JobListing;
use App\Models\Partner;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Models\Vendor;
use Database\Factories\FactoryMachineFactory;
use Database\Factories\FreeMachineRequestFactory;
use Database\Factories\SubcontractPostFactory;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AllRoutesAndUpdatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_admin_inertia_pages_render_with_expected_components_and_props(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $owner = UserFactory::new()->create(['role' => 'fac', 'is_owner' => true]);
        $factory = Factory::factory()->create(['owner_id' => $owner->id, 'code' => 'f120']);
        $machine = FactoryMachineFactory::new()->create(['factory_id' => $factory->id]);
        $request = FreeMachineRequestFactory::new()->create(['factory_id' => $factory->id, 'start_date' => null]);
        $post = SubcontractPostFactory::new()->create(['factory_id' => $factory->id, 'user_id' => $owner->id]);
        $supplier = Supplier::create([
            'user_id' => $owner->id,
            'name' => 'Knit Needle Hub',
            'category' => 'sinker',
            'area' => 'Gazipur',
            'description' => 'Needles & spare parts',
            'is_verified' => true,
            'is_sponsored' => false,
        ]);
        SupplierRfq::create([
            'rfq_no' => 'RFQ-8801',
            'factory_code' => $factory->code,
            'item_name' => 'Synthetic Oil',
            'qty_label' => '100L',
            'need_by_label' => 'Today',
            'status' => 'new',
        ]);
        Vendor::create([
            'user_id' => $owner->id,
            'factory_id' => $factory->id,
            'code' => 'VEN-8801',
            'name' => 'Dhaka Apparel Sourcing',
            'type' => 'buying_house',
            'is_verified' => true,
        ]);
        Partner::create([
            'user_id' => $owner->id,
            'partner_code' => 'PTR-8801',
            'total_referrals' => 2,
            'active_factories_count' => 1,
            'total_commission_tk' => 1000,
            'withdrawn_commission_tk' => 0,
            'balance_commission_tk' => 1000,
            'payout_method' => 'bkash',
        ]);
        Advertisement::create([
            'org_name' => 'Shilpo Ads',
            'placement' => 'banner',
            'title' => 'Sponsored Banner',
            'cta_label' => 'Contact',
            'duration_label' => '30 Days',
            'status' => 'pending',
        ]);
        $job = JobListing::create([
            'role_title' => 'Interlock Operator',
            'company_name' => $factory->name,
            'area' => 'Gazipur',
            'category' => 'op',
            'salary_label' => '৳20,000',
            'posted_label' => 'Today',
            'is_new' => true,
            'vacancies' => 3,
            'requirements_json' => ['Dia 30 experience'],
        ]);

        $this->withoutVite()->actingAs($admin);

        $this->get(route('admin.dashboard'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard')->has('stats')->has('recentFactories'));

        $this->get(route('admin.users.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Users/Index')->has('users.data', 2)->has('counts'));

        $this->get(route('admin.factories.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Factories/Index')->has('factories.data', 1));

        $this->get(route('admin.factories.create'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Factories/Create')->has('owners')->has('suggestedCode'));

        $this->get(route('admin.factories.edit', $factory->id))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Factories/Edit')->where('factory.id', $factory->id));

        $this->get(route('admin.factories.import'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Factories/Import')->has('existingPlans'));

        $this->get(route('admin.factory-machines.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/FactoryMachines/Index')->where('machines.data.0.id', $machine->id));

        $this->get(route('admin.posts.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Posts/Index')->where('posts.data.0.id', $post->id));

        $this->get(route('admin.posts.create'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Posts/Create')->has('factories')->has('users'));

        $this->get(route('admin.posts.show', $post->id))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Posts/Show')->where('post.id', $post->id)->has('matches'));

        $this->get(route('admin.free-machine-requests.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/FreeMachineRequests/Index')->where('requests.data.0.id', $request->id));

        $this->get(route('admin.suppliers.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Suppliers/Index')->where('suppliers.data.0.id', $supplier->id));

        $this->get(route('admin.supplier-rfqs.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/SupplierRfqs/Index')->has('rfqs.data', 1));

        $this->get(route('admin.vendors.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Vendors/Index')->has('vendors.data', 1));

        $this->get(route('admin.partners.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Partners/Index')->has('partners.data', 1)->has('summary'));

        $this->get(route('admin.advertisements.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Advertisements/Index')->has('advertisements.data', 1));

        $this->get(route('admin.jobs.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Jobs/Index')->where('jobs.data.0.id', $job->id));
    }

    public function test_csv_templates_download_and_update_endpoints_persist_changes(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $user = UserFactory::new()->create(['role' => 'fac']);
        $factory = Factory::factory()->create(['code' => 'f444', 'name' => 'Old Factory']);
        $machine = FactoryMachineFactory::new()->create(['factory_id' => $factory->id, 'code' => 'MC-09']);
        $partner = Partner::create([
            'user_id' => $user->id,
            'partner_code' => 'PTR-444',
            'total_referrals' => 1,
            'active_factories_count' => 1,
            'total_commission_tk' => 500,
            'withdrawn_commission_tk' => 0,
            'balance_commission_tk' => 500,
            'payout_method' => 'bkash',
        ]);

        $this->actingAs($admin);

        $this->get(route('admin.factories.template'))->assertOk();
        $this->get(route('admin.factory-machines.template'))->assertOk();

        $this->put(route('admin.users.update', $user->id), [
            'name' => 'Updated Staff Name',
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => 'ven',
            'subscription_plan' => 'pro',
            'billing_cycle' => 'y',
            'is_active' => true,
        ])->assertRedirect();
        $this->assertSame('Updated Staff Name', $user->fresh()?->name);
        $this->assertSame('ven', $user->fresh()?->role);

        $this->put(route('admin.factories.update', $factory->id), [
            'code' => 'f444',
            'name' => 'Renamed Composite Knit',
            'total_machines' => 36,
            'plan_code' => 'p',
            'billing_cycle' => 'y',
            'qr_sticker_enabled' => false,
        ])->assertRedirect(route('admin.factories.show', $factory->id));
        $this->assertSame('Renamed Composite Knit', $factory->fresh()?->name);
        $this->assertFalse($factory->fresh()?->qr_sticker_enabled);

        $this->put(route('admin.factory-machines.update', $machine->id), [
            'factory_id' => $factory->id,
            'code' => 'MC-09',
            'knit_type' => 'f',
            'gauge' => 12,
            'status' => 'run:SC-100',
            'daily_capacity_kg' => 160,
            'broadcast_free' => false,
        ])->assertRedirect();
        $this->assertSame('run:SC-100', $machine->fresh()?->status);
        $this->assertSame('ফ্ল্যাট · 12G', $machine->fresh()?->spec_label);

        $this->put(route('admin.partners.update', $partner->id), [
            'user_id' => $user->id,
            'partner_code' => 'PTR-444',
            'total_referrals' => 8,
            'active_factories_count' => 5,
            'total_commission_tk' => 9000,
            'withdrawn_commission_tk' => 3000,
            'balance_commission_tk' => 6000,
            'payout_method' => 'nagad',
            'payout_number' => '01800001122',
        ])->assertRedirect();
        $this->assertSame('nagad', $partner->fresh()?->payout_method);
        $this->assertSame(8, $partner->fresh()?->total_referrals);
    }
}
