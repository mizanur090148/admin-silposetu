<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $table = 'employees';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'employee_type',
        'id_no',
        'name',
        'mobile',
        'shift',
        'machine_assigned',
        'daily_wage',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'daily_wage' => 'decimal:2',
            'joining_date' => 'date:Y-m-d',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
