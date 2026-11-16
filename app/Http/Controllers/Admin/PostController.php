<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use App\Models\User;
use App\Services\SubcontractMatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(private readonly SubcontractMatchService $matchService) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $postType = $request->input('post_type', 'all');
        $status = $request->input('status', 'all');
        $factoryId = $request->input('factory_id', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = SubcontractPost::query()
            ->with(['user:id,name,phone', 'factory:id,code,name,area'])
            ->withCount('quotations')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('fabric_type', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('yarn_count', 'like', "%{$search}%")
                        ->orWhereHas('factory', function ($fq) use ($search): void {
                            $fq->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($postType !== 'all', function ($q) use ($postType): void {
                $q->where('post_type', $postType);
            })
            ->when($status !== 'all', function ($q) use ($status): void {
                $q->where('status', $status);
            })
            ->when($factoryId !== 'all', function ($q) use ($factoryId): void {
                $q->where('factory_id', (int) $factoryId);
            });

        $posts = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => SubcontractPost::count(),
            'open' => SubcontractPost::where('status', 'open')->count(),
            'work_offer' => SubcontractPost::where('post_type', 'work_offer')->count(),
            'machine_available' => SubcontractPost::where('post_type', 'machine_available')->count(),
        ];

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'counts' => $counts,
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name']),
            'filters' => [
                'search' => $search,
                'post_type' => $postType,
                'status' => $status,
                'factory_id' => $factoryId,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Posts/Create', [
            'factories' => Factory::orderBy('name')->get(['id', 'code', 'name', 'area']),
            'users' => User::orderBy('name')->get(['id', 'name', 'phone', 'role', 'factory_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'factory_id' => ['nullable', 'integer', 'exists:factories,id'],
            'post_type' => ['required', Rule::in(['work_offer', 'machine_available'])],
            'title' => ['required', 'string', 'max:255'],
            'fabric_type' => ['required', 'string', 'max:255'],
            'gsm' => ['nullable', 'string', 'max:30'],
            'dia' => ['nullable', 'integer', 'min:1', 'max:120'],
            'gauge' => ['nullable', 'integer', 'min:1', 'max:60'],
            'quantity_kg' => ['required', 'numeric', 'min:0'],
            'target_rate_tk' => ['nullable', 'numeric', 'min:0'],
            'yarn_count' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'delivery_deadline' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'string', Rule::in(['open', 'closed', 'awarded', 'cancelled'])],
            'notify_matches' => ['boolean'],
        ]);

        $post = SubcontractPost::create([
            'user_id' => $validated['user_id'] ?? $request->user()?->id,
            'factory_id' => $validated['factory_id'] ?? null,
            'post_type' => $validated['post_type'],
            'title' => $validated['title'],
            'fabric_type' => $validated['fabric_type'],
            'gsm' => $validated['gsm'] ?? null,
            'dia' => $validated['dia'] ?? null,
            'gauge' => $validated['gauge'] ?? null,
            'quantity_kg' => $validated['quantity_kg'],
            'target_rate_tk' => $validated['target_rate_tk'] ?? null,
            'yarn_count' => $validated['yarn_count'] ?? null,
            'location' => $validated['location'] ?? null,
            'delivery_deadline' => $validated['delivery_deadline'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        $notified = 0;
        if ($request->boolean('notify_matches') && $post->post_type === 'work_offer') {
            $notified = $this->matchService->notifyMatchingFactories($post);
        }

        $msg = $notified > 0
            ? "Subcontract post published and {$notified} matching factory contacts notified."
            : 'Subcontract post created successfully.';

        return redirect()->route('admin.posts.show', $post->id)->with('success', $msg);
    }

    public function show(int $id): Response
    {
        $post = SubcontractPost::query()
            ->with([
                'user:id,name,phone,email,role',
                'factory:id,code,name,area,phone',
                'quotations' => fn ($q) => $q->with('factory:id,code,name,area')->latest('id'),
            ])
            ->findOrFail($id);

        $matches = $post->post_type === 'work_offer'
            ? $this->matchService->findMatchingFactories($post)
                ->take(8)
                ->map(fn (array $item): array => [
                    'factory_id' => $item['factory']->id,
                    'factory_code' => $item['factory']->code,
                    'factory_name' => $item['factory']->name,
                    'factory_area' => $item['factory']->area,
                    'score' => $item['score'],
                    'match_reason' => $item['match_reason'],
                ])
                ->values()
            : [];

        return Inertia::render('Admin/Posts/Show', [
            'post' => $post,
            'matches' => $matches,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $post = SubcontractPost::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['open', 'closed', 'awarded', 'cancelled'])],
        ]);

        $post->update(['status' => $validated['status']]);

        return back()->with('success', "Post status updated to {$validated['status']}.");
    }

    public function updateQuotationStatus(Request $request, int $postId, int $quotationId): RedirectResponse
    {
        $quotation = Quotation::query()
            ->where('subcontract_post_id', $postId)
            ->findOrFail($quotationId);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'accepted', 'rejected'])],
        ]);

        $quotation->update(['status' => $validated['status']]);

        if ($validated['status'] === 'accepted') {
            SubcontractPost::where('id', $postId)->update(['status' => 'awarded']);
        }

        return back()->with('success', "Quotation status set to {$validated['status']}.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $post = SubcontractPost::findOrFail($id);
        $title = $post->title;
        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', "Post \"{$title}\" deleted.");
    }
}
