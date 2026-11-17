<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryAttendance extends Model
{
    protected $table = 'factory_attendances';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'worker_name',
        'role_type',
        'shift',
        'status',
        'attendance_date',
        'in_time',
        'out_time',
        'overtime_hours',
        'daily_wage_tk',
        'note',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attendance_date' => 'date:Y-m-d',
            'overtime_hours' => 'decimal:2',
            'daily_wage_tk' => 'decimal:2',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }
}
