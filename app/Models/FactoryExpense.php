<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryExpense extends Model
{
    protected $table = 'factory_expenses';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'category',
        'title',
        'amount_tk',
        'payment_method',
        'reference_no',
        'expense_date',
        'created_by',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_tk' => 'decimal:2',
            'expense_date' => 'date:Y-m-d',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
