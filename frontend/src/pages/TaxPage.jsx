import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Slider({ entry, onChange }) {
  const handleInputChange = (e) => {
    const value = Math.max(0, Number(e.target.value) || 0);
    onChange(entry.id, value);
  };

  const increment = (amount) => {
    onChange(entry.id, entry.value + amount);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-indigo-500">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{entry.label}</h3>
          <div className="text-xs text-gray-500 mt-1">Current: ₱ {Number(entry.value).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <input
            type="number"
            value={entry.value}
            onChange={handleInputChange}
            className="w-32 px-3 py-2 border-2 border-gray-300 rounded font-semibold text-right focus:border-indigo-500 focus:outline-none"
            placeholder="0"
          />
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min={entry.meta?.min ?? 0}
          max={entry.meta?.max ?? 100000000}
          value={entry.value}
          onChange={e => onChange(entry.id, Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${(entry.value / (entry.meta?.max ?? 100000000)) * 100}%, #e5e7eb ${(entry.value / (entry.meta?.max ?? 100000000)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₱ 0</span>
          <span>₱ {Number(entry.meta?.max ?? 100000000).toLocaleString()}</span>
        </div>
      </div>

      {/* Quick Adjustment Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => increment(-100000)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded text-xs font-medium transition"
        >
          -₱100K
        </button>
        <button
          onClick={() => increment(-50000)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded text-xs font-medium transition"
        >
          -₱50K
        </button>
        <button
          onClick={() => increment(50000)}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 py-2 rounded text-xs font-medium text-indigo-600 transition"
        >
          +₱50K
        </button>
        <button
          onClick={() => increment(100000)}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 py-2 rounded text-xs font-medium text-indigo-600 transition"
        >
          +₱100K
        </button>
      </div>
    </div>
  );
}

export default function TaxPage() {
  const nav = useNavigate();
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState("individual"); 
  const [backendMode, setBackendMode] = useState(false); // true when data comes from API
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taxResult, setTaxResult] = useState({
    taxableIncome: 0,
    taxDue: 0,
    rateApplied: 0
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      // Pass current type to backend to load type-specific entries
      const res = await api.get('/tax', { params: { type: type } });
      console.log('Backend response:', res.data);
      
      if (!res.data.entries || res.data.entries.length === 0) {
        console.warn('No entries returned from backend');
        throw new Error('No entries received');
      }
      
      // Use actual saved values from backend (user-specific data)
      const apiEntries = (res.data.entries || []).map(e => {
        const value = parseFloat(e.value) || 0;
        return {
          id: e.id,
          label: e.label === 'VAT Expense' ? 'VAT Input' : e.label,
          value: value
        };
      });
      console.log('Loaded entries from backend:', apiEntries);
      const apiType = res.data.type || 'individual';
      setEntries(apiEntries);
      setType(apiType);
      setBackendMode(true);
      setHasUnsavedChanges(false); // Just loaded, no unsaved changes
      computeTax(apiEntries, apiType);
    } catch (e) {
      console.error('Falling back to mock tax entries:', e?.message || e);
      const mockEntries = [
        { id: 1, label: 'Sales', value: 0 },
        { id: 2, label: 'VAT Input', value: 0 },
        { id: 3, label: 'Other Expense', value: 0 },
        { id: 4, label: 'Asset', value: 0 },
        { id: 5, label: 'Asset Purchase', value: 0 },
      ];
      setEntries(mockEntries);
      setType('individual');
      setBackendMode(false);
      computeTax(mockEntries, 'individual');
    }
  }

  async function handleChange(id, newValue) {
    const updated = entries.map(e => e.id === id ? { ...e, value: newValue } : e);
    setEntries(updated);
    computeTax(updated, type);
    setHasUnsavedChanges(true);
  }

  async function handleTypeChange(newType) {
    setType(newType);
    // Load entries specific to the new taxpayer type
    try {
      const res = await api.get('/tax', { params: { type: newType } });
      const apiEntries = (res.data.entries || []).map(e => ({
        id: e.id,
        label: e.label === 'VAT Expense' ? 'VAT Input' : e.label,
        value: parseFloat(e.value) || 0
      }));
      setEntries(apiEntries);
      setHasUnsavedChanges(false);
      computeTax(apiEntries, newType);
    } catch (e) {
      console.error('Failed to load entries for type:', newType, e);
      // Fallback to empty entries
      const emptyEntries = [
        { id: null, label: 'Sales', value: 0 },
        { id: null, label: 'VAT Input', value: 0 },
        { id: null, label: 'Other Expense', value: 0 },
        { id: null, label: 'Asset', value: 0 },
        { id: null, label: 'Asset Purchase', value: 0 },
      ];
      setEntries(emptyEntries);
      computeTax(emptyEntries, newType);
    }
  }

  async function handleSave() {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      if (backendMode) {
        // Batch save all entries to backend
        console.log('Saving entries to backend:', entries);
        const promises = entries.map(entry => {
          // If entry has a valid numeric id, update it; otherwise it might need creation
          if (entry.id && entry.id > 0) {
            console.log(`Updating entry ${entry.id} with value:`, entry.value);
            return api.put(`/tax/${entry.id}`, { value: entry.value }).catch(err => {code 
              console.warn(`Failed to update entry ${entry.id}:`, err);
              // If update fails, might need to create
              return api.post('/tax', { 
                label: entry.label, 
                value: entry.value 
              });
            });
          }
          return Promise.resolve();
        });
        const results = await Promise.all(promises);
        console.log('Backend save results:', results);
      }
      
      // Persist summary to localStorage for Dashboard with current tax result
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const summary = {
        taxableIncome: taxResult.taxableIncome || 0,
        taxDue: taxResult.taxDue || 0,
        rateApplied: taxResult.rateApplied || 0,
        vatOutput: taxResult.vatOutput || 0,
        vatInput: taxResult.vatInput || 0,
        vatPayable: taxResult.vatPayable || 0,
        type: type,
        updatedAt: new Date().toISOString()
      };
      
      // Save to backend database for persistence across sessions
      if (backendMode) {
        try {
          await api.post('/tax/summary', summary);
        } catch (err) {
          console.error('Failed to save summary to backend:', err);
        }
      }
      
      // Use user-specific localStorage key as backup
      const storageKey = user.id ? `lastTaxSummary_${user.id}` : 'lastTaxSummary';
      localStorage.setItem(storageKey, JSON.stringify(summary));
      console.log('Saved tax summary to localStorage:', summary);
      
      setHasUnsavedChanges(false);
      alert('✅ Tax data saved successfully!\nTax Due: ₱' + (taxResult.taxDue || 0).toLocaleString());
    } catch (err) {
      console.error('Save failed:', err);
      alert('❌ Failed to save tax data. Please try again.\nError: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  function computeTax(list, taxpayerType) {
    const get = label => Number(list.find(e => e.label === label)?.value || 0);

    const sales = get("Sales");
    const vatInput = get("VAT Input");
    const otherExpense = get("Other Expense");
    const asset = get("Asset");
    const assetPurchase = get("Asset Purchase");
    const assets = asset + assetPurchase;

    // VAT Calculation (Philippine VAT is 12%)
    const vatOutput = sales * 0.12; // 12% of sales
    const vatPayable = Math.max(vatOutput - vatInput, 0); // VAT payable = Output - Input

    // Taxable income = Sales - VAT Output - Other Expense
    const taxableIncome = Math.max(sales - vatOutput - otherExpense, 0);

    let taxDue = 0;
    let rate = 0;

    if (taxpayerType === "individual") {
      // graduated tax (no assets for individual)
      if (taxableIncome <= 250000) taxDue = 0;
      else if (taxableIncome <= 400000)
        taxDue = (taxableIncome - 250000) * 0.15;
      else if (taxableIncome <= 800000)
        taxDue = 22500 + (taxableIncome - 400000) * 0.20;
      else if (taxableIncome <= 2000000)
        taxDue = 102500 + (taxableIncome - 800000) * 0.25;
      else if (taxableIncome <= 8000000)
        taxDue = 402500 + (taxableIncome - 2000000) * 0.30;
      else
        taxDue = 2202500 + (taxableIncome - 8000000) * 0.35;
    }

    else if (taxpayerType === "corporation") {
      // 25% only if BOTH income >= 5M AND assets >= 100M, otherwise 20%
      if (taxableIncome >= 5000000 && assets >= 100000000) {
        rate = 0.25;
      } else {
        rate = 0.20;
      }
      taxDue = taxableIncome * rate;
    }

    const summary = {
      taxableIncome,
      taxDue,
      rateApplied: rate,
      vatOutput: vatOutput,
      vatInput: vatInput,
      vatPayable: vatPayable
    };
    setTaxResult(summary);
    // Note: localStorage update moved to handleSave to only persist when user saves
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">

        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => nav('/dashboard')} className="text-indigo-600 hover:text-indigo-700 text-lg mb-2">
                ← Back
              </button>
              <h1 className="text-2xl font-bold">Tax</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                hasUnsavedChanges && !isSaving
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save Changes' : '✓ Saved'}
            </button>
          </div>
        </header>

        {/* Taxpayer Type Selector */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <label className="text-sm font-semibold block mb-3">Taxpayer Type</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="individual"
                checked={type === "individual"}
                onChange={e => handleTypeChange(e.target.value)}
              />
              <span className="font-medium">Individual</span>
              <span className="text-xs text-gray-500">(Graduated Tax Rates)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="corporation"
                checked={type === "corporation"}
                onChange={e => handleTypeChange(e.target.value)}
              />
              <span className="font-medium">Corporation</span>
              <span className="text-xs text-gray-500">(20% or 25%)</span>
            </label>
          </div>
        </div>

        {/* Tax Rate Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
          <div className="text-sm font-semibold mb-2">Tax Rate Information</div>
          {type === "individual" ? (
            <div className="text-xs text-gray-700 space-y-1">
              <p>• ₱0 - ₱250,000: 0%</p>
              <p>• ₱250,000 - ₱400,000: 15% of excess over ₱250,000</p>
              <p>• ₱400,000 - ₱800,000: ₱22,500 + 20% of excess over ₱400,000</p>
              <p>• ₱800,000 - ₱2M: ₱102,500 + 25% of excess over ₱800,000</p>
              <p>• ₱2M - ₱8M: ₱402,500 + 30% of excess over ₱2M</p>
              <p>• Over ₱8M: ₱2,202,500 + 35% of excess over ₱8M</p>
            </div>
          ) : (
            <div className="text-xs text-gray-700 space-y-1">
              <p>• <strong>20%</strong> if Net Income &lt; ₱5M AND Assets &lt; ₱100M</p>
              <p>• <strong>25%</strong> otherwise</p>
            </div>
          )}
        </div>

        {/* Tax Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow border-l-4 border-blue-600">
            <div className="text-xs text-blue-600 font-bold uppercase">VAT Output</div>
            <div className="text-2xl font-bold mt-2 text-blue-700">₱ {(taxResult.vatOutput || 0).toLocaleString()}</div>
            <div className="text-xs text-blue-500 mt-2">12% of Sales</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow border-l-4 border-purple-600">
            <div className="text-xs text-purple-600 font-bold uppercase">VAT Payable</div>
            <div className="text-2xl font-bold mt-2 text-purple-700">₱ {(taxResult.vatPayable || 0).toLocaleString()}</div>
            <div className="text-xs text-purple-500 mt-2">Output - Input</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl shadow border-l-4 border-indigo-600">
            <div className="text-xs text-indigo-600 font-bold uppercase">Net Income</div>
            <div className="text-2xl font-bold mt-2 text-indigo-700">₱ {taxResult.taxableIncome.toLocaleString()}</div>
            <div className="text-xs text-indigo-500 mt-2">Sales - VAT - Expenses</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow border-l-4 border-red-600">
            <div className="text-xs text-red-600 font-bold uppercase">Income Tax</div>
            <div className="text-2xl font-bold text-red-700 mt-2">
              ₱ {taxResult.taxDue.toLocaleString()}
            </div>
            <div className="text-xs text-red-500 mt-2">
              {type === "individual" ? "Graduated" : (taxResult.rateApplied * 100).toFixed(0) + "%"}
            </div>
          </div>
        </div>

        {/* Financial Entries */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-lg font-semibold mb-6">📊 Financial Factors - Adjust Your Values</div>

          {entries.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg text-center">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ No financial entries found</p>
              <p className="text-sm text-yellow-700 mb-4">The financial factors should load from the backend. If you don't see them, try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <>
              <div className={type === "corporation" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {/* Income & Expenses */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    💰 Income & Expenses
                  </h3>
                  <div className="space-y-3">
                    {entries.filter(e => ["Sales", "VAT Input", "Other Expense"].includes(e.label)).map(entry => (
                      <Slider key={entry.id} entry={entry} onChange={handleChange} />
                    ))}
                  </div>
                  <div className="bg-blue-50 p-3 rounded mt-3 text-xs text-gray-700">
                    <p className="font-semibold mb-1">How to Input:</p>
                    <p>1️⃣ Click the white number box on the right and type a value</p>
                    <p>2️⃣ Or drag the slider to adjust</p>
                    <p>3️⃣ Or click quick buttons (±₱50K, ±₱100K)</p>
                    <p className="mt-2"><strong>Result:</strong> Tax updates automatically!</p>
                  </div>
                </div>

                {/* Assets (only for corporations) */}
                {type === "corporation" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      🏢 Assets & Purchases
                    </h3>
                    <div className="space-y-3">
                      {entries.filter(e => ["Asset", "Asset Purchase"].includes(e.label)).map(entry => (
                        <Slider key={entry.id} entry={entry} onChange={handleChange} />
                      ))}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-3 text-xs text-gray-700">
                      <p className="font-semibold mb-1">💡 Tax Rates for Corporations:</p>
                      <p>• <strong>20% rate:</strong> Net Income &lt; ₱5M <strong>AND/OR</strong> Assets &lt; ₱100M</p>
                      <p>• <strong>25% rate:</strong> Net Income ≥ ₱5M <strong>AND</strong> Assets ≥ ₱100M</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600">
                  <p className="mb-2"><strong>📝 Calculation Formula:</strong></p>
                  <p>VAT Output = Sales × 12%</p>
                  <p>VAT Payable = VAT Output - VAT Input</p>
                  <p>Taxable Income = Sales - VAT Output - Other Expense</p>
                  {type === "corporation" && (
                    <p className="mt-1">Income Tax = Taxable Income × {taxResult.rateApplied > 0 ? (taxResult.rateApplied * 100) + "%" : "20% or 25%"}</p>
                  )}
                  {type === "individual" && (
                    <p className="mt-1">Income Tax = Applied based on graduated rate table above</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

