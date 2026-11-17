<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Party extends Model
{
    use SoftDeletes;

    protected $table = 'parties';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'code',
        'name',
        'type',
        'address',
        'contact_person',
        'phone',
        'email',
        'bin_tin',
        'default_rate_tk',
        'payment_terms',
        'opening_balance',
        'added_date',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'default_rate_tk' => 'decimal:2',
            'opening_balance' => 'decimal:2',
            'added_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function subcontractOrders(): HasMany
    {
        return $this->hasMany(SubcontractOrder::class, 'party_id');
    }
}
