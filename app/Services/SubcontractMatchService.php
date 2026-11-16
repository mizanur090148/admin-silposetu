<?php

namespace App\Services;

use App\Models\Factory;
use App\Models\SubcontractPost;
use App\Models\User;
use App\Notifications\NewSubcontractMatchNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

class SubcontractMatchService
{
    /**
     * Find matching factories for a subcontract work offer based on machine specs,
     * supported fabrics, broadcast availability, and area.
     *
     * @return Collection<int, array{factory: Factory, user: User, score: int, match_reason: string}>
     */
    public function findMatchingFactories(SubcontractPost $post): Collection
    {
        if ($post->post_type !== 'work_offer') {
            return collect();
        }

        $candidates = Factory::query()
            ->with(['owner', 'users', 'factoryMachines'])
            ->when($post->factory_id, function ($query) use ($post): void {
                $query->where('id', '!=', $post->factory_id);
            })
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        $postFabric = strtolower(trim((string) $post->fabric_type));
        $postLocation = strtolower(trim((string) $post->location));
        $scored = collect();

        foreach ($candidates as $factory) {
            $recipient = $this->resolveRecipientUser($factory, $post->user_id);

            if (! $recipient || ! $recipient->email) {
                continue;
            }

            $score = 0;
            $reasons = [];

            $matchingFabric = $factory->factoryMachines->contains(function ($machine) use ($postFabric): bool {
                $supported = collect($machine->supported_fabrics_json ?? [])->map(fn ($item): string => strtolower((string) $item));

                return $postFabric !== '' && $supported->contains(fn ($item): bool => str_contains($item, $postFabric) || str_contains($postFabric, $item));
            });

            if ($matchingFabric) {
                $score += 40;
                $reasons[] = "ফ্যাব্রিক সক্ষমতা ({$post->fabric_type})";
            }

            if ($post->dia || $post->gauge) {
                $exactSpec = $factory->factoryMachines->contains(function ($machine) use ($post): bool {
                    $diaOk = ! $post->dia || (int) $machine->dia === (int) $post->dia;
                    $gaugeOk = ! $post->gauge || (int) $machine->gauge === (int) $post->gauge;

                    return $diaOk && $gaugeOk;
                });

                if ($exactSpec) {
                    $score += 30;
                    $reasons[] = 'ডায়া/গেজ স্পেক ম্যাচ';
                }
            }

            $idleOrBroadcast = $factory->factoryMachines->where('status', 'idle')->count()
                + $factory->factoryMachines->where('broadcast_free', true)->count();

            if ($idleOrBroadcast > 0) {
                $score += 15;
                $reasons[] = 'ফ্রি মেশিন উপলব্ধ';
            }

            $factoryArea = strtolower(trim((string) $factory->area));
            if ($postLocation !== '' && $factoryArea !== '' && (str_contains($factoryArea, $postLocation) || str_contains($postLocation, $factoryArea))) {
                $score += 20;
                $reasons[] = "এলাকা ({$factory->area})";
            }

            if ($score > 0 || $candidates->count() <= 10) {
                $scored->push([
                    'factory' => $factory,
                    'user' => $recipient,
                    'score' => max($score, 10),
                    'match_reason' => ! empty($reasons) ? implode(' • ', $reasons) : 'সক্রিয় নিটিং নেটওয়ার্ক ম্যাচ',
                ]);
            }
        }

        return $scored->sortByDesc('score')->values();
    }

    /**
     * Send email notifications to matched factory contacts.
     */
    public function notifyMatchingFactories(SubcontractPost $post): int
    {
        try {
            $matches = $this->findMatchingFactories($post);

            if ($matches->isEmpty()) {
                return 0;
            }

            $count = 0;
            foreach ($matches as $match) {
                try {
                    $match['user']->notify(new NewSubcontractMatchNotification($post, $match['match_reason']));
                    $count++;
                } catch (Throwable $e) {
                    Log::warning("Failed sending match notification for post #{$post->id}: {$e->getMessage()}");
                }
            }

            return $count;
        } catch (Throwable $e) {
            Log::error("Error in notifyMatchingFactories for post #{$post->id}: {$e->getMessage()}");

            return 0;
        }
    }

    private function resolveRecipientUser(Factory $factory, ?int $excludeUserId): ?User
    {
        if ($factory->owner && $factory->owner->is_active && $factory->owner->id !== $excludeUserId) {
            return $factory->owner;
        }

        return $factory->users
            ->where('is_active', true)
            ->when($excludeUserId, fn ($col) => $col->where('id', '!=', $excludeUserId))
            ->sortByDesc('is_owner')
            ->first(fn (User $user): bool => ! empty($user->email));
    }
}
