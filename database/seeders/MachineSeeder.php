<?php

namespace Database\Seeders;

use App\Models\Machine;
use App\Models\MachineType;
use App\Models\User;
use Illuminate\Database\Seeder;

class MachineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('account_type', 'admin')->first() ?? User::first();
        $adminId = $admin?->id;

        $types = MachineType::where('is_active', true)->pluck('id', 'name')->toArray();

        $sampleMachines = [
            [
                'name' => 'Fukuhara VX-4.2 Single Jersey 30" 28G',
                'type_keyword' => 'Single Jersey',
                'brand_or_model' => 'Fukuhara / Japan',
                'serial_number' => 'MC-KN-01',
                'cph' => 32.50,
                'unit' => 'Kg',
                'sort_order' => 1,
                'notes' => 'High speed 4-track single jersey circular knitting machine. 96 feeders.',
            ],
            [
                'name' => 'Mayer & Cie Relanit 3.2 II 30" 24G',
                'type_keyword' => 'Single Jersey',
                'brand_or_model' => 'Mayer & Cie / Germany',
                'serial_number' => 'MC-KN-02',
                'cph' => 30.00,
                'unit' => 'Kg',
                'sort_order' => 2,
                'notes' => 'Relative movement technology for elastomer cotton and viscose.',
            ],
            [
                'name' => 'Terrot I3P 154 Interlock / Rib 34" 28G',
                'type_keyword' => 'Rib / Interlock',
                'brand_or_model' => 'Terrot / Germany',
                'serial_number' => 'MC-KN-03',
                'cph' => 28.00,
                'unit' => 'Kg',
                'sort_order' => 3,
                'notes' => 'Heavy duty double jersey 8-lock interlock machine.',
            ],
            [
                'name' => 'Pai Lung PL-KF3B 3-End Fleece 30" 20G',
                'type_keyword' => 'Fleece',
                'brand_or_model' => 'Pai Lung / Taiwan',
                'serial_number' => 'MC-KN-04',
                'cph' => 26.50,
                'unit' => 'Kg',
                'sort_order' => 4,
                'notes' => 'Polar and diagonal 3-thread fleece knitting.',
            ],
            [
                'name' => 'Shima Seiki SSR 112 SV 14G Flatbed',
                'type_keyword' => 'Collar & Cuff',
                'brand_or_model' => 'Shima Seiki / Japan',
                'serial_number' => 'MC-KN-05',
                'cph' => 45.00,
                'unit' => 'Pcs',
                'sort_order' => 5,
                'notes' => 'Digital stitch control system (DSCS) for polo collars and cuffs.',
            ],
        ];

        foreach ($sampleMachines as $m) {
            // Find appropriate machine type
            $typeId = null;
            foreach ($types as $typeName => $id) {
                if (stripos($typeName, $m['type_keyword']) !== false) {
                    $typeId = $id;
                    break;
                }
            }

            if (! $typeId && ! empty($types)) {
                $typeId = reset($types);
            }

            if ($typeId) {
                Machine::firstOrCreate(
                    ['serial_number' => $m['serial_number']],
                    [
                        'name' => $m['name'],
                        'machine_type_id' => $typeId,
                        'brand_or_model' => $m['brand_or_model'],
                        'cph' => $m['cph'],
                        'unit' => $m['unit'],
                        'sort_order' => $m['sort_order'],
                        'is_active' => true,
                        'created_by_id' => $adminId,
                        'notes' => $m['notes'],
                    ]
                );
            }
        }
    }
}
