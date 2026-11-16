<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'role',
        'designation',
        'organization_name',
        'factory_id',
        'vendor_id',
        'supplier_id',
        'partner_code',
        'party_code',
        'is_owner',
        'is_vendor_rep',
        'can_message',
        'is_active',
        'phone_verified_at',
        'trial_ends_at',
        'subscription_plan',
        'billing_cycle',
        'last_login_label',
        'permissions_json',
        'profile_json',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_owner' => 'boolean',
            'is_vendor_rep' => 'boolean',
            'can_message' => 'boolean',
            'is_active' => 'boolean',
            'phone_verified_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'permissions_json' => 'array',
            'profile_json' => 'array',
        ];
    }

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'factory_id');
    }

    public function ownedFactories(): HasMany
    {
        return $this->hasMany(Factory::class, 'owner_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function partner(): HasOne
    {
        return $this->hasOne(Partner::class, 'user_id');
    }

    public function subcontractPosts(): HasMany
    {
        return $this->hasMany(SubcontractPost::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
