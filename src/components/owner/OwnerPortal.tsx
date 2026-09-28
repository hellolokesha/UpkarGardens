import React, { useState, useEffect } from 'react';
import { 
  Home, CreditCard, FileCheck, Receipt, MessageSquare, 
  Bell, User, LogOut, Phone, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { OwnerDashboard } from './OwnerDashboard';
import { OwnerMaintenance } from './OwnerMaintenance';
import { OwnerReceipts } from './OwnerReceipts';
import { OwnerNoc } from './OwnerNoc';
import { OwnerComplaints } from './OwnerComplaints';
import { OwnerProfile } from './OwnerProfile';
import { NoticesView } from '../public/NoticesView';
import { DocumentsView } from '../public/DocumentsView';
import { OwnerPaymentModal } from './OwnerPaymentModal';
import { ReceiptModal } from '../common/ReceiptModal';

export const OwnerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'receipts' | 'noc' | 'complaints' | 'notices' | 'documents' | 'profile'>('dashboard');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [activeReceiptQr, setActiveReceiptQr] = useState<string | undefined>(undefined);

  const fetchDashboard = () => {
    api.getOwnerDashboard()
      .then(res => setDashboardData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenReceipt = async (receiptNumber: string) => {
    try {
      const data = await api.getOwnerReceipt(receiptNumber);
      if (data && data.receipt) {
        setActiveReceipt(data.receipt);
        setActiveReceiptQr(data.qrCodeSvg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSuccess = (receiptNumber: string) => {
    setShowPaymentModal(false);
    fetchDashboard();
    handleOpenReceipt(receiptNumber);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading your resident account...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.owner || !dashboardData.property) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Owner Record Not Found</h3>
        <p className="text-xs text-slate-600">
          This account is not yet linked to a specific layout property site. Please contact the Association Office with your registered title deed.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const { owner, property, maintenanceSummary, nocSummary, recentPayments, notices } = dashboardData;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'maintenance', label: 'Maintenance & Ledger', icon: CreditCard },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'noc', label: 'NOC Applications', icon: FileCheck },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'profile', label: 'My Property', icon: User },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 lg:pb-12">
      {/* Top Portal Banner */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              UG
            </div>
            <div>
              <span className="block font-bold text-sm text-white leading-tight">
                Resident Portal · Site #{property.site_number}
              </span>
              <span className="block text-[11px] text-emerald-300">
                {owner.owner_name} {owner.primary_mobile ? `(+91 ${owner.primary_mobile})` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-sm hidden sm:inline-flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Online</span>
            </button>

            <button
              onClick={logout}
              className="text-emerald-200 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-30 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <OwnerDashboard
            owner={owner}
            property={property}
            summary={maintenanceSummary}
            nocSummary={nocSummary}
            recentPayments={recentPayments}
            notices={notices}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
            onNavigateTab={(t) => setActiveTab(t as any)}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'maintenance' && (
          <OwnerMaintenance
            propertyId={property.id}
            siteNumber={property.site_number}
            ownerName={owner.owner_name}
            totalOutstanding={maintenanceSummary.totalOutstanding}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
          />
        )}

        {activeTab === 'receipts' && (
          <OwnerReceipts onViewReceipt={handleOpenReceipt} />
        )}

        {activeTab === 'noc' && (
          <OwnerNoc
            propertyId={property.id}
            siteNumber={property.site_number}
            totalOutstanding={maintenanceSummary.totalOutstanding}
          />
        )}

        {activeTab === 'complaints' && (
          <OwnerComplaints
            propertyId={property.id}
            siteNumber={property.site_number}
          />
        )}

        {activeTab === 'notices' && (
          <NoticesView />
        )}

        {activeTab === 'documents' && (
          <DocumentsView />
        )}

        {activeTab === 'profile' && (
          <OwnerProfile owner={owner} property={property} />
        )}
      </main>

      {/* Mobile Application-Like Bottom Navigation Bar (Section 79) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-900 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold cursor-pointer ${
            activeTab === 'maintenance' ? 'text-emerald-900 font-extrabold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Bills</span>
        </button>

        {/* Floating Center Pay Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center shadow-lg border-2 border-white cursor-pointer active:scale-95 transition"
          aria-label="Pay Maintenance"
        >
          <span className="font-extrabold text-base">₹</span>
        </button>

        <button
          onClick={() => setActiveTab('noc')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold cursor-pointer ${
            activeTab === 'noc' ? 'text-emerald-900 font-extrabold' : 'text-slate-500'
          }`}
        >
          <FileCheck className="w-5 h-5" />
          <span>NOC</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-900 font-extrabold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>

      {/* Floating Emergency / Support Button */}
      <a
        href="tel:+919480123456"
        className="fixed bottom-20 right-4 z-30 px-3.5 py-2 bg-slate-900 text-white rounded-full shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold hover:bg-slate-800 transition lg:bottom-6"
      >
        <Phone className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Desk: +91 94801 23456</span>
        <span className="sm:hidden">Support</span>
      </a>

      {/* Online Payment Modal */}
      {showPaymentModal && (
        <OwnerPaymentModal
          isOpen={showPaymentModal}
          totalOutstanding={maintenanceSummary.totalOutstanding}
          monthlyAmount={property.monthly_maintenance}
          allowPartial={maintenanceSummary.allowPartialPayments}
          siteNumber={property.site_number}
          ownerName={owner.owner_name}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          qrCodeSvg={activeReceiptQr}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
