import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export const AdminImport: React.FC = () => {
  const [csvText, setCsvText] = useState(`siteNumber,houseNumber,blockPhase,ownerName,mobile,email,monthlyMaintenance
301,UG-101,Phase 2 - C Block,Girish Rao,9845099881,girish.rao@example.com,1500
302,,Phase 2 - C Block,Sudha N.,9845099882,sudha.n@example.com,1500
303,UG-102,Phase 2 - C Block,Maheshwari K.,9845099883,maheshwari.k@example.com,2500`);

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCsv = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must contain a header row and at least one data row');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const parsed = lines.slice(1).map(l => {
        const values = l.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      });
      setPreviewRows(parsed);
      setError(null);
    } catch (err: any) {
      setError('Failed to parse CSV: ' + err.message);
    }
  };

  const executeImport = async () => {
    if (previewRows.length === 0) {
      setError('Please parse CSV preview first');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.importOwners(previewRows);
      setImportResult(res);
      setPreviewRows([]);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Bulk Property & Owner Data Import</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload or paste CSV data to create or update layout sites, owner profiles, and maintenance categories in bulk.
        </p>
      </div>

      {importResult && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Import Successfully Completed</span>
          </div>
          <p className="text-xs text-slate-700">{importResult.message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CSV Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            Paste Comma-Separated Values (CSV) with Headers:
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            siteNumber, houseNumber, blockPhase, ownerName, mobile, email, monthlyMaintenance
          </span>
        </div>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={parseCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Validate & Preview Rows
          </button>
        </div>
      </div>

      {/* Preview Table */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Import Preview ({previewRows.length} records ready)</h3>
              <p className="text-[11px] text-slate-500">Duplicate site numbers will update existing properties.</p>
            </div>
            <button
              onClick={executeImport}
              disabled={submitting}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Importing...' : `Confirm Import of ${previewRows.length} Sites`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Site #</th>
                  <th className="py-2.5 px-3">House #</th>
                  <th className="py-2.5 px-3">Block / Phase</th>
                  <th className="py-2.5 px-3">Owner Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {previewRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 font-sans">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.siteNumber}</td>
                    <td className="py-2 px-3">{r.houseNumber || '—'}</td>
                    <td className="py-2 px-3">{r.blockPhase}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{r.ownerName}</td>
                    <td className="py-2 px-3 font-mono">{r.mobile}</td>
                    <td className="py-2 px-3 font-mono">₹{r.monthlyMaintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
