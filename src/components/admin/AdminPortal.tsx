import React, { useState } from 'react';
import { 
  LayoutDashboard, Building, Users, CreditCard, Receipt, 
  FileCheck, MessageSquare, Globe, BarChart3, Settings, 
  LogOut, Shield, ChevronRight, Layers, ArrowLeft, Upload 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssociation } from '../../context/AssociationContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProperties } from './AdminProperties';
import { AdminOwners } from './AdminOwners';
import { AdminImport } from './AdminImport';
import { AdminBills } from './AdminBills';
import { AdminSpecialCharges } from './AdminSpecialCharges';
import { AdminPayments } from './AdminPayments';
import { AdminNoc } from './AdminNoc';
import { AdminComplaints } from './AdminComplaints';
import { AdminCms } from './AdminCms';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';

interface AdminPortalProps {
  onBackToWebsite: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToWebsite }) => {
  const { user, logout } = useAuth();
  const { regNo, regDate, settings } = useAssociation();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Members & Layout',
      items: [
        { id: 'properties', label: 'Site Directory', icon: Building },
        { id: 'owners', label: 'All Owners', icon: Users },
        { id: 'import', label: 'Import Data', icon: Upload },
      ]
    },
    {
      group: 'Maintenance & Ledger',
      items: [
        { id: 'bills', label: 'Maintenance Bills', icon: CreditCard },
        { id: 'special_charges', label: 'Special Charges & Waivers', icon: Layers },
        { id: 'payments', label: 'Payments & Reconciliation', icon: Receipt },
      ]
    },
    {
      group: 'Services & Operations',
      items: [
        { id: 'noc', label: 'NOC Applications', icon: FileCheck },
        { id: 'complaints', label: 'Complaints Helpdesk', icon: MessageSquare },
      ]
    },
    {
      group: 'Reports & Governance',
      items: [
        { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
        { id: 'cms', label: 'Website CMS', icon: Globe },
        { id: 'settings', label: 'Settings & Audit Log', icon: Settings },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-emerald-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
          >
            <Shield className="w-5 h-5 text-amber-300" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              UGOA
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                {settings.association_name || 'Upkar Gardens Association Console'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-emerald-300 font-mono">
                <span>Reg No: {regNo}</span>
                <span className="text-emerald-500 font-bold">·</span>
                <span>Date: {regDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWebsite}
            className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-emerald-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Website</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-emerald-800/80 text-xs">
            <span className="font-bold text-white">{user?.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-emerald-950">
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`
          w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0
          lg:static fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-14
        `}>
          <div className="p-4 space-y-6 overflow-y-auto">
            {menuGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
                  {grp.group}
                </span>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-900 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-200/80 bg-slate-50 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-800 block truncate leading-tight">
              {settings.association_name || 'Upkar Gardens Owners Association'}
            </span>
            <div className="font-mono text-[10px] text-slate-600 flex items-center justify-between">
              <span>Reg: {regNo}</span>
              <span className="text-slate-400 font-medium">({regDate})</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-0.5 border-t border-slate-200/60 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portal & CMS Data Synced</span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 z-20 top-14"
          />
        )}

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && <AdminDashboard onNavigate={setActiveModule} />}
          {activeModule === 'properties' && <AdminProperties />}
          {activeModule === 'owners' && <AdminOwners />}
          {activeModule === 'import' && <AdminImport />}
          {activeModule === 'bills' && <AdminBills />}
          {activeModule === 'special_charges' && <AdminSpecialCharges />}
          {activeModule === 'payments' && <AdminPayments />}
          {activeModule === 'noc' && <AdminNoc />}
          {activeModule === 'complaints' && <AdminComplaints />}
          {activeModule === 'reports' && <AdminReports />}
          {activeModule === 'cms' && <AdminCms />}
          {activeModule === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
