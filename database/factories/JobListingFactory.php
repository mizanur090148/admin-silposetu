<?php

namespace Database\Factories;

use App\Models\JobListing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobListing>
 */
class JobListingFactory extends Factory
{
    protected $model = JobListing::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'role_title' => 'নিটিং অপারেটর',
            'company_name' => fake()->company(),
            'area' => 'গাজীপুর',
            'category' => 'op',
            'shift_label' => 'শিফট A',
            'experience_label' => '২ বছর',
            'salary_label' => 'আলোচনা সাপেক্ষে',
            'posted_label' => 'আজ',
            'contact_phone' => '017'.fake()->numerify('########'),
            'is_new' => true,
            'vacancies' => 2,
            'requirements_json' => ['সার্কুলার নিটিং অভিজ্ঞতা'],
        ];
    }
}
