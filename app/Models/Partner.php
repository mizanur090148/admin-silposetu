<?php

namespace App\Models;

use Database\Factories\PartnerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partner extends Model
{
    /** @use HasFactory<PartnerFactory> */
    use HasFactory;

    protected $table = 'partners';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'partner_code',
        'total_referrals',
        'active_factories_count',
        'total_commission_tk',
        'withdrawn_commission_tk',
        'balance_commission_tk',
        'payout_method',
        'payout_number',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_referrals' => 'integer',
            'active_factories_count' => 'integer',
            'total_commission_tk' => 'decimal:2',
            'withdrawn_commission_tk' => 'decimal:2',
            'balance_commission_tk' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
