<?php

namespace App\Models;

use Database\Factories\FactoryMachineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryMachine extends Model
{
    /** @use HasFactory<FactoryMachineFactory> */
    use HasFactory;

    protected $table = 'factory_machines';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'code',
        'knit_type',
        'dia',
        'gauge',
        'spec_label',
        'brand',
        'status',
        'current_order_no',
        'broadcast_free',
        'free_from',
        'daily_capacity_kg',
        'rate_label',
        'supported_fabrics_json',
        'note',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dia' => 'integer',
            'gauge' => 'integer',
            'broadcast_free' => 'boolean',
            'free_from' => 'date:Y-m-d',
            'daily_capacity_kg' => 'integer',
            'supported_fabrics_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
