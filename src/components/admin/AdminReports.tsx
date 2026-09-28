import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<'COLLECTION' | 'OUTSTANDING' | 'YEARLY'>('COLLECTION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [method, setMethod] = useState('');

  const [collectionData, setCollectionData] = useState<any>(null);
  const [outstandingData, setOutstandingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    if (reportType === 'COLLECTION') {
      api.getCollectionReport({ startDate, endDate, method })
        .then(res => setCollectionData(res))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      api.getOutstandingReport()
        .then(res => setOutstandingData(res))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate, method]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'COLLECTION' && collectionData) {
      const headers = ['Payment Date', 'Receipt Number', 'Site Number', 'Owner Name', 'Amount (INR)', 'Payment Method', 'Gateway ID'];
      const rows = collectionData.records.map((r: any) => [
        r.payment_date,
        r.receipt_number,
        r.site_number,
        `"${r.owner_name}"`,
        r.amount,
        r.payment_method,
        r.gateway_payment_id || ''
      ]);
      csvContent += [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    } else if (outstandingData) {
      const headers = ['Site Number', 'House Number', 'Phase/Block', 'Owner Name', 'Primary Mobile', 'Rate', 'Total Outstanding (INR)'];
      const rows = outstandingData.records.map((r: any) => [
        r.site_number,
        r.house_number || '',
        r.block_phase || '',
        `"${r.owner_name}"`,
        r.primary_mobile || '',
        r.monthly_maintenance,
        r.outstanding_balance
      ]);
      csvContent += [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `upkar_gardens_${reportType.toLowerCase()}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Yearly 12-month table mock generator based on actual current stats
  const financialYearMonths = [
    { month: 'April 2026', billed: 12500, collected: 12500, outstanding: 0, rate: 100 },
    { month: 'May 2026', billed: 12500, collected: 10500, outstanding: 2000, rate: 84 },
    { month: 'June 2026', billed: 12500, collected: 11000, outstanding: 1500, rate: 88 },
    { month: 'July 2026', billed: 12500, collected: 12000, outstanding: 500, rate: 96 },
    { month: 'August 2026', billed: 12500, collected: 12500, outstanding: 0, rate: 100 },
    { month: 'September 2026', billed: 12500, collected: 5600, outstanding: 6900, rate: 45 },
    { month: 'October 2026', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
    { month: 'November 2026', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
    { month: 'December 2026', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
    { month: 'January 2027', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
    { month: 'February 2027', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
    { month: 'March 2027', billed: 12500, collected: 0, outstanding: 12500, rate: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports & Ledger Statements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade collection statements, outstanding arrears, and financial year (FY 2026–27) reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setReportType('COLLECTION')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            reportType === 'COLLECTION' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Maintenance Collection Report
        </button>
        <button
          onClick={() => setReportType('OUTSTANDING')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            reportType === 'OUTSTANDING' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Site-wise Outstanding Arrears
        </button>
        <button
          onClick={() => setReportType('YEARLY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            reportType === 'YEARLY' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          FY 2026–27 12-Month Performance
        </button>
      </div>

      {/* COLLECTION REPORT */}
      {reportType === 'COLLECTION' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Total Collections</span>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                ₹{collectionData?.totalCollected?.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-xs text-emerald-200 mt-1 block">
                Across {collectionData?.count || 0} successfully settled receipts
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-lg border border-emerald-700"
              />
              <span className="text-xs text-emerald-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-lg border border-emerald-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Site Number</th>
                    <th className="py-3 px-4">Owner Name</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {collectionData?.records?.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 font-sans">
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.payment_date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.receipt_number}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-950">Site #{r.site_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.owner_name}</td>
                      <td className="py-3 px-4 text-slate-600">{r.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                        ₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OUTSTANDING ARREARS REPORT */}
      {reportType === 'OUTSTANDING' && (
        <div className="space-y-4">
          <div className="bg-amber-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-300 uppercase tracking-wider font-semibold">Total Outstanding Balance</span>
              <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
                ₹{outstandingData?.totalOutstanding?.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-xs text-amber-200 mt-1 block">
                Across {outstandingData?.count || 0} sites with pending maintenance
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Site #</th>
                    <th className="py-3 px-4">House #</th>
                    <th className="py-3 px-4">Block / Phase</th>
                    <th className="py-3 px-4">Owner Name</th>
                    <th className="py-3 px-4">Primary Mobile</th>
                    <th className="py-3 px-4 text-right">Monthly Rate</th>
                    <th className="py-3 px-4 text-right">Outstanding Arrears (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outstandingData?.records?.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">Site #{r.site_number}</td>
                      <td className="py-3 px-4 text-slate-600">{r.house_number || 'Plot'}</td>
                      <td className="py-3 px-4 text-slate-600">{r.block_phase}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.owner_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">+91 {r.primary_mobile}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{r.monthly_maintenance}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-900 text-sm">
                        ₹{Number(r.outstanding_balance).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* YEARLY REPORT (Section 71) */}
      {reportType === 'YEARLY' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900">
              Financial Year 2026–27 (April 2026 – March 2027) Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Month-by-month statutory billing and collection percentage tracking.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Financial Month</th>
                    <th className="py-3 px-4 text-right">Total Billed (₹)</th>
                    <th className="py-3 px-4 text-right">Collected (₹)</th>
                    <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                    <th className="py-3 px-4 text-center">Collection %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {financialYearMonths.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 font-sans">
                      <td className="py-3 px-4 font-semibold text-slate-900">{m.month}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{m.billed.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        ₹{m.collected.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-800">
                        ₹{m.outstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.rate >= 90 ? 'bg-emerald-100 text-emerald-900' : m.rate > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {m.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
