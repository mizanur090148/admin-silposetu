<?php

namespace App\Models;

use Database\Factories\FreeMachineRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreeMachineRequest extends Model
{
    /** @use HasFactory<FreeMachineRequestFactory> */
    use HasFactory;

    protected $table = 'free_machine_requests';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'request_no',
        'factory_id',
        'party_code',
        'contact_person',
        'fabrication',
        'qty_kg',
        'machines_needed',
        'spec_label',
        'start_date',
        'message',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qty_kg' => 'decimal:2',
            'machines_needed' => 'integer',
            'start_date' => 'date:Y-m-d',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
