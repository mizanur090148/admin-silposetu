<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    protected $table = 'job_applications';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'job_listing_id',
        'applicant_name',
        'phone',
        'experience',
        'current_area',
        'note',
    ];

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class, 'job_listing_id');
    }
}
