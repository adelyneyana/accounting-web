<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaxEntry;

class TaxController extends Controller
{
    /**
     * Get all tax entries for the authenticated user
     */
    public function index(Request $r)
    {
        // If request has an authenticated user, return their entries.
        if ($r->user()) {
            // Get taxpayer type from request, default to individual
            $type = $r->query('type', 'individual');
            
            $entries = $r->user()->taxEntries()
                ->where('taxpayer_type', $type)
                ->orderBy('id')
                ->get();

            // If user has no entries yet for this type, create default structure with 0 values
            if ($entries->isEmpty()) {
                $defaultLabels = ['Sales', 'VAT Input', 'Other Expense', 'Asset', 'Asset Purchase'];
                foreach ($defaultLabels as $label) {
                    $entry = $r->user()->taxEntries()->create([
                        'taxpayer_type' => $type,
                        'label' => $label,
                        'value' => 0,
                    ]);
                    $entries->push($entry);
                }
            }

            $entriesData = $entries->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'label' => $entry->label,
                    'value' => (float) $entry->value,
                    'taxpayer_type' => $entry->taxpayer_type,
                ];
            });

            return response()->json([
                'type' => $type,
                'entries' => $entriesData,
            ]);
        }

        // Not authenticated: return demo entries with 0 values
        $demo = [
            ['id' => 1, 'label' => 'Sales', 'value' => 0],
            ['id' => 2, 'label' => 'VAT Input', 'value' => 0],
            ['id' => 3, 'label' => 'Other Expense', 'value' => 0],
            ['id' => 4, 'label' => 'Asset', 'value' => 0],
            ['id' => 5, 'label' => 'Asset Purchase', 'value' => 0],
        ];

        return response()->json([
            'type' => 'individual',
            'entries' => $demo,
        ]);
    }

    /**
     * Create a new tax entry
     */
    public function store(Request $r)
    {
        $data = $r->validate([
            'label' => 'required|string',
            'value' => 'required|numeric',
            'meta' => 'nullable|array'
        ]);

        $entry = $r->user()->taxEntries()->create($data);

        return response()->json([
            'id' => $entry->id,
            'label' => $entry->label,
            'value' => (float) $entry->value,
        ], 201);
    }

    /**
     * Update a tax entry value
     */
    public function update(Request $r, TaxEntry $taxEntry)
    {
        if ($taxEntry->user_id !== $r->user()->id) {
            abort(403);
        }

        $data = $r->validate([
            'value' => 'required|numeric',
            'label' => 'nullable|string',
            'meta' => 'nullable|array'
        ]);

        $taxEntry->update($data);
        
        // Force a fresh fetch to confirm save
        $taxEntry->refresh();

        return response()->json([
            'id' => $taxEntry->id,
            'label' => $taxEntry->label,
            'value' => (float) $taxEntry->value,
            'message' => 'Updated successfully'
        ]);
    }

    /**
     * Save tax summary to user profile (called after all entries saved)
     */
    public function saveSummary(Request $r)
    {
        $data = $r->validate([
            'taxableIncome' => 'required|numeric',
            'taxDue' => 'required|numeric',
            'rateApplied' => 'required|numeric',
            'vatOutput' => 'required|numeric',
            'vatInput' => 'required|numeric',
            'vatPayable' => 'required|numeric',
            'type' => 'required|in:individual,corporation',
            'updatedAt' => 'required|string',
        ]);

        $r->user()->update([
            'last_tax_summary' => $data
        ]);

        return response()->json([
            'message' => 'Tax summary saved successfully',
            'summary' => $data
        ]);
    }

    /**
     * Delete a tax entry
     */
    public function destroy(Request $r, TaxEntry $taxEntry)
    {
        if ($taxEntry->user_id !== $r->user()->id) {
            abort(403);
        }

        $taxEntry->delete();

        return response()->json(['message' => 'Tax entry deleted successfully']);
    }

    /**
     * Update user's taxpayer type (individual or corporation)
     */
    public function updateType(Request $r)
    {
        // taxpayer_type has been removed; keep endpoint for backward compatibility
        $r->validate([
            'type' => 'required|in:individual,corporation'
        ]);
        return response()->json([
            'type' => null,
            'message' => 'Taxpayer type is client-managed now (no-op)'
        ]);
    }
}