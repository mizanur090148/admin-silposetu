<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobListingController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $category = $request->input('category', 'all');
        $isNew = $request->input('is_new', 'all');
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $query = JobListing::query()
            ->withCount('applications')
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('role_title', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%");
                });
            })
            ->when($category !== 'all', function ($q) use ($category): void {
                $q->where('category', $category);
            })
            ->when($isNew !== 'all', function ($q) use ($isNew): void {
                $q->where('is_new', $isNew === '1');
            });

        $jobs = $query->latest('id')->paginate($perPage)->withQueryString();

        $counts = [
            'total' => JobListing::count(),
            'new_jobs' => JobListing::where('is_new', true)->count(),
            'total_vacancies' => (int) JobListing::sum('vacancies'),
            'total_applications' => JobApplication::count(),
        ];

        return Inertia::render('Admin/Jobs/Index', [
            'jobs' => $jobs,
            'counts' => $counts,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'is_new' => $isNew,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'role_title' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:20'],
            'shift_label' => ['nullable', 'string', 'max:255'],
            'experience_label' => ['nullable', 'string', 'max:255'],
            'salary_label' => ['required', 'string', 'max:255'],
            'posted_label' => ['required', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'is_new' => ['boolean'],
            'vacancies' => ['required', 'integer', 'min:1'],
            'requirements_text' => ['nullable', 'string', 'max:2000'],
        ]);

        JobListing::create([
            'role_title' => $validated['role_title'],
            'company_name' => $validated['company_name'],
            'area' => $validated['area'],
            'category' => $validated['category'],
            'shift_label' => $validated['shift_label'] ?? null,
            'experience_label' => $validated['experience_label'] ?? null,
            'salary_label' => $validated['salary_label'],
            'posted_label' => $validated['posted_label'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'is_new' => $request->boolean('is_new', true),
            'vacancies' => $validated['vacancies'],
            'requirements_json' => $this->parseRequirements($validated['requirements_text'] ?? null),
        ]);

        return back()->with('success', "Job listing \"{$validated['role_title']}\" created.");
    }

    public function show(int $id): Response
    {
        $job = JobListing::query()
            ->with(['applications' => fn ($q) => $q->latest('id')])
            ->findOrFail($id);

        return Inertia::render('Admin/Jobs/Show', [
            'job' => $job,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $job = JobListing::findOrFail($id);

        $validated = $request->validate([
            'role_title' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:20'],
            'shift_label' => ['nullable', 'string', 'max:255'],
            'experience_label' => ['nullable', 'string', 'max:255'],
            'salary_label' => ['required', 'string', 'max:255'],
            'posted_label' => ['required', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'is_new' => ['boolean'],
            'vacancies' => ['required', 'integer', 'min:1'],
            'requirements_text' => ['nullable', 'string', 'max:2000'],
        ]);

        $job->update([
            'role_title' => $validated['role_title'],
            'company_name' => $validated['company_name'],
            'area' => $validated['area'],
            'category' => $validated['category'],
            'shift_label' => $validated['shift_label'] ?? null,
            'experience_label' => $validated['experience_label'] ?? null,
            'salary_label' => $validated['salary_label'],
            'posted_label' => $validated['posted_label'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'is_new' => $request->boolean('is_new'),
            'vacancies' => $validated['vacancies'],
            'requirements_json' => $this->parseRequirements($validated['requirements_text'] ?? null),
        ]);

        return back()->with('success', "Job listing \"{$job->role_title}\" updated.");
    }

    public function toggleNew(int $id): RedirectResponse
    {
        $job = JobListing::findOrFail($id);
        $job->update(['is_new' => ! $job->is_new]);

        return back()->with('success', "Updated new badge for \"{$job->role_title}\".");
    }

    public function destroy(int $id): RedirectResponse
    {
        $job = JobListing::findOrFail($id);
        $title = $job->role_title;
        $job->delete();

        return redirect()->route('admin.jobs.index')->with('success', "Job listing \"{$title}\" deleted.");
    }

    public function destroyApplication(int $jobId, int $applicationId): RedirectResponse
    {
        $application = JobApplication::where('job_listing_id', $jobId)->findOrFail($applicationId);
        $application->delete();

        return back()->with('success', 'Job application deleted.');
    }

    /**
     * @return list<string>
     */
    private function parseRequirements(?string $text): array
    {
        return collect(preg_split('/\r\n|\r|\n/', (string) $text) ?: [])
            ->map(fn (string $line): string => trim($line))
            ->filter()
            ->values()
            ->all();
    }
}
