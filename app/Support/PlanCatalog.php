<?php

namespace App\Support;

use App\Models\Bill;
use App\Models\Factory;
use Illuminate\Support\Carbon;

class PlanCatalog
{
    /**
     * Subscription tiers aligned with the KnitKhata / SilpoSetu platform.
     *
     * @var array<string, array{code: string, name: string, bn_name: string, max_machines: int|null, monthly_tk: int, annual_tk: int}>
     */
    public const PLANS = [
        's' => [
            'code' => 's',
            'name' => 'Starter',
            'bn_name' => 'স্টার্টার',
            'max_machines' => 10,
            'monthly_tk' => 1000,
            'annual_tk' => 10000,
        ],
        'g' => [
            'code' => 'g',
            'name' => 'Growth',
            'bn_name' => 'গ্রোথ',
            'max_machines' => 25,
            'monthly_tk' => 1500,
            'annual_tk' => 15000,
        ],
        'p' => [
            'code' => 'p',
            'name' => 'Pro',
            'bn_name' => 'প্রো',
            'max_machines' => 60,
            'monthly_tk' => 2500,
            'annual_tk' => 25000,
        ],
        'e' => [
            'code' => 'e',
            'name' => 'Enterprise',
            'bn_name' => 'এন্টারপ্রাইজ',
            'max_machines' => null,
            'monthly_tk' => 4000,
            'annual_tk' => 40000,
        ],
        'free' => [
            'code' => 'free',
            'name' => 'Free',
            'bn_name' => 'ফ্রি',
            'max_machines' => 5,
            'monthly_tk' => 0,
            'annual_tk' => 0,
        ],
    ];

    /**
     * @return array{code: string, name: string, bn_name: string, max_machines: int|null, monthly_tk: int, annual_tk: int}
     */
    public static function get(?string $planCode): array
    {
        $key = strtolower(trim((string) $planCode));

        return self::PLANS[$key] ?? [
            'code' => $key !== '' ? $key : 'g',
            'name' => strtoupper($key !== '' ? $key : 'G'),
            'bn_name' => strtoupper($key !== '' ? $key : 'G'),
            'max_machines' => null,
            'monthly_tk' => 0,
            'annual_tk' => 0,
        ];
    }

    public static function monthlyRevenueFor(Factory $factory): float
    {
        $plan = self::get($factory->plan_code);
        if ($plan['monthly_tk'] <= 0) {
            return 0.0;
        }

        if ($factory->billing_cycle === 'y') {
            return round($plan['annual_tk'] / 12, 2);
        }

        return (float) $plan['monthly_tk'];
    }

    /**
     * @return array{trial_state: string, days_left: int|null, over_quota: bool, max_machines: int|null}
     */
    public static function factoryHealth(Factory $factory, int $trackedMachines): array
    {
        $plan = self::get($factory->plan_code);
        $max = $plan['max_machines'];
        $used = max($trackedMachines, (int) $factory->total_machines);
        $overQuota = $max !== null && $used > $max;

        $daysLeft = null;
        $trialState = 'active_paid';
        if ($factory->trial_ends_at) {
            $daysLeft = (int) now()->startOfDay()->diffInDays(Carbon::parse($factory->trial_ends_at)->startOfDay(), false);
            if ($daysLeft < 0) {
                $trialState = 'expired';
            } elseif ($daysLeft <= 7) {
                $trialState = 'expiring';
            } else {
                $trialState = 'trialing';
            }
        }

        return [
            'trial_state' => $trialState,
            'days_left' => $daysLeft,
            'over_quota' => $overQuota,
            'max_machines' => $max,
        ];
    }

    /**
     * Compute gross, paid, pending, and net due amounts from Bill JSON payloads.
     *
     * @return array{gross_tk: float, paid_tk: float, pending_tk: float, due_tk: float}
     */
    public static function billTotals(Bill $bill): array
    {
        $gross = 0.0;
        foreach ($bill->lines_json ?? [] as $line) {
            if (! is_array($line)) {
                continue;
            }
            if (isset($line['amount'])) {
                $gross += (float) $line['amount'];
            } else {
                $gross += ((float) ($line['kg'] ?? 0)) * ((float) ($line['rate'] ?? 0));
            }
        }

        $paid = 0.0;
        $pending = 0.0;
        foreach ($bill->payments_json ?? [] as $payment) {
            if (! is_array($payment)) {
                continue;
            }
            $amt = (float) ($payment['amt'] ?? $payment['amount'] ?? 0);
            if (! empty($payment['pend'])) {
                $pending += $amt;
            } else {
                $paid += $amt;
            }
        }

        $due = max(0.0, round($gross - $paid, 2));

        return [
            'gross_tk' => round($gross, 2),
            'paid_tk' => round($paid, 2),
            'pending_tk' => round($pending, 2),
            'due_tk' => $due,
        ];
    }
}
