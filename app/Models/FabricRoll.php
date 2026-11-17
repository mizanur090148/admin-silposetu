<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FabricRoll extends Model
{
    protected $table = 'fabric_rolls';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'roll_no',
        'jc_seq',
        'order_no',
        'placement_index',
        'machine_code',
        'date_label',
        'shift',
        'operator_name',
        'weight_kg',
        'yarn_lot',
        'faults_json',
        'challan_no',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'placement_index' => 'integer',
            'weight_kg' => 'decimal:2',
            'faults_json' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'order_no', 'order_no');
    }
}
