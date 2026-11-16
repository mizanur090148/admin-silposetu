<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\MessageThread;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageThreadController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $factoryCode = $request->input('factory_code', 'all');
        $unreadOnly = $request->input('unread_only', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = MessageThread::query()
            ->with(['factory:id,code,name,area', 'order:id,order_no,buyer,status'])
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('thread_code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('order_no', 'like', "%{$search}%")
                        ->orWhere('party_code', 'like', "%{$search}%")
                        ->orWhere('factory_code', 'like', "%{$search}%");
                });
            })
            ->when($factoryCode !== 'all', function ($q) use ($factoryCode): void {
                $q->where('factory_code', $factoryCode);
            })
            ->when($unreadOnly === '1', function ($q): void {
                $q->where('unread_count', '>', 0);
            });

        $threads = $query->orderByDesc('unread_count')->latest('id')->paginate($perPage)->withQueryString();
        $threads->through(function (MessageThread $thread): array {
            $messages = $thread->messages_json ?? [];
            $last = ! empty($messages) ? $messages[array_key_last($messages)] : null;

            return [
                'id' => $thread->id,
                'thread_code' => $thread->thread_code,
                'factory_code' => $thread->factory_code,
                'party_code' => $thread->party_code,
                'order_no' => $thread->order_no,
                'title' => $thread->title,
                'unread_count' => $thread->unread_count,
                'messages_count' => count($messages),
                'last_message' => $last,
                'factory' => $thread->factory,
                'order' => $thread->order,
                'updated_at' => $thread->updated_at?->toIso8601String(),
            ];
        });

        return Inertia::render('Admin/Threads/Index', [
            'threads' => $threads,
            'summary' => [
                'total' => MessageThread::count(),
                'unread_threads' => MessageThread::where('unread_count', '>', 0)->count(),
                'total_unread_messages' => (int) MessageThread::sum('unread_count'),
            ],
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'factory_code' => $factoryCode,
                'unread_only' => $unreadOnly,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(int $id): Response
    {
        $thread = MessageThread::query()
            ->with(['factory:id,code,name,area,phone', 'order:id,order_no,buyer,status,fabric_summary,total_qty_kg,done_kg'])
            ->findOrFail($id);

        return Inertia::render('Admin/Threads/Show', [
            'thread' => $thread,
        ]);
    }

    public function reply(Request $request, int $id): RedirectResponse
    {
        $thread = MessageThread::findOrFail($id);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $messages = $thread->messages_json ?? [];
        $messages[] = [
            's' => 'sys',
            'who' => 'sys',
            'n' => $request->user()?->name ?: 'ShilpoSetu Admin',
            't' => now()->format('d M, h:i A'),
            'txt' => trim($validated['message']),
        ];

        $thread->update([
            'messages_json' => $messages,
            'unread_count' => 0,
        ]);

        return back()->with('success', "System message sent to thread {$thread->thread_code}.");
    }

    public function markRead(int $id): RedirectResponse
    {
        $thread = MessageThread::findOrFail($id);
        $thread->update(['unread_count' => 0]);

        return back()->with('success', "Marked thread {$thread->thread_code} as read.");
    }
}
