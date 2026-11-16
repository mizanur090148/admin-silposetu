<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreItem extends Model
{
    protected $table = 'store_items';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'item_code',
        'name',
        'category',
        'unit',
        'stock_qty',
        'min_qty',
        'unit_price',
        'rfq_sent',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock_qty' => 'integer',
            'min_qty' => 'integer',
            'unit_price' => 'decimal:2',
            'rfq_sent' => 'boolean',
        ];
    }
}
