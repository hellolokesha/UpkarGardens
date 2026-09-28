import React, { useState } from 'react';
import { Layers, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSpecialCharges: React.FC = () => {
  // Special Charge State
  const [chargeTitle, setChargeTitle] = useState('');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(500);
  const [targetType, setTargetType] = useState<'ALL' | 'SELECTED'>('ALL');
  const [targetSites, setTargetSites] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-31');

  // Waiver / Adjustment State
  const [adjSiteNo, setAdjSiteNo] = useState('');
  const [adjType, setAdjType] = useState<'WAIVER' | 'CREDIT' | 'DEBIT'>('WAIVER');
  const [adjAmount, setAdjAmount] = useState<number>(500);
  const [adjReason, setAdjReason] = useState('');

  const [submittingCharge, setSubmittingCharge] = useState(false);
  const [submittingAdj, setSubmittingAdj] = useState(false);
  const [chargeMessage, setChargeMessage] = useState<string | null>(null);
  const [adjMessage, setAdjMessage] = useState<string | null>(null);
  const [errorCharge, setErrorCharge] = useState<string | null>(null);
  const [errorAdj, setErrorAdj] = useState<string | null>(null);

  const handleApplySpecialCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeTitle || chargeAmount <= 0) {
      setErrorCharge('Charge title and valid amount are required');
      return;
    }
    setSubmittingCharge(true);
    setErrorCharge(null);
    setChargeMessage(null);

    try {
      const res = await api.createSpecialCharge({
        title: chargeTitle,
        description: chargeDesc,
        amount: chargeAmount,
        targetType,
        targetValue: targetSites,
        dueDate
      });
      setChargeMessage(res.message);
      setChargeTitle('');
      setChargeDesc('');
    } catch (err: any) {
      setErrorCharge(err.message || 'Failed to apply special charge');
    } finally {
      setSubmittingCharge(false);
    }
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjSiteNo || adjAmount <= 0 || !adjReason) {
      setErrorAdj('Site number, amount and mandatory reason are required');
      return;
    }
    setSubmittingAdj(true);
    setErrorAdj(null);
    setAdjMessage(null);

    try {
      const res = await api.createAdjustment({
        siteNumber: adjSiteNo,
        adjustmentType: adjType,
        amount: adjAmount,
        reason: adjReason
      });
      setAdjMessage(res.message);
      setAdjSiteNo('');
      setAdjReason('');
    } catch (err: any) {
      setErrorAdj(err.message || 'Failed to record adjustment');
    } finally {
      setSubmittingAdj(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Special Charges & Account Adjustments</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Levy layout infrastructure contributions (Borewell, Road, Transformer) and process audited financial waivers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module A: Special Charges */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Layout-Wide Assessment
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Levy Special Charge</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Applies charge to selected sites and automatically enters into every owner's ledger.
            </p>
          </div>

          {chargeMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{chargeMessage}</span>
            </div>
          )}

          {errorCharge && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              {errorCharge}
            </div>
          )}

          <form onSubmit={handleApplySpecialCharge} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Charge Title / Purpose *</label>
              <input
                type="text"
                placeholder="e.g. Layout Transformer Repair / Borewell Deepening"
                required
                value={chargeTitle}
                onChange={(e) => setChargeTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount per Site (₹) *</label>
                <input
                  type="number"
                  required
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Sites</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={targetType === 'ALL'}
                    onChange={() => setTargetType('ALL')}
                  />
                  <span>All Active Layout Sites</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={targetType === 'SELECTED'}
                    onChange={() => setTargetType('SELECTED')}
                  />
                  <span>Selected Sites Only</span>
                </label>
              </div>

              {targetType === 'SELECTED' && (
                <input
                  type="text"
                  placeholder="e.g. 125, 42, 108"
                  value={targetSites}
                  onChange={(e) => setTargetSites(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Project Scope</label>
              <textarea
                rows={2}
                placeholder="Background justification approved by managing committee..."
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submittingCharge}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submittingCharge ? 'Applying to ledgers...' : 'Apply Special Charge to Layout'}
            </button>
          </form>
        </div>

        {/* Module B: Waivers & Adjustments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Financial Integrity & Audit Trail
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Waiver / Account Adjustment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized credit/debit adjustment for dispute resolution, penalty waiver, or corrections.
            </p>
          </div>

          {adjMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{adjMessage}</span>
            </div>
          )}

          {errorAdj && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              {errorAdj}
            </div>
          )}

          <form onSubmit={handleApplyAdjustment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 125"
                  required
                  value={adjSiteNo}
                  onChange={(e) => setAdjSiteNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="WAIVER">Waiver (Reduces Dues)</option>
                  <option value="CREDIT">Credit Adjustment (Reduces Dues)</option>
                  <option value="DEBIT">Debit Adjustment (Adds Dues)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Amount (₹) *</label>
              <input
                type="number"
                required
                value={adjAmount}
                onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Audit Justification / Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="State committee resolution number or specific reason for waiver/adjustment..."
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAdj}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submittingAdj ? 'Logging adjustment...' : 'Record Authorized Adjustment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
