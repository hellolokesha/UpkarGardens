import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Download, CheckCircle2, Lock, History, KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettingsAndLogs = () => {
    Promise.all([api.getCmsSettings(), api.getAuditLogs()])
      .then(([s, logs]) => {
        setSettings(s || {});
        setAuditLogs(logs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.saveCmsSettings(settings);
      setSaved(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/admin/backup', '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Configurations & Audit Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Financial numbering prefixes, Indian payment gateway credentials, and statutory audit trails.
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download SQLite Database Backup</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration parameters updated and applied to association ledger.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Financial & Gateway Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Active Financial Year</label>
            <input
              type="text"
              value={settings['financial_year'] || '2026-27'}
              onChange={(e) => setSettings({ ...settings, financial_year: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Number Prefix</label>
            <input
              type="text"
              value={settings['receipt_prefix'] || 'UGOA/REC/2026-27/'}
              onChange={(e) => setSettings({ ...settings, receipt_prefix: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">NOC Serial Prefix</label>
            <input
              type="text"
              value={settings['noc_prefix'] || 'UGOA/NOC/2026/'}
              onChange={(e) => setSettings({ ...settings, noc_prefix: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Allow Partial Maintenance Payments</span>
              <span className="text-[11px] text-slate-500">Owners can pay custom amounts up to outstanding dues</span>
            </div>
            <select
              value={settings['allow_partial_payments'] || 'true'}
              onChange={(e) => setSettings({ ...settings, allow_partial_payments: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold"
            >
              <option value="true">YES (Enabled)</option>
              <option value="false">NO (Full Due Only)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Require Zero Dues for NOC Submission</span>
              <span className="text-[11px] text-slate-500">Blocks NOC application if maintenance dues are pending</span>
            </div>
            <select
              value={settings['noc_require_zero_dues'] || 'true'}
              onChange={(e) => setSettings({ ...settings, noc_require_zero_dues: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold"
            >
              <option value="true">YES (Zero Dues Required)</option>
              <option value="false">NO (Allow with Warning)</option>
            </select>
          </div>
        </div>

        {/* Payment Gateway Box */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
            <Lock className="w-4 h-4 text-emerald-800" />
            <span>Indian Payment Gateway Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gateway Provider</label>
              <select
                value={settings['payment_gateway_provider'] || 'Razorpay'}
                onChange={(e) => setSettings({ ...settings, payment_gateway_provider: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Razorpay">Razorpay Gateway (UPI, Cards, Net Banking)</option>
                <option value="Cashfree">Cashfree Payments</option>
                <option value="PhonePe">PhonePe Payment Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Environment</label>
              <select
                value={settings['payment_gateway_env'] || 'Test'}
                onChange={(e) => setSettings({ ...settings, payment_gateway_env: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="Test">Sandbox / Test Mode</option>
                <option value="Live">Production Live</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant Key ID</label>
              <input
                type="text"
                value={settings['payment_gateway_key_id'] || 'rzp_test_upkar_2026'}
                onChange={(e) => setSettings({ ...settings, payment_gateway_key_id: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration Parameters'}
        </button>
      </form>

      {/* Audit Log Table (Section 60 & 94) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Statutory Admin Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Immutable ledger of administrative actions for complete financial transparency.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Authorized User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.created_at}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {log.user_name}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px]">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-950 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {log.target_entity}
                  </td>
                  <td className="py-2 px-3 text-slate-700 text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
