import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssociationProvider } from './context/AssociationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';

// Public views
import { HomeView } from './components/public/HomeView';
import { AboutView } from './components/public/AboutView';
import { CommitteeView } from './components/public/CommitteeView';
import { NoticesView } from './components/public/NoticesView';
import { EventsView } from './components/public/EventsView';
import { DocumentsView } from './components/public/DocumentsView';
import { RulesView } from './components/public/RulesView';
import { ContactView } from './components/public/ContactView';
import { VerifyNocView } from './components/public/VerifyNocView';

// Portals
import { OwnerPortal } from './components/owner/OwnerPortal';
import { AdminPortal } from './components/admin/AdminPortal';

function MainApp() {
  const { user, isOwner, isCommittee } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'OWNER' | 'ADMIN'>('OWNER');
  const [nocVerifyQuery, setNocVerifyQuery] = useState<string>('');

  // Handle URL params if any
  useEffect(() => {
    const handleUrlState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const searchParams = new URLSearchParams(window.location.search);
      const nocParam = searchParams.get('noc') || searchParams.get('query');

      if (path === 'verify-noc' || nocParam) {
        setCurrentView('verify-noc');
        if (nocParam) setNocVerifyQuery(nocParam);
      } else if (path === 'admin') {
        if (isCommittee) {
          setCurrentView('admin-portal');
        } else {
          openAuthModal('ADMIN');
        }
      }
    };

    handleUrlState();
    window.addEventListener('popstate', handleUrlState);
    return () => window.removeEventListener('popstate', handleUrlState);
  }, [isCommittee]);

  // When user logs in, route them appropriately
  useEffect(() => {
    if (user) {
      if (isOwner && currentView === 'home') {
        setCurrentView('owner-portal');
      } else if (isCommittee && currentView === 'home') {
        setCurrentView('admin-portal');
      }
    }
  }, [user]);

  const openAuthModal = (tab: 'OWNER' | 'ADMIN' = 'OWNER') => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const handleNavigate = (viewStr: string) => {
    if (viewStr.startsWith('verify-noc?query=')) {
      const q = decodeURIComponent(viewStr.split('?query=')[1]);
      setNocVerifyQuery(q);
      setCurrentView('verify-noc');
    } else {
      setCurrentView(viewStr);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Admin Screen
  if (currentView === 'admin-portal') {
    if (!isCommittee) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full text-center space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Administrator Access Required</h3>
            <p className="text-xs text-slate-600">
              Please log in with committee administrator credentials to view this console.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => openAuthModal('ADMIN')}
                className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Log In as Admin
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Back to Website
              </button>
            </div>
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              defaultTab={authDefaultTab}
            />
          </div>
        </div>
      );
    }
    return (
      <AdminPortal onBackToWebsite={() => setCurrentView('home')} />
    );
  }

  // Dedicated Owner Portal Screen
  if (currentView === 'owner-portal') {
    if (!isOwner) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full text-center space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Resident Login Required</h3>
            <p className="text-xs text-slate-600">
              Please authenticate with your registered Site Number and mobile number to open your personal portal.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => openAuthModal('OWNER')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Owner Login
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Back to Website
              </button>
            </div>
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              defaultTab={authDefaultTab}
            />
          </div>
        </div>
      );
    }
    return (
      <>
        <Navbar
          currentView={currentView}
          setCurrentView={handleNavigate}
          openAuthModal={openAuthModal}
        />
        <OwnerPortal />
        <Footer
          setCurrentView={handleNavigate}
          openAuthModal={openAuthModal}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        openAuthModal={openAuthModal}
      />

      {/* Main Public Body */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            setCurrentView={handleNavigate}
            openAuthModal={openAuthModal}
          />
        )}
        {currentView === 'about' && <AboutView />}
        {currentView === 'committee' && <CommitteeView />}
        {currentView === 'notices' && <NoticesView />}
        {currentView === 'events' && <EventsView />}
        {currentView === 'documents' && <DocumentsView />}
        {currentView === 'rules' && <RulesView />}
        {currentView === 'contact' && <ContactView />}
        {currentView === 'verify-noc' && (
          <VerifyNocView initialQuery={nocVerifyQuery} />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentView={handleNavigate}
        openAuthModal={openAuthModal}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AssociationProvider>
        <MainApp />
      </AssociationProvider>
    </AuthProvider>
  );
}
