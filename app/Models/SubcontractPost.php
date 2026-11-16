<?php

namespace App\Models;

use Database\Factories\SubcontractPostFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubcontractPost extends Model
{
    /** @use HasFactory<SubcontractPostFactory> */
    use HasFactory;

    protected $table = 'subcontract_posts';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'factory_id',
        'post_type',
        'title',
        'fabric_type',
        'gsm',
        'dia',
        'gauge',
        'quantity_kg',
        'target_rate_tk',
        'yarn_count',
        'location',
        'delivery_deadline',
        'description',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dia' => 'integer',
            'gauge' => 'integer',
            'quantity_kg' => 'decimal:2',
            'target_rate_tk' => 'decimal:2',
            'delivery_deadline' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'subcontract_post_id');
    }
}
