<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageThread extends Model
{
    protected $table = 'message_threads';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'thread_code',
        'factory_code',
        'party_code',
        'order_no',
        'title',
        'unread_count',
        'messages_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unread_count' => 'integer',
            'messages_json' => 'array',
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
