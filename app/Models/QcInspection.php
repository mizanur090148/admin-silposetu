<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcInspection extends Model
{
    protected $table = 'qc_inspections';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'qc_no',
        'order_no',
        'placement_index',
        'placement_name',
        'date_label',
        'roll_no',
        'machine_code',
        'weight_kg',
        'issue_description',
        'source',
        'factory_sign_json',
        'vendor_sign_json',
        'action_taken',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'placement_index' => 'integer',
            'weight_kg' => 'decimal:2',
            'factory_sign_json' => 'array',
            'vendor_sign_json' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'order_no', 'order_no');
    }
}
