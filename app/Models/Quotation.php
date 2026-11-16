<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quotation extends Model
{
    protected $table = 'quotations';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'subcontract_post_id',
        'factory_id',
        'bidder_name',
        'bidder_phone',
        'offered_rate_tk',
        'estimated_days',
        'allocated_machines',
        'note',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'offered_rate_tk' => 'decimal:2',
            'estimated_days' => 'integer',
            'allocated_machines' => 'integer',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(SubcontractPost::class, 'subcontract_post_id');
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
