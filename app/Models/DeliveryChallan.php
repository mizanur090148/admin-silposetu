<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryChallan extends Model
{
    protected $table = 'delivery_challans';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'challan_no',
        'factory_code',
        'party_code',
        'order_no',
        'date_label',
        'rolls_json',
        'vehicle_no',
        'driver_name',
        'driver_phone',
        'factory_sign_json',
        'vendor_sign_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rolls_json' => 'array',
            'factory_sign_json' => 'array',
            'vendor_sign_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_code', 'code');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'order_no', 'order_no');
    }
}
