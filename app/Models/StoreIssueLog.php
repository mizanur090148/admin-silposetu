<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreIssueLog extends Model
{
    protected $table = 'store_issue_logs';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'item_code',
        'date_label',
        'machine_code',
        'qty',
        'issued_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qty' => 'integer',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(StoreItem::class, 'item_code', 'item_code');
    }
}
