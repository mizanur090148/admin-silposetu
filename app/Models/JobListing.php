<?php

namespace App\Models;

use Database\Factories\JobListingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobListing extends Model
{
    /** @use HasFactory<JobListingFactory> */
    use HasFactory;

    protected $table = 'job_listings';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'role_title',
        'company_name',
        'area',
        'category',
        'shift_label',
        'experience_label',
        'salary_label',
        'posted_label',
        'contact_phone',
        'is_new',
        'vacancies',
        'requirements_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_new' => 'boolean',
            'vacancies' => 'integer',
            'requirements_json' => 'array',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_listing_id');
    }
}
