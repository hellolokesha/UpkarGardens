import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Calendar, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { MaintenanceBill } from '../../types';

export const AdminBills: React.FC = () => {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodFilter, setPeriodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');

  // Generate Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetMode, setTargetMode] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedSitesInput, setSelectedSitesInput] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('October 2026');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [fixedAmount, setFixedAmount] = useState('');
  const [lateFee, setLateFee] = useState(0);
  const [description, setDescription] = useState('Regular monthly maintenance charge');
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = () => {
    api.getAdminBills({ period: periodFilter, status: statusFilter, site: siteFilter })
      .then(res => setBills(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [periodFilter, statusFilter, siteFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResultMsg(null);

    const selectedSites = targetMode === 'SELECTED' 
      ? selectedSitesInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const res = await api.generateBills({
        targetMode,
        selectedSites,
        billingPeriod,
        dueDate,
        fixedAmount: fixedAmount ? parseFloat(fixedAmount) : undefined,
        lateFee,
        description
      });
      setResultMsg(res.message);
      setShowGenerateModal(false);
      fetchBills();
    } catch (err: any) {
      setError(err.message || 'Failed to generate bills');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Maintenance Billing Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate monthly or quarterly layout maintenance bills individually or in bulk.
          </p>
        </div>

        <button
          onClick={() => { setShowGenerateModal(true); setError(null); }}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Bills</span>
        </button>
      </div>

      {resultMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{resultMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Filter by Site Number..."
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        />

        <input
          type="text"
          placeholder="Filter by Period (e.g. September 2026)..."
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        >
          <option value="">All Bill Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No bills found matching criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bill Number</th>
                  <th className="py-3 px-4">Site & Owner</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Current Charge</th>
                  <th className="py-3 px-4 text-right">Late Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.bill_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">Site #{b.site_number}</span>
                      <span className="text-[11px] text-slate-500">{b.owner_name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{b.billing_period}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.due_date}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{b.current_charge}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                      ₹{b.late_fee}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-800">
                      ₹{b.amount_paid}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{b.outstanding_amount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        b.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : b.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Generate Maintenance Bills</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Properties</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={targetMode === 'ALL'}
                      onChange={() => setTargetMode('ALL')}
                    />
                    <span>All Active Layout Sites (Bulk)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={targetMode === 'SELECTED'}
                      onChange={() => setTargetMode('SELECTED')}
                    />
                    <span>Selected Sites Only</span>
                  </label>
                </div>
              </div>

              {targetMode === 'SELECTED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Numbers (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 125, 42, 108"
                    value={selectedSitesInput}
                    onChange={(e) => setSelectedSitesInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Period *</label>
                  <input
                    type="text"
                    required
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fixed Amount (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Default: site's rate"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank to use each plot's rate.</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Late Fee Rule (₹)</label>
                  <input
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bill Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Generating bills & updating ledger...' : 'Generate & Dispatch Maintenance Bills'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
