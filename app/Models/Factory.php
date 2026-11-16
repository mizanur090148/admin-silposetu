<?php

namespace App\Models;

use Database\Factories\FactoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factory extends Model
{
    /** @use HasFactory<FactoryFactory> */
    use HasFactory;

    protected $table = 'factories';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'area',
        'address',
        'phone',
        'total_machines',
        'plan_code',
        'trial_ends_at',
        'owner_id',
        'billing_cycle',
        'qr_sticker_enabled',
        'last_update_label',
        'yearly_orders_count',
        'ontime_delivery_pct',
        'qc_reject_pct',
        'settings_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_machines' => 'integer',
            'trial_ends_at' => 'datetime',
            'qr_sticker_enabled' => 'boolean',
            'yearly_orders_count' => 'integer',
            'ontime_delivery_pct' => 'decimal:2',
            'qc_reject_pct' => 'decimal:2',
            'settings_json' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'factory_id');
    }

    public function factoryMachines(): HasMany
    {
        return $this->hasMany(FactoryMachine::class, 'factory_id');
    }

    public function freeMachineRequests(): HasMany
    {
        return $this->hasMany(FreeMachineRequest::class, 'factory_id');
    }

    public function subcontractPosts(): HasMany
    {
        return $this->hasMany(SubcontractPost::class, 'factory_id');
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'factory_id');
    }

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class, 'factory_id');
    }

    public function parties(): HasMany
    {
        return $this->hasMany(Party::class, 'factory_id');
    }

    public function subcontractOrders(): HasMany
    {
        return $this->hasMany(SubcontractOrder::class, 'factory_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'factory_id');
    }

    public function supplierRfqs(): HasMany
    {
        return $this->hasMany(SupplierRfq::class, 'factory_code', 'code');
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'factory_code', 'code');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(FactoryExpense::class, 'factory_id');
    }

    public function messageThreads(): HasMany
    {
        return $this->hasMany(MessageThread::class, 'factory_code', 'code');
    }
}
