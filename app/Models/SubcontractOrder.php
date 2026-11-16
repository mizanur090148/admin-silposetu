<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubcontractOrder extends Model
{
    use SoftDeletes;

    protected $table = 'subcontract_orders';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_no',
        'factory_id',
        'party_id',
        'party_code',
        'buyer',
        'fabric_summary',
        'gsm',
        'finish_gsm',
        'stitch_length',
        'grey_dia',
        'dia_gauge',
        'color',
        'yarn_summary',
        'total_qty_kg',
        'done_kg',
        'delivered_kg',
        'daily_rate_kg',
        'rate_tk',
        'status',
        'start_label',
        'order_date',
        'delivery_due_date',
        'complete_date',
        'today_prod_kg',
        'week_prod_json',
        'machines_json',
        'challans_json',
        'yarn_in_json',
        'yarn_returns_json',
        'yarn_requests_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_qty_kg' => 'decimal:2',
            'done_kg' => 'decimal:2',
            'delivered_kg' => 'decimal:2',
            'daily_rate_kg' => 'decimal:2',
            'rate_tk' => 'decimal:2',
            'today_prod_kg' => 'decimal:2',
            'order_date' => 'date:Y-m-d',
            'delivery_due_date' => 'date:Y-m-d',
            'complete_date' => 'date:Y-m-d',
            'week_prod_json' => 'array',
            'machines_json' => 'array',
            'challans_json' => 'array',
            'yarn_in_json' => 'array',
            'yarn_returns_json' => 'array',
            'yarn_requests_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'party_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(OrderLine::class, 'subcontract_order_id')->orderBy('line_index');
    }

    public function productions(): HasMany
    {
        return $this->hasMany(Production::class, 'subcontract_order_id');
    }

    public function qcInspections(): HasMany
    {
        return $this->hasMany(QcInspection::class, 'order_no', 'order_no');
    }

    public function deliveryChallans(): HasMany
    {
        return $this->hasMany(DeliveryChallan::class, 'order_no', 'order_no');
    }
}
