<?php

namespace App\Models;

use Database\Factories\SupplierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supplier extends Model
{
    /** @use HasFactory<SupplierFactory> */
    use HasFactory;

    protected $table = 'suppliers';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'category',
        'also_categories_json',
        'area',
        'rating',
        'reviews_count',
        'description',
        'is_sponsored',
        'is_verified',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'also_categories_json' => 'array',
            'rating' => 'decimal:1',
            'reviews_count' => 'integer',
            'is_sponsored' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
