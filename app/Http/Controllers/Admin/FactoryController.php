<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\MachineType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FactoryController extends Controller
{
    /**
     * Common industrial districts in Bangladesh.
     */
    public const DISTRICTS = [
        'Gazipur',
        'Ashulia',
        'Savar',
        'Tongi',
        'Narayanganj',
        'Dhaka',
        'Chittagong',
        'Tangail',
        'Mymensingh',
        'Cumilla',
        'Narsingdi',
        'Bhaluka',
        'Manikganj',
        'Munshiganj',
        'Habiganj',
        'Other',
    ];

    /**
     * Common industry types in textile & apparel manufacturing.
     */
    public const INDUSTRY_TYPES = [
        'Apparel & Garments',
        'Knitwear & Composite',
        'Woven Manufacturing',
        'Dyeing & Finishing Mill',
        'Denim & Washing Plant',
        'Yarn Spinning Mill',
        'Printing & Embroidery Unit',
        'Packaging & Accessories',
        'Textile Mill',
        'Leather & Footwear',
    ];

    /**
     * Default list of factory capabilities.
     */
    public const COMMON_CAPABILITIES = [
        'Circular Knitting',
        'Flatbed Knitting',
        'Fabric Dyeing',
        'Yarn Dyeing',
        'Sewing Production',
        'Garment Washing',
        'Enzyme / Stone Wash',
        'Screen Printing',
        'All-Over Printing (AOP)',
        'Computerized Embroidery',
        'Heat Transfer Printing',
        'Laser Cutting',
        'Finishing & Packing',
        'Needle Detection & QC Lab',
        'BSCI / Sedex Compliant',
        'OEKO-TEX Certified',
        'GOTS / Organic Certified',
        'RCS / GRS Recycled Certified',
    ];

    /**
     * Display dedicated queue of pending factory verifications only.
     */
    public function pendingVerifications(Request $request): Response
    {
        $search = $request->input('search', '');
        $district = $request->input('district', 'all');

        $query = User::with('factory')
            ->where('account_type', 'factory')
            ->where('status', 'pending');

        // Apply search
        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('customer_id', 'like', $term)
                    ->orWhereHas('factory', function ($fq) use ($term) {
                        $fq->where('business_name', 'like', $term)
                            ->orWhere('district', 'like', $term)
                            ->orWhere('contact_person', 'like', $term);
                    });
            });
        }

        // Apply district filter
        if (! empty($district) && $district !== 'all') {
            $query->whereHas('factory', function ($fq) use ($district) {
                $fq->where('district', $district);
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 15;
        }

        $factories = $query->latest()->paginate($perPage)->withQueryString();

        $districts = Factory::select('district')
            ->whereNotNull('district')
            ->distinct()
            ->pluck('district');

        return Inertia::render('Admin/Factories/Pending', [
            'factories' => $factories,
            'filters' => [
                'search' => $search,
                'district' => $district,
                'per_page' => $perPage,
            ],
            'districts' => $districts,
            'pendingCount' => $factories->total(),
        ]);
    }

    /**
     * Display list of factories filtered by tab & search query.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'all');
        $search = $request->input('search', '');
        $district = $request->input('district', 'all');

        $query = User::with('factory')
            ->where('account_type', 'factory');

        // Apply tab status filter
        if ($tab === 'pending') {
            $query->where('status', 'pending');
        } elseif ($tab === 'active') {
            $query->where('status', 'active');
        } elseif ($tab === 'suspended') {
            $query->where('status', 'suspended');
        }

        // Apply search
        if (! empty($search)) {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('customer_id', 'like', $term)
                    ->orWhereHas('factory', function ($fq) use ($term) {
                        $fq->where('business_name', 'like', $term)
                            ->orWhere('district', 'like', $term);
                    });
            });
        }

        // Apply district filter
        if (! empty($district) && $district !== 'all') {
            $query->whereHas('factory', function ($fq) use ($district) {
                $fq->where('district', $district);
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 15;
        }

        $factories = $query->latest()->paginate($perPage)->withQueryString();

        $counts = [
            'pending' => User::where('account_type', 'factory')->where('status', 'pending')->count(),
            'active' => User::where('account_type', 'factory')->where('status', 'active')->count(),
            'suspended' => User::where('account_type', 'factory')->where('status', 'suspended')->count(),
            'all' => User::where('account_type', 'factory')->count(),
        ];

        $districts = Factory::select('district')
            ->whereNotNull('district')
            ->distinct()
            ->pluck('district');

        return Inertia::render('Admin/Factories/Index', [
            'factories' => $factories,
            'counts' => $counts,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'district' => $district,
                'per_page' => $perPage,
            ],
            'districts' => $districts,
        ]);
    }

    /**
     * Show the factory creation form.
     */
    public function create(): Response
    {
        $machineTypes = MachineType::query()
            ->active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Admin/Factories/Create', [
            'machineTypes' => $machineTypes,
            'knittingTypes' => $knittingTypes,
            'districts' => self::DISTRICTS,
            'industryTypes' => self::INDUSTRY_TYPES,
            'commonCapabilities' => self::COMMON_CAPABILITIES,
            'suggestedCustomerId' => User::generateUniqueCustomerId('S'),
        ]);
    }

    /**
     * Store a newly created factory and owner account.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Owner Account Fields
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'customer_id' => ['nullable', 'string', 'max:30', 'unique:users,customer_id'],
            'nid_number' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,pending,suspended'],
            'is_subscribed' => ['boolean'],

            // Factory Details Fields
            'business_name' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
            'industry_type' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'factory_phone' => ['nullable', 'string', 'max:50'],
            'factory_email' => ['nullable', 'email', 'max:255'],
            'district' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'total_lines' => ['nullable', 'integer', 'min:0'],
            'total_machines' => ['nullable', 'integer', 'min:0'],
            'daily_capacity' => ['nullable', 'string', 'max:100'],
            'rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'is_verified' => ['boolean'],
            'capabilities' => ['nullable', 'array'],
            'capabilities.*' => ['string', 'max:100'],
            'knitting_types' => ['nullable', 'array'],
            'knitting_types.*' => ['integer'],
            'production_capacities' => ['nullable', 'array'],

            // Legal & Documents
            'trade_license_no' => ['nullable', 'string', 'max:100'],
            'tin_no' => ['nullable', 'string', 'max:100'],
            'bin_no' => ['nullable', 'string', 'max:100'],
            'trade_license_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'tin_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'bin_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nid_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $customerId = ! empty($validated['customer_id'])
            ? trim($validated['customer_id'])
            : User::generateUniqueCustomerId('S');

        $rawPassword = ! empty($validated['password'])
            ? $validated['password']
            : 'Shilpo@2026';

        // Auto-aggregate capacity metrics if production_capacities is supplied
        $totalLines = isset($validated['total_lines']) ? (int) $validated['total_lines'] : 0;
        $totalMachines = isset($validated['total_machines']) ? (int) $validated['total_machines'] : 0;
        $dailyCapacity = $validated['daily_capacity'] ?? null;

        if (isset($validated['production_capacities']) && is_array($validated['production_capacities'])) {
            $capacities = $validated['production_capacities'];

            if (isset($capacities['sewing']) && is_array($capacities['sewing'])) {
                $sewingLines = (int) ($capacities['sewing']['no_of_lines'] ?? 0);
                if ($sewingLines > 0 && $totalLines === 0) {
                    $totalLines = $sewingLines;
                }
                $sewingDaily = (float) ($capacities['sewing']['total_capacity_per_day'] ?? 0);
                $sewingUnit = $capacities['sewing']['unit'] ?? 'Pcs';
                if ($sewingDaily > 0 && empty($dailyCapacity)) {
                    $dailyCapacity = number_format($sewingDaily).' '.$sewingUnit.'/Day';
                }
            }

            // Sum non-sewing machines
            $calcMachines = 0;
            foreach (['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'] as $dept) {
                if (isset($capacities[$dept]) && is_array($capacities[$dept])) {
                    foreach ($capacities[$dept] as $row) {
                        $calcMachines += (int) ($row['no_of_machine'] ?? 0);
                    }
                }
            }
            if ($calcMachines > 0 && $totalMachines === 0) {
                $totalMachines = $calcMachines;
            }
        }

        // Upload Factory Logo if present
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('factory_logos', 'public');
            $frontendStorage = base_path('../shilposetu/storage/app/public/factory_logos');
            if (is_dir(dirname($frontendStorage))) {
                @mkdir($frontendStorage, 0755, true);
                @copy(storage_path('app/public/'.$logoPath), $frontendStorage.'/'.basename($logoPath));
            }
        }

        // Upload KYC Document files if present
        $uploadedDocs = [];
        foreach (['trade_license_file', 'tin_file', 'bin_file', 'nid_file'] as $docKey) {
            if ($request->hasFile($docKey)) {
                $uploadedDocs[$docKey] = $request->file($docKey)->store('factory_docs', 'public');
            }
        }

        DB::transaction(function () use (
            $validated,
            $customerId,
            $rawPassword,
            $totalLines,
            $totalMachines,
            $dailyCapacity,
            $logoPath,
            $uploadedDocs,
            &$user
        ) {
            $user = User::create([
                'customer_id' => $customerId,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'password' => Hash::make($rawPassword),
                'account_type' => 'factory',
                'status' => $validated['status'],
                'nid_number' => $validated['nid_number'] ?? null,
                'is_subscribed' => (bool) ($validated['is_subscribed'] ?? true),
                'phone_verified_at' => now(),
                'email_verified_at' => now(),
            ]);

            $factory = Factory::create([
                'user_id' => $user->id,
                'business_name' => $validated['business_name'],
                'logo' => $logoPath,
                'industry_type' => 'Knitting',
                'contact_person' => $validated['contact_person'] ?? $validated['name'],
                'phone' => $validated['factory_phone'] ?? $validated['phone'],
                'email' => $validated['factory_email'] ?? $validated['email'],
                'district' => $validated['district'] ?? 'Gazipur',
                'address' => $validated['address'] ?? null,
                'total_lines' => $totalLines,
                'total_machines' => $totalMachines,
                'daily_capacity' => $dailyCapacity,
                'rating' => $validated['rating'] ?? 5.0,
                'is_verified' => (bool) ($validated['is_verified'] ?? ($validated['status'] === 'active')),
                'capabilities' => $validated['capabilities'] ?? [],
                'production_capacities' => $validated['production_capacities'] ?? null,
                'trade_license_no' => $validated['trade_license_no'] ?? null,
                'trade_license_file' => $uploadedDocs['trade_license_file'] ?? null,
                'tin_no' => $validated['tin_no'] ?? null,
                'tin_file' => $uploadedDocs['tin_file'] ?? null,
                'bin_no' => $validated['bin_no'] ?? null,
                'bin_file' => $uploadedDocs['bin_file'] ?? null,
                'nid_file' => $uploadedDocs['nid_file'] ?? null,
            ]);

            if (! empty($validated['knitting_types'])) {
                $factory->knittingTypes()->sync($validated['knitting_types']);
            }
        });

        return redirect()->route('admin.factories.show', $user->id)
            ->with('success', "Factory '{$validated['business_name']}' created successfully (Customer ID: {$customerId}). Default password: {$rawPassword}");
    }

    /**
     * Show the bulk import page.
     */
    public function importView(): Response
    {
        return Inertia::render('Admin/Factories/Import', [
            'districts' => self::DISTRICTS,
            'industryTypes' => self::INDUSTRY_TYPES,
        ]);
    }

    /**
     * Download sample CSV template for bulk inserting factories.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="factories_bulk_import_template.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Column Header
            fputcsv($handle, [
                'business_name',
                'owner_name',
                'phone',
                'email',
                'district',
                'address',
                'industry_type',
                'contact_person',
                'total_lines',
                'total_machines',
                'daily_capacity',
                'trade_license_no',
                'tin_no',
                'bin_no',
                'capabilities',
                'password',
                'status',
                'is_verified',
            ]);

            // Sample Demo Rows
            $sampleRows = [
                [
                    'Apex Textile & Garments Ltd',
                    'Mohammad Rahman',
                    '01711000001',
                    'apex.garments@example.com',
                    'Gazipur',
                    'Plot 12-14, Konabari Industrial Area, Gazipur',
                    'Knitwear & Composite',
                    'Tanvir Hossain',
                    '28',
                    '450',
                    '20,000 Pcs/Day',
                    'TRAD/GZP/2026/8941',
                    '481928374619',
                    '001829304-0101',
                    'Circular Knitting | Sewing Production | Fabric Dyeing | Screen Printing',
                    'Shilpo@2026',
                    'active',
                    '1',
                ],
                [
                    'Ha-Meem Apparel Unit 3',
                    'Abdul Karim',
                    '01811000002',
                    'hameem.unit3@example.com',
                    'Ashulia',
                    'Nischintapur, Ashulia, Savar, Dhaka',
                    'Woven Manufacturing',
                    'Farhan Chowdhury',
                    '34',
                    '520',
                    '25,000 Pcs/Day',
                    'TRAD/DH/2026/1029',
                    '918273645102',
                    '002938475-0102',
                    'Sewing Production | Garment Washing | Enzyme / Stone Wash | Finishing & Packing',
                    'Shilpo@2026',
                    'active',
                    '1',
                ],
                [
                    'Standard Composite Mill',
                    'Rafiqul Islam',
                    '01911000003',
                    'standard.composite@example.com',
                    'Narayanganj',
                    'Kanchpur, Sonargaon, Narayanganj',
                    'Apparel & Garments',
                    'Rafiqul Islam',
                    '16',
                    '280',
                    '12,000 Pcs/Day',
                    'TRAD/NRG/2026/4521',
                    '746281930281',
                    '003847291-0103',
                    'Circular Knitting | Yarn Dyeing | Sewing Production | Computerized Embroidery',
                    'Shilpo@2026',
                    'pending',
                    '0',
                ],
            ];

            foreach ($sampleRows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Process bulk uploaded file and insert factories.
     */
    public function importStore(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'default_status' => ['nullable', 'in:active,pending'],
            'default_verified' => ['nullable', 'boolean'],
            'default_password' => ['nullable', 'string', 'min:6'],
            'skip_duplicates' => ['nullable', 'boolean'],
        ]);

        $defaultStatus = $request->input('default_status', 'active');
        $defaultVerified = $request->boolean('default_verified', true);
        $defaultPassword = $request->input('default_password') ?: 'Shilpo@2026';
        $skipDuplicates = $request->boolean('skip_duplicates', true);

        $uploadedFile = $request->file('file');
        $filePath = $uploadedFile->getRealPath();

        $fileHandle = fopen($filePath, 'r');
        if (! $fileHandle) {
            return back()->with('error', 'Unable to open and read the uploaded CSV file.');
        }

        // Detect delimiter (comma or semicolon)
        $firstLine = fgets($fileHandle);
        rewind($fileHandle);

        $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

        // Read and normalize headers
        $rawHeaders = fgetcsv($fileHandle, 0, $delimiter);
        if (! $rawHeaders) {
            fclose($fileHandle);

            return back()->with('error', 'The uploaded file appears to be empty or has invalid formatting.');
        }

        // Clean UTF-8 BOM from the first header element if present
        $rawHeaders[0] = preg_replace('/^\xEF\xBB\xBF/', '', $rawHeaders[0]);

        // Map column names to standard keys
        $headerMap = [];
        foreach ($rawHeaders as $index => $header) {
            $cleanKey = strtolower(trim($header));
            $cleanKey = str_replace([' ', '-', '.'], '_', $cleanKey);

            // Aliases mapping
            if (in_array($cleanKey, ['business_name', 'factory_name', 'company_name', 'factory'])) {
                $headerMap['business_name'] = $index;
            } elseif (in_array($cleanKey, ['owner_name', 'owner', 'name', 'contact_name', 'user_name'])) {
                $headerMap['owner_name'] = $index;
            } elseif (in_array($cleanKey, ['phone', 'mobile', 'phone_number', 'contact_phone', 'mobile_no'])) {
                $headerMap['phone'] = $index;
            } elseif (in_array($cleanKey, ['email', 'email_address', 'e_mail'])) {
                $headerMap['email'] = $index;
            } elseif (in_array($cleanKey, ['district', 'city', 'location', 'region'])) {
                $headerMap['district'] = $index;
            } elseif (in_array($cleanKey, ['address', 'factory_address', 'location_address'])) {
                $headerMap['address'] = $index;
            } elseif (in_array($cleanKey, ['industry_type', 'industry', 'type'])) {
                $headerMap['industry_type'] = $index;
            } elseif (in_array($cleanKey, ['contact_person', 'manager', 'person'])) {
                $headerMap['contact_person'] = $index;
            } elseif (in_array($cleanKey, ['total_lines', 'lines', 'sewing_lines'])) {
                $headerMap['total_lines'] = $index;
            } elseif (in_array($cleanKey, ['total_machines', 'machines'])) {
                $headerMap['total_machines'] = $index;
            } elseif (in_array($cleanKey, ['daily_capacity', 'capacity'])) {
                $headerMap['daily_capacity'] = $index;
            } elseif (in_array($cleanKey, ['trade_license_no', 'trade_license', 'trade_no'])) {
                $headerMap['trade_license_no'] = $index;
            } elseif (in_array($cleanKey, ['tin_no', 'tin'])) {
                $headerMap['tin_no'] = $index;
            } elseif (in_array($cleanKey, ['bin_no', 'bin', 'vat_no'])) {
                $headerMap['bin_no'] = $index;
            } elseif (in_array($cleanKey, ['capabilities', 'capability', 'services'])) {
                $headerMap['capabilities'] = $index;
            } elseif (in_array($cleanKey, ['password', 'pass'])) {
                $headerMap['password'] = $index;
            } elseif (in_array($cleanKey, ['status', 'account_status'])) {
                $headerMap['status'] = $index;
            } elseif (in_array($cleanKey, ['is_verified', 'verified'])) {
                $headerMap['is_verified'] = $index;
            }
        }

        if (! isset($headerMap['business_name'])) {
            fclose($fileHandle);

            return back()->with('error', "CSV file must contain a 'business_name' or 'factory_name' column header.");
        }

        $importedCount = 0;
        $skippedRows = [];
        $rowNumber = 1; // Header was row 1
        $processedPhones = [];
        $processedEmails = [];

        while (($row = fgetcsv($fileHandle, 0, $delimiter)) !== false) {
            $rowNumber++;

            // Skip empty rows
            if (empty(array_filter($row, fn ($val) => trim($val) !== ''))) {
                continue;
            }

            $businessName = isset($headerMap['business_name']) ? trim($row[$headerMap['business_name']] ?? '') : '';
            if (empty($businessName)) {
                $skippedRows[] = "Row {$rowNumber}: Business/Factory name is missing.";

                continue;
            }

            $rawPhone = isset($headerMap['phone']) ? trim($row[$headerMap['phone']] ?? '') : '';
            // Sanitize phone
            $cleanPhone = preg_replace('/[^0-9+]/', '', $rawPhone);
            if (empty($cleanPhone)) {
                $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): Phone number is missing or invalid.";

                continue;
            }

            // Check duplicate in same CSV
            if (in_array($cleanPhone, $processedPhones)) {
                $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): Phone {$cleanPhone} is duplicated inside this CSV file.";

                continue;
            }

            // Check if phone already registered in database
            if (User::where('phone', $cleanPhone)->exists()) {
                if ($skipDuplicates) {
                    $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): Phone {$cleanPhone} already exists in database (skipped).";

                    continue;
                } else {
                    fclose($fileHandle);

                    return back()->with('error', "Import aborted at row {$rowNumber}: Phone {$cleanPhone} is already registered.");
                }
            }

            // Process email
            $rawEmail = isset($headerMap['email']) ? trim($row[$headerMap['email']] ?? '') : '';
            if (empty($rawEmail) || ! filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
                // Generate a reliable internal fallback email using clean phone
                $safePhone = ltrim($cleanPhone, '+');
                $rawEmail = "factory_{$safePhone}@silposetu.internal";
            }

            // Check duplicate email
            if (in_array($rawEmail, $processedEmails)) {
                $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): Email {$rawEmail} is duplicated in this file.";

                continue;
            }

            if (User::where('email', $rawEmail)->exists()) {
                if ($skipDuplicates) {
                    $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): Email {$rawEmail} already exists in database (skipped).";

                    continue;
                } else {
                    fclose($fileHandle);

                    return back()->with('error', "Import aborted at row {$rowNumber}: Email {$rawEmail} is already registered.");
                }
            }

            $ownerName = isset($headerMap['owner_name']) ? trim($row[$headerMap['owner_name']] ?? '') : '';
            if (empty($ownerName)) {
                $ownerName = $businessName.' Owner';
            }

            $contactPerson = isset($headerMap['contact_person']) ? trim($row[$headerMap['contact_person']] ?? '') : '';
            if (empty($contactPerson)) {
                $contactPerson = $ownerName;
            }

            $district = isset($headerMap['district']) ? trim($row[$headerMap['district']] ?? '') : '';
            if (empty($district)) {
                $district = 'Gazipur';
            }

            $address = isset($headerMap['address']) ? trim($row[$headerMap['address']] ?? '') : null;
            $industryType = isset($headerMap['industry_type']) ? trim($row[$headerMap['industry_type']] ?? '') : 'Apparel & Garments';
            $totalLines = isset($headerMap['total_lines']) ? (int) trim($row[$headerMap['total_lines']] ?? 0) : 0;
            $totalMachines = isset($headerMap['total_machines']) ? (int) trim($row[$headerMap['total_machines']] ?? 0) : 0;
            $dailyCapacity = isset($headerMap['daily_capacity']) ? trim($row[$headerMap['daily_capacity']] ?? '') : null;
            $tradeLicenseNo = isset($headerMap['trade_license_no']) ? trim($row[$headerMap['trade_license_no']] ?? '') : null;
            $tinNo = isset($headerMap['tin_no']) ? trim($row[$headerMap['tin_no']] ?? '') : null;
            $binNo = isset($headerMap['bin_no']) ? trim($row[$headerMap['bin_no']] ?? '') : null;

            // Capabilities parsing (split by | or comma)
            $capabilitiesStr = isset($headerMap['capabilities']) ? trim($row[$headerMap['capabilities']] ?? '') : '';
            $capabilities = [];
            if (! empty($capabilitiesStr)) {
                $separator = str_contains($capabilitiesStr, '|') ? '|' : ',';
                $capabilities = array_values(array_filter(array_map('trim', explode($separator, $capabilitiesStr))));
            }

            // Status and verified
            $rowStatus = isset($headerMap['status']) ? strtolower(trim($row[$headerMap['status']] ?? '')) : '';
            $status = in_array($rowStatus, ['active', 'pending', 'suspended']) ? $rowStatus : $defaultStatus;

            $rowVerified = isset($headerMap['is_verified']) ? trim($row[$headerMap['is_verified']] ?? '') : '';
            if ($rowVerified !== '') {
                $isVerified = in_array(strtolower($rowVerified), ['1', 'true', 'yes', 'verified']);
            } else {
                $isVerified = $defaultVerified;
            }

            $rowPassword = isset($headerMap['password']) ? trim($row[$headerMap['password']] ?? '') : '';
            $password = ! empty($rowPassword) ? $rowPassword : $defaultPassword;

            // Generate unique customer ID
            $customerId = User::generateUniqueCustomerId('S');

            try {
                DB::transaction(function () use (
                    $customerId,
                    $ownerName,
                    $cleanPhone,
                    $rawEmail,
                    $password,
                    $status,
                    $businessName,
                    $industryType,
                    $contactPerson,
                    $district,
                    $address,
                    $totalLines,
                    $totalMachines,
                    $dailyCapacity,
                    $isVerified,
                    $capabilities,
                    $tradeLicenseNo,
                    $tinNo,
                    $binNo
                ) {
                    $user = User::create([
                        'customer_id' => $customerId,
                        'name' => $ownerName,
                        'phone' => $cleanPhone,
                        'email' => $rawEmail,
                        'password' => Hash::make($password),
                        'account_type' => 'factory',
                        'status' => $status,
                        'is_subscribed' => true,
                        'phone_verified_at' => now(),
                        'email_verified_at' => now(),
                    ]);

                    Factory::create([
                        'user_id' => $user->id,
                        'business_name' => $businessName,
                        'industry_type' => $industryType,
                        'contact_person' => $contactPerson,
                        'phone' => $cleanPhone,
                        'email' => $rawEmail,
                        'district' => $district,
                        'address' => $address,
                        'total_lines' => $totalLines,
                        'total_machines' => $totalMachines,
                        'daily_capacity' => $dailyCapacity,
                        'rating' => 5.0,
                        'is_verified' => $isVerified,
                        'capabilities' => $capabilities,
                        'trade_license_no' => $tradeLicenseNo,
                        'tin_no' => $tinNo,
                        'bin_no' => $binNo,
                    ]);
                });

                $processedPhones[] = $cleanPhone;
                $processedEmails[] = $rawEmail;
                $importedCount++;
            } catch (\Throwable $e) {
                Log::error("Bulk import failed on row {$rowNumber}: ".$e->getMessage());
                $skippedRows[] = "Row {$rowNumber} ('{$businessName}'): System error during database insert ({$e->getMessage()})";
            }
        }

        fclose($fileHandle);

        $report = [
            'imported' => $importedCount,
            'skipped' => count($skippedRows),
            'errors' => $skippedRows,
        ];

        session()->flash('importReport', $report);

        if ($importedCount > 0) {
            $msg = "Successfully imported {$importedCount} factories into the system.";
            if (count($skippedRows) > 0) {
                $msg .= ' '.count($skippedRows).' rows were skipped.';
            }

            return redirect()->route('admin.factories.index')->with('success', $msg);
        } else {
            return back()->with('error', 'No factories could be imported. Please review the errors below.');
        }
    }

    /**
     * Show full factory KYC profile & details for admin review.
     */
    public function show(int $id): Response
    {
        $user = User::with([
            'factory.knittingTypes',
            'subcontractPosts' => fn ($q) => $q->latest()->take(5),
            'quotations' => fn ($q) => $q->latest()->take(5),
        ])->findOrFail($id);

        return Inertia::render('Admin/Factories/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the factory edit form.
     */
    public function edit(int $id): Response
    {
        $user = User::with('factory.knittingTypes')->findOrFail($id);

        $machineTypes = MachineType::query()
            ->active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Admin/Factories/Edit', [
            'user' => $user,
            'machineTypes' => $machineTypes,
            'knittingTypes' => $knittingTypes,
            'districts' => self::DISTRICTS,
            'industryTypes' => self::INDUSTRY_TYPES,
            'commonCapabilities' => self::COMMON_CAPABILITIES,
        ]);
    }

    /**
     * Update the specified factory and owner account.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::with('factory')->findOrFail($id);
        $factory = $user->factory;

        $validated = $request->validate([
            // Owner Account Fields
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone,'.$user->id],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:6'],
            'customer_id' => ['nullable', 'string', 'max:30', 'unique:users,customer_id,'.$user->id],
            'nid_number' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,pending,suspended'],
            'is_subscribed' => ['boolean'],

            // Factory Details Fields
            'business_name' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
            'industry_type' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'factory_phone' => ['nullable', 'string', 'max:50'],
            'factory_email' => ['nullable', 'email', 'max:255'],
            'district' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'total_lines' => ['nullable', 'integer', 'min:0'],
            'total_machines' => ['nullable', 'integer', 'min:0'],
            'daily_capacity' => ['nullable', 'string', 'max:100'],
            'rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'is_verified' => ['boolean'],
            'capabilities' => ['nullable', 'array'],
            'capabilities.*' => ['string', 'max:100'],
            'knitting_types' => ['nullable', 'array'],
            'knitting_types.*' => ['integer'],
            'production_capacities' => ['nullable', 'array'],

            // Legal & Documents
            'trade_license_no' => ['nullable', 'string', 'max:100'],
            'tin_no' => ['nullable', 'string', 'max:100'],
            'bin_no' => ['nullable', 'string', 'max:100'],
            'trade_license_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'tin_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'bin_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nid_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        // Auto-aggregate capacity metrics if production_capacities is supplied
        $totalLines = isset($validated['total_lines']) ? (int) $validated['total_lines'] : ($factory?->total_lines ?? 0);
        $totalMachines = isset($validated['total_machines']) ? (int) $validated['total_machines'] : ($factory?->total_machines ?? 0);
        $dailyCapacity = $validated['daily_capacity'] ?? ($factory?->daily_capacity ?? null);

        if (isset($validated['production_capacities']) && is_array($validated['production_capacities'])) {
            $capacities = $validated['production_capacities'];

            if (isset($capacities['sewing']) && is_array($capacities['sewing'])) {
                $sewingLines = (int) ($capacities['sewing']['no_of_lines'] ?? 0);
                if ($sewingLines > 0 && empty($validated['total_lines'])) {
                    $totalLines = $sewingLines;
                }
                $sewingDaily = (float) ($capacities['sewing']['total_capacity_per_day'] ?? 0);
                $sewingUnit = $capacities['sewing']['unit'] ?? 'Pcs';
                if ($sewingDaily > 0 && empty($validated['daily_capacity'])) {
                    $dailyCapacity = number_format($sewingDaily).' '.$sewingUnit.'/Day';
                }
            }

            // Sum non-sewing machines
            $calcMachines = 0;
            foreach (['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'] as $dept) {
                if (isset($capacities[$dept]) && is_array($capacities[$dept])) {
                    foreach ($capacities[$dept] as $row) {
                        $calcMachines += (int) ($row['no_of_machine'] ?? 0);
                    }
                }
            }
            if ($calcMachines > 0 && empty($validated['total_machines'])) {
                $totalMachines = $calcMachines;
            }
        }

        // Upload Factory Logo if present
        $logoPath = $factory?->logo;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('factory_logos', 'public');
            $frontendStorage = base_path('../shilposetu/storage/app/public/factory_logos');
            if (is_dir(dirname($frontendStorage))) {
                @mkdir($frontendStorage, 0755, true);
                @copy(storage_path('app/public/'.$logoPath), $frontendStorage.'/'.basename($logoPath));
            }
        }

        // Upload KYC Document files if present
        $uploadedDocs = [
            'trade_license_file' => $factory?->trade_license_file,
            'tin_file' => $factory?->tin_file,
            'bin_file' => $factory?->bin_file,
            'nid_file' => $factory?->nid_file,
        ];
        foreach (['trade_license_file', 'tin_file', 'bin_file', 'nid_file'] as $docKey) {
            if ($request->hasFile($docKey)) {
                $uploadedDocs[$docKey] = $request->file($docKey)->store('factory_docs', 'public');
            }
        }

        DB::transaction(function () use (
            $user,
            $factory,
            $validated,
            $totalLines,
            $totalMachines,
            $dailyCapacity,
            $logoPath,
            $uploadedDocs
        ) {
            $userUpdates = [
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'status' => $validated['status'],
                'nid_number' => $validated['nid_number'] ?? null,
                'is_subscribed' => (bool) ($validated['is_subscribed'] ?? true),
            ];

            if (! empty($validated['customer_id'])) {
                $userUpdates['customer_id'] = trim($validated['customer_id']);
            }

            if (! empty($validated['password'])) {
                $userUpdates['password'] = Hash::make($validated['password']);
            }

            $user->update($userUpdates);

            $factoryData = [
                'business_name' => $validated['business_name'],
                'logo' => $logoPath,
                'industry_type' => 'Knitting',
                'contact_person' => $validated['contact_person'] ?? $validated['name'],
                'phone' => $validated['factory_phone'] ?? $validated['phone'],
                'email' => $validated['factory_email'] ?? $validated['email'],
                'district' => $validated['district'] ?? 'Gazipur',
                'address' => $validated['address'] ?? null,
                'total_lines' => $totalLines,
                'total_machines' => $totalMachines,
                'daily_capacity' => $dailyCapacity,
                'rating' => $validated['rating'] ?? 5.0,
                'is_verified' => (bool) ($validated['is_verified'] ?? ($validated['status'] === 'active')),
                'capabilities' => $validated['capabilities'] ?? [],
                'production_capacities' => $validated['production_capacities'] ?? null,
                'trade_license_no' => $validated['trade_license_no'] ?? null,
                'trade_license_file' => $uploadedDocs['trade_license_file'],
                'tin_no' => $validated['tin_no'] ?? null,
                'tin_file' => $uploadedDocs['tin_file'],
                'bin_no' => $validated['bin_no'] ?? null,
                'bin_file' => $uploadedDocs['bin_file'],
                'nid_file' => $uploadedDocs['nid_file'],
            ];

            if ($factory) {
                $factory->update($factoryData);
                $targetFactory = $factory;
            } else {
                $factoryData['user_id'] = $user->id;
                $targetFactory = Factory::create($factoryData);
            }

            if ($targetFactory) {
                $targetFactory->knittingTypes()->sync($validated['knitting_types'] ?? []);
            }
        });

        return redirect()->route('admin.factories.show', $user->id)
            ->with('success', "Factory '{$validated['business_name']}' updated successfully.");
    }

    /**
     * Approve & activate factory account.
     */
    public function approve(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        if ($user->factory) {
            $user->factory->update(['is_verified' => true]);
        }

        return back()->with('success', "Factory '{$user->name}' has been successfully approved and verified.");
    }

    /**
     * Block/Suspend factory account.
     */
    public function block(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'suspended']);

        return back()->with('success', "Factory '{$user->name}' has been suspended.");
    }

    /**
     * Unblock factory account.
     */
    public function unblock(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        return back()->with('success', "Factory '{$user->name}' has been unblocked successfully.");
    }
}
