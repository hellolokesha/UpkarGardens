import React, { useState } from 'react';
import { Shield, User, LogOut, KeyRound, Menu, X, FileCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: (defaultTab?: 'OWNER' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, openAuthModal }) => {
  const { user, logout, isOwner, isAdmin, isCommittee } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'committee', label: 'Committee' },
    { id: 'notices', label: 'Notices' },
    { id: 'events', label: 'Events' },
    { id: 'documents', label: 'Documents' },
    { id: 'rules', label: 'Rules' },
    { id: 'verify-noc', label: 'Verify NOC', icon: FileCheck },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs print:hidden">
      {/* Top Notification Bar */}
      <div className="bg-emerald-950 text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">Govt. Regd. Society:</span>
            <span className="font-mono text-emerald-200">DRO-1/SOR/142/2018-19</span>
            <span className="hidden md:inline text-emerald-600">|</span>
            <span className="hidden md:inline text-emerald-200">Chandapura-Anekal Main Road, Bangalore</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200 text-[11px]">
            <span>Security Desk: <strong className="text-white font-mono">+91 94801 23456</strong></span>
            <button
              onClick={() => handleNavClick('verify-noc')}
              className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
            >
              Public NOC Verification
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-800 transition">
              <Shield className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-extrabold tracking-tight text-emerald-950 leading-tight">
                UPKAR GARDENS
              </span>
              <span className="block text-[11px] font-semibold text-emerald-800 tracking-wider uppercase">
                Owners Association (R)
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Auth CTA Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => handleNavClick('owner-portal')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      currentView === 'owner-portal'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Owner Portal</span>
                  </button>
                )}

                {isCommittee && (
                  <button
                    onClick={() => handleNavClick('admin-portal')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      currentView === 'admin-portal'
                        ? 'bg-emerald-950 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <div className="border-l border-slate-200 pl-2">
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('OWNER')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Owner Login</span>
                </button>

                <button
                  onClick={() => openAuthModal('ADMIN')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {user ? (
              <button
                onClick={() => handleNavClick(isOwner ? 'owner-portal' : 'admin-portal')}
                className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3" />
                <span>Portal</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('OWNER')}
                className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-emerald-900 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    isActive ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-emerald-700" />}
                    <span>{link.label}</span>
                  </div>
                  {isActive && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}

            {/* Mobile Auth actions */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  {isOwner && (
                    <button
                      onClick={() => handleNavClick('owner-portal')}
                      className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Open Resident Portal</span>
                    </button>
                  )}
                  {isCommittee && (
                    <button
                      onClick={() => handleNavClick('admin-portal')}
                      className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Admin Management Console</span>
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="w-full py-2 text-center text-sm font-semibold text-red-600 cursor-pointer"
                  >
                    Sign Out ({user.name})
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); openAuthModal('OWNER'); }}
                    className="py-2.5 bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Owner Login</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); openAuthModal('ADMIN'); }}
                    className="py-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
