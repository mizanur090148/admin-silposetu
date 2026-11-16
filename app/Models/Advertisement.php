<?php

namespace App\Models;

use Database\Factories\AdvertisementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    /** @use HasFactory<AdvertisementFactory> */
    use HasFactory;

    protected $table = 'advertisements';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'org_name',
        'placement',
        'title',
        'description',
        'cta_label',
        'duration_label',
        'contact_phone',
        'status',
    ];
}
