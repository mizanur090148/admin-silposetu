<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Production extends Model
{
    protected $table = 'productions';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'subcontract_order_id',
        'user_id',
        'employee_id',
        'order_no',
        'placement_index',
        'date_label',
        'shift',
        'machine_code',
        'operator_name',
        'qty_kg',
        'rolls_count',
        'yarn_lot',
        'fault_code',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'placement_index' => 'integer',
            'qty_kg' => 'decimal:2',
            'rolls_count' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'subcontract_order_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
