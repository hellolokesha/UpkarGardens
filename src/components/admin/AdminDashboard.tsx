import React, { useState, useEffect } from 'react';
import { 
  Building, Users, CreditCard, FileCheck, MessageSquare, 
  TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminDashboardProps {
  onNavigate: (module: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAdminAnalytics()])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading layout metrics...</span>
      </div>
    );
  }

  const { properties, maintenance, nocs, complaints } = stats;

  return (
    <div className="space-y-8">
      {/* Top Welcome Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
            Executive Association Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time layout metrics, financial collection rates, NOC processing, and maintenance ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('bills')}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Generate Bills
          </button>
          <button
            onClick={() => onNavigate('noc')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-300"
          >
            Review NOCs ({nocs.pending})
          </button>
        </div>
      </div>

      {/* Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Maintenance Billed</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            ₹{maintenance.totalBilled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Layout cumulative billings</div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Total Amount Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-900">
            ₹{maintenance.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Collection Efficiency: {maintenance.collectionRate}%
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Current Outstanding Dues</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-900">
            ₹{maintenance.totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Overdue portion: ₹{maintenance.overdueAmount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Current Month Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Current Month Collections</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            ₹{maintenance.currentMonthCollection.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Received via online & direct receipts</div>
        </div>
      </div>

      {/* Layout & Operational KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Properties */}
        <div
          onClick={() => onNavigate('properties')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sites / Plots</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{properties.totalSites}</div>
          <div className="text-[10px] text-slate-500 mt-1">
            {properties.occupied} Occupied · {properties.vacant} Vacant · {properties.underConstruction} Under Const
          </div>
        </div>

        {/* Owners */}
        <div
          onClick={() => onNavigate('owners')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Registered Owners</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{properties.totalOwners}</div>
          <div className="text-[10px] text-slate-500 mt-1">Verified property titles</div>
        </div>

        {/* NOCs */}
        <div
          onClick={() => onNavigate('noc')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>NOC Applications</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{nocs.total}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">
            {nocs.pending} Pending Review · {nocs.issued} Issued
          </div>
        </div>

        {/* Complaints */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
            <span>Complaints</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{complaints.total}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            {complaints.inProgress} In-Progress · {complaints.resolved} Resolved
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Billed vs Collected Bar Chart (Cols 1 & 2) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Monthly Billing vs Collection Performance</h3>
                <p className="text-[11px] text-slate-400">Last 6 Months Trend</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
                  <span>Billed</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded bg-emerald-700 inline-block" />
                  <span>Collected</span>
                </span>
              </div>
            </div>

            {/* Visual Bar representation */}
            <div className="space-y-4 pt-2">
              {analytics.monthlyData.map((m: any, idx: number) => {
                const maxVal = 15000;
                const billedWidth = Math.min(100, Math.round((m.billed / maxVal) * 100));
                const collectedWidth = Math.min(100, Math.round((m.collected / maxVal) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{m.month}</span>
                      <span className="font-mono text-xs">
                        Collected: <strong className="text-emerald-900">₹{m.collected.toLocaleString('en-IN')}</strong> / ₹{m.billed.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${collectedWidth}%` }}
                        className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Outstanding Sites (Col 3) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Top Outstanding Dues</h3>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                View all →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {analytics.topDuesSites.slice(0, 5).map((s: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold font-mono text-slate-900 block">Site #{s.site_number}</span>
                    <span className="text-slate-500 text-[11px]">{s.owner_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-900 text-sm block">
                      ₹{Number(s.outstanding_balance).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">+91 {s.primary_mobile}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
