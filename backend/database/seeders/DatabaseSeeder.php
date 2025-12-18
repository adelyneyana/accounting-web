<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TaxEntry;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'taxpayer_type' => 'individual',
        ]);

        // Create default tax entries for the user
        $entries = [
            ['label' => 'Sales', 'value' => 500000],
            ['label' => 'VAT Expense', 'value' => 50000],
            ['label' => 'Other Expense', 'value' => 100000],
            ['label' => 'Asset Purchase', 'value' => 0],
        ];

        foreach ($entries as $entry) {
            TaxEntry::create([
                'user_id' => $user->id,
                'label' => $entry['label'],
                'value' => $entry['value'],
                'meta' => ['editable' => true],
            ]);
        }
    }
}
