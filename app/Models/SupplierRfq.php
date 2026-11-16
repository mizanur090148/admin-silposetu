<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierRfq extends Model
{
    protected $table = 'supplier_rfqs';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'rfq_no',
        'factory_code',
        'category',
        'item_name',
        'qty_label',
        'area',
        'phone',
        'need_by_label',
        'status',
        'quoted_price',
        'delivery_days',
        'note',
    ];

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_code', 'code');
    }
}
