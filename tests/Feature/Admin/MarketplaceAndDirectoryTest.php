<?php

namespace Tests\Feature\Admin;

use App\Models\Advertisement;
use App\Models\Factory;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\Partner;
use App\Models\Party;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Models\Vendor;
use App\Notifications\NewSubcontractMatchNotification;
use Database\Factories\FactoryMachineFactory;
use Database\Factories\FreeMachineRequestFactory;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MarketplaceAndDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_publishing_work_offer_notifies_matching_factory_owner_and_accepting_quotation_awards_post(): void
    {
        Notification::fake();

        $admin = UserFactory::new()->admin()->create();
        $postingFactory = Factory::factory()->create(['code' => 'f10']);
        $candidateOwner = UserFactory::new()->create(['role' => 'fac', 'email' => 'candidate@example.com', 'is_active' => true]);
        $candidateFactory = Factory::factory()->create([
            'code' => 'f20',
            'owner_id' => $candidateOwner->id,
            'area' => 'গাজীপুর',
        ]);
        FactoryMachineFactory::new()->create([
            'factory_id' => $candidateFactory->id,
            'dia' => 30,
            'gauge' => 24,
            'status' => 'idle',
            'broadcast_free' => true,
            'supported_fabrics_json' => ['Single Jersey'],
        ]);

        $storeResponse = $this->actingAs($admin)->post(route('admin.posts.store'), [
            'factory_id' => $postingFactory->id,
            'post_type' => 'work_offer',
            'title' => 'Need 10,000 kg Single Jersey Capacity',
            'fabric_type' => 'Single Jersey',
            'gsm' => '160',
            'dia' => 30,
            'gauge' => 24,
            'quantity_kg' => 10000,
            'target_rate_tk' => 15.0,
            'location' => 'গাজীপুর',
            'status' => 'open',
            'notify_matches' => true,
        ]);

        $post = SubcontractPost::where('title', 'Need 10,000 kg Single Jersey Capacity')->firstOrFail();
        $storeResponse->assertRedirect(route('admin.posts.show', $post->id));
        Notification::assertSentTo($candidateOwner, NewSubcontractMatchNotification::class);

        $quotation = Quotation::create([
            'subcontract_post_id' => $post->id,
            'factory_id' => $candidateFactory->id,
            'bidder_name' => $candidateOwner->name,
            'bidder_phone' => $candidateOwner->phone,
            'offered_rate_tk' => 14.5,
            'estimated_days' => 10,
            'allocated_machines' => 4,
            'status' => 'pending',
        ]);

        $quoteResponse = $this->actingAs($admin)->post(route('admin.posts.quotations.status', [$post->id, $quotation->id]), [
            'status' => 'accepted',
        ]);

        $quoteResponse->assertRedirect();
        $this->assertSame('accepted', $quotation->fresh()?->status);
        $this->assertSame('awarded', $post->fresh()?->status);
    }

    public function test_admin_can_manage_free_machine_requests_and_supplier_rfqs(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create(['code' => 'f33']);
        $machineRequest = FreeMachineRequestFactory::new()->create([
            'factory_id' => $factory->id,
            'status' => 'new',
        ]);
        $rfq = SupplierRfq::create([
            'rfq_no' => 'RFQ-5001',
            'factory_code' => $factory->code,
            'category' => 'sinker',
            'item_name' => 'Groz-Beckert Needles 24G',
            'qty_label' => '5000 pcs',
            'need_by_label' => '3 days',
            'status' => 'new',
        ]);

        $reqUpdate = $this->actingAs($admin)->put(route('admin.free-machine-requests.update', $machineRequest->id), [
            'status' => 'conf',
            'machines_needed' => 4,
            'message' => 'Confirmed schedule with party',
        ]);

        $reqUpdate->assertRedirect();
        $this->assertSame('conf', $machineRequest->fresh()?->status);
        $this->assertSame(4, $machineRequest->fresh()?->machines_needed);

        $rfqUpdate = $this->actingAs($admin)->put(route('admin.supplier-rfqs.update', $rfq->id), [
            'status' => 'quoted',
            'quoted_price' => '৳35,000',
            'delivery_days' => '2 days',
        ]);

        $rfqUpdate->assertRedirect();
        $this->assertSame('quoted', $rfq->fresh()?->status);
        $this->assertSame('৳35,000', $rfq->fresh()?->quoted_price);
    }

    public function test_admin_can_crud_suppliers_vendors_partners_and_advertisements(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $user = UserFactory::new()->create();

        $this->actingAs($admin)->post(route('admin.suppliers.store'), [
            'user_id' => $user->id,
            'name' => 'Delta Needles Co',
            'category' => 'sinker',
            'also_categories' => 'spare, oil',
            'area' => 'Narayanganj',
            'description' => 'All circular needles and sinkers',
            'is_verified' => true,
            'is_sponsored' => false,
        ])->assertRedirect();

        $supplier = Supplier::where('name', 'Delta Needles Co')->firstOrFail();
        $this->assertSame(['spare', 'oil'], $supplier->also_categories_json);

        $this->actingAs($admin)->post(route('admin.vendors.store'), [
            'user_id' => $user->id,
            'code' => 'VEN-901',
            'name' => 'Apex Sourcing',
            'type' => 'buying_house',
            'is_verified' => true,
        ])->assertRedirect();
        $vendor = Vendor::where('code', 'VEN-901')->firstOrFail();
        $this->assertSame($vendor->id, $user->fresh()?->vendor_id);

        $this->actingAs($admin)->post(route('admin.partners.store'), [
            'user_id' => $user->id,
            'partner_code' => 'PTR-901',
            'total_referrals' => 5,
            'active_factories_count' => 3,
            'total_commission_tk' => 4500,
            'withdrawn_commission_tk' => 1500,
            'balance_commission_tk' => 3000,
            'payout_method' => 'bkash',
            'payout_number' => '01700000001',
        ])->assertRedirect();
        $this->assertNotNull(Partner::where('partner_code', 'PTR-901')->first());

        $this->actingAs($admin)->post(route('admin.advertisements.store'), [
            'org_name' => 'Metro Yarn Mills',
            'placement' => 'banner',
            'title' => '30s Combed Ready Stock',
            'cta_label' => 'Call Now',
            'duration_label' => '30 Days',
            'status' => 'pending',
        ])->assertRedirect();
        $ad = Advertisement::where('org_name', 'Metro Yarn Mills')->firstOrFail();

        $this->actingAs($admin)->post(route('admin.advertisements.status', $ad->id), [
            'status' => 'active',
        ])->assertRedirect();
        $this->assertSame('active', $ad->fresh()?->status);
    }

    public function test_vendors_and_partners_pages_surface_factory_parties_and_role_accounts(): void
    {
        $admin = UserFactory::new()->admin()->create();
        $factory = Factory::factory()->create(['code' => 'f91']);
        Party::create([
            'factory_id' => $factory->id,
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
            'type' => 'ven',
            'is_active' => true,
        ]);
        UserFactory::new()->create(['role' => 'ven', 'is_vendor_rep' => true, 'organization_name' => 'ABC Knit Composite']);
        UserFactory::new()->create(['role' => 'par', 'name' => 'Partner User']);

        $this->withoutVite()->actingAs($admin);

        $this->get(route('admin.vendors.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Vendors/Index')
                ->has('vendorParties', 1)
                ->has('vendorUsers', 1)
            );

        $this->get(route('admin.partners.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Partners/Index')
                ->has('partnerUsers', 1)
            );
    }

    public function test_admin_can_create_jobs_view_applications_and_delete_job_cascade(): void
    {
        $admin = UserFactory::new()->admin()->create();

        $this->actingAs($admin)->post(route('admin.jobs.store'), [
            'role_title' => 'Circular Knitting Supervisor',
            'company_name' => 'Padma Knitwear',
            'area' => 'Gazipur',
            'category' => 'sup',
            'salary_label' => '৳28,000',
            'posted_label' => 'Today',
            'vacancies' => 2,
            'is_new' => true,
            'requirements_text' => "5 years experience\nShift leadership",
        ])->assertRedirect();

        $job = JobListing::where('role_title', 'Circular Knitting Supervisor')->firstOrFail();
        $this->assertSame(['5 years experience', 'Shift leadership'], $job->requirements_json);

        $application = JobApplication::create([
            'job_listing_id' => $job->id,
            'applicant_name' => 'Sohel Rana',
            'phone' => '01799001122',
            'experience' => '6 years',
            'current_area' => 'Tongi',
        ]);

        $showResponse = $this->withoutVite()->actingAs($admin)->get(route('admin.jobs.show', $job->id));
        $showResponse->assertOk();

        $this->actingAs($admin)->delete(route('admin.jobs.applications.destroy', [$job->id, $application->id]))
            ->assertRedirect();
        $this->assertModelMissing($application);

        $this->actingAs($admin)->delete(route('admin.jobs.destroy', $job->id))
            ->assertRedirect(route('admin.jobs.index'));
        $this->assertModelMissing($job);
    }
}
