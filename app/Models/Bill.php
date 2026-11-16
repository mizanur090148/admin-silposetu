<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bill extends Model
{
    protected $table = 'bills';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'bill_no',
        'factory_code',
        'party_code',
        'bill_date',
        'jv_no',
        'lines_json',
        'payments_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'bill_date' => 'date:Y-m-d',
            'lines_json' => 'array',
            'payments_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_code', 'code');
    }
}
