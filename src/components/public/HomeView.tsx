import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CreditCard, FileCheck, Bell, FolderDown, MessageSquare, 
  ArrowRight, Calendar, Users, CheckCircle2, AlertTriangle, Search
} from 'lucide-react';
import { api } from '../../services/api';
import { Notice, Announcement, EventItem, CommitteeMember } from '../../types';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (tab?: 'OWNER' | 'ADMIN') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setCurrentView, openAuthModal }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [quickNocSearch, setQuickNocSearch] = useState('');

  useEffect(() => {
    api.getNotices().then(res => setNotices(res || [])).catch(() => {});
    api.getAnnouncements().then(res => setAnnouncements(res || [])).catch(() => {});
    api.getEvents().then(res => setEvents(res || [])).catch(() => {});
    api.getCommittee().then(res => setCommittee((res || []).slice(0, 4))).catch(() => {});
  }, []);

  const handleQuickNocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNocSearch.trim()) return;
    setCurrentView(`verify-noc?query=${encodeURIComponent(quickNocSearch.trim())}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-radial from-emerald-900 via-emerald-950 to-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-emerald-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-600/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Official Registered Society · No. DRO-1/SOR/142/2018-19</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif">
              Welcome to Upkar Gardens Owners Association (R)
            </h1>

            <p className="text-lg sm:text-xl text-emerald-100 font-medium">
              A connected community working together for a better Upkar Gardens.
            </p>

            <p className="text-sm text-emerald-200/90 max-w-2xl mx-auto leading-relaxed">
              Access maintenance payments, property information, NOC applications, notices and association services through one secure portal.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => openAuthModal('OWNER')}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span>OWNER LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openAuthModal('OWNER')}
                className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md border border-emerald-600 hover:border-emerald-500 transition cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-300" />
                <span>PAY MAINTENANCE</span>
              </button>

              <button
                onClick={() => openAuthModal('OWNER')}
                className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                <span>APPLY FOR NOC</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Quick Action Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            Resident Services Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Frequently Used Association Services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Owner Login */}
          <div
            onClick={() => openAuthModal('OWNER')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                Owner Login
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Access your property and association information, verified mobile number, and personal dashboard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>Log in to portal</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Maintenance Payment */}
          <div
            onClick={() => openAuthModal('OWNER')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                Maintenance Payment
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                View pending maintenance dues, download ledger statements, and make instant online payments via UPI or Net Banking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>View & pay dues</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: NOC Application */}
          <div
            onClick={() => openAuthModal('OWNER')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                NOC Application
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Apply for Sale, Bank Loan, Construction, or Renovation NOC online, upload documents, and track progress.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>Apply or track status</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Notices */}
          <div
            onClick={() => setCurrentView('notices')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                Notices & Circulars
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Stay updated with the latest official association circulars, water supply schedules, and AGM notifications.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>Read notice board</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 5: Documents */}
          <div
            onClick={() => setCurrentView('documents')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <FolderDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                Association Documents
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Download registered association bylaws, layout sanction map, construction guidelines, and offline forms.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>Browse repository</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 6: Complaints */}
          <div
            onClick={() => openAuthModal('OWNER')}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                Complaints & Requests
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Raise and track layout-related issues including streetlights, water supply, security, and garbage disposal.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <span>Submit service request</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Key Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-serif">350</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Layout Sites / Plots</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-serif">45+</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Acres Gated Community</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-serif">24/7</div>
            <div className="text-xs text-slate-300 font-medium mt-1">RFID Security & CCTV</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-serif">100%</div>
            <div className="text-xs text-slate-300 font-medium mt-1">LED & Borewell Grid</div>
          </div>
        </div>
      </section>

      {/* Public NOC Verification Search Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Public Verification Registry</span>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-950">
              Verify Authenticity of an Issued NOC Certificate
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Banks, financial institutions, registrars, and prospective buyers can instantly verify certificates issued by the association.
            </p>
          </div>

          <form onSubmit={handleQuickNocSubmit} className="flex w-full md:w-auto items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter NOC No (e.g. UGOA/NOC/2026/00042)"
                value={quickNocSearch}
                onChange={(e) => setQuickNocSearch(e.target.value)}
                className="w-full bg-white pl-9 pr-3 py-2.5 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition whitespace-nowrap cursor-pointer shadow-xs"
            >
              Verify Now
            </button>
          </form>
        </div>
      </section>

      {/* Latest Notices & Announcements Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Col 1 & 2: Notices */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Notice Board</span>
                <h3 className="text-lg font-bold text-slate-900">Important Association Circulars</h3>
              </div>
              <button
                onClick={() => setCurrentView('notices')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setCurrentView('notices')}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-emerald-800">{notice.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Published {notice.publish_date}</span>
                    {notice.priority === 'Urgent' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Urgent Notice</span>
                        </span>
                      </>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug hover:text-emerald-800 transition">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Upcoming Meetings & Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Calendar</span>
                <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
              </div>
              <button
                onClick={() => setCurrentView('events')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {events.slice(0, 2).map((ev) => (
                <div key={ev.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>{ev.event_date} · {ev.event_time}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.event_name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    Venue: <span className="font-medium text-slate-700">{ev.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Committee Showcase Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Elected Committee</span>
              <h3 className="text-xl font-bold text-slate-900">Managing Committee (2024–2026)</h3>
            </div>
            <button
              onClick={() => setCurrentView('committee')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
            >
              <span>View full committee list</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {committee.map((member) => (
              <div key={member.id} className="flex items-center gap-3.5">
                <img
                  src={member.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop&q=80'}
                  alt={member.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-emerald-700 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                  <p className="text-xs text-emerald-800 font-semibold">{member.designation}</p>
                  <p className="text-[11px] text-slate-500">Term: 2024–2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
