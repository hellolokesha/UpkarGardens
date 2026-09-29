import React from 'react';
import { 
  CreditCard, FileCheck, Receipt, MessageSquare, Bell, FolderDown, 
  ArrowRight, CheckCircle2, AlertTriangle, Shield, Clock 
} from 'lucide-react';
import { Property, Owner } from '../../types';

interface OwnerDashboardProps {
  owner: Owner;
  property: Property;
  summary: {
    totalOutstanding: number;
    currentMonthCharge: number;
    overdueAmount: number;
    monthlyMaintenance: number;
    allowPartialPayments: boolean;
  };
  nocSummary: {
    pendingCount: number;
  };
  recentPayments: any[];
  notices: any[];
  onOpenPaymentModal: () => void;
  onNavigateTab: (tab: string) => void;
  onViewReceipt: (receiptNumber: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  owner,
  property,
  summary,
  nocSummary,
  recentPayments,
  notices,
  onOpenPaymentModal,
  onNavigateTab,
  onViewReceipt
}) => {
  return (
    <div className="space-y-8">
      {/* Welcome Bar with Property ID */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
            Registered Property Owner
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Welcome, {owner.owner_name}
          </h2>
          {owner.joint_owners && (
            <p className="text-xs text-slate-500 mt-0.5">
              Joint Owner(s): <span className="font-semibold text-slate-700">{owner.joint_owners}</span>
            </p>
          )}
        </div>

        {/* Quick Property Coordinates */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Site Number</span>
            <span className="text-base font-extrabold text-emerald-950 font-mono">
              #{property.site_number}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block font-medium">House Number</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {property.house_number || 'N/A'}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block font-medium">Phase / Block</span>
            <span className="text-base font-semibold text-slate-800">
              {property.block_phase || 'North Block'}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block font-medium">Registered Mobile</span>
            <span className="text-base font-mono font-bold text-slate-900">
              {owner.primary_mobile ? `+91 ${owner.primary_mobile}` : 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Status Grid: Maintenance & NOC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Status Card (Cols 1 & 2) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white uppercase tracking-wider">
                  Maintenance Status
                </h3>
              </div>
              <span className="text-xs text-emerald-300 font-mono">
                Category: {property.property_type || 'Residential'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="text-xs text-emerald-300 block">Current Due</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                  ₹{summary.totalOutstanding.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 block">Overdue</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                  ₹{summary.overdueAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 block">Current Month</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-200">
                  ₹{summary.currentMonthCharge.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 block">Total Outstanding</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">
                  ₹{summary.totalOutstanding.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <p className="text-xs text-emerald-200">
              {summary.totalOutstanding === 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All maintenance dues are fully cleared. No pending balance.</span>
                </span>
              ) : (
                <span>Prompt payment maintains 24x7 security, water grid, and street lighting.</span>
              )}
            </p>

            <button
              onClick={onOpenPaymentModal}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{summary.totalOutstanding > 0 ? 'PAY NOW' : 'ADVANCE PAYMENT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NOC Status Card (Col 3) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 border-b border-slate-100 pb-3">
              <FileCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">
                NOC Applications
              </h3>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-800 font-semibold uppercase block">
                Active In-Review
              </span>
              <span className="text-3xl font-extrabold text-emerald-950 font-mono my-1 block">
                {nocSummary.pendingCount}
              </span>
              <span className="text-xs text-slate-600">
                {nocSummary.pendingCount > 0 ? 'Applications under committee review' : 'No active applications pending'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Need No Objection Certificate for property title transfer, building construction, or bank loan mortgage?
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigateTab('noc')}
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>VIEW NOC APPLICATIONS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onOpenPaymentModal}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Pay Maintenance</span>
          </button>

          <button
            onClick={() => onNavigateTab('noc')}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Apply NOC</span>
          </button>

          <button
            onClick={() => onNavigateTab('receipts')}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">View Receipts</span>
          </button>

          <button
            onClick={() => onNavigateTab('complaints')}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Raise Complaint</span>
          </button>

          <button
            onClick={() => onNavigateTab('notices')}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">View Notices</span>
          </button>

          <button
            onClick={() => onNavigateTab('documents')}
            className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition text-center cursor-pointer flex flex-col items-center gap-2 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center">
              <FolderDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Documents</span>
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Payments & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Recent Payment Receipts</h3>
            <button
              onClick={() => onNavigateTab('receipts')}
              className="text-xs text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              All Receipts →
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No payment history recorded yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{p.receipt_number}</span>
                    <span className="text-slate-500">{p.payment_date} · via {p.payment_method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onViewReceipt(p.receipt_number)}
                      className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded text-[11px] transition cursor-pointer"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Resident Notice Board</h3>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              All Notices →
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-800">{n.category}</span>
                  <span>{n.publish_date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">{n.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{n.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
