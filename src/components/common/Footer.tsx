import React from 'react';
import { Shield, Phone, Mail, MapPin, ExternalLink, Award } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  openAuthModal: (tab?: 'OWNER' | 'ADMIN') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, openAuthModal }) => {
  const handleNav = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-emerald-950 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Association Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-white text-base tracking-tight">
                  UPKAR GARDENS OWNERS ASSOCIATION (R)
                </span>
                <span className="block text-[11px] text-emerald-400 font-medium tracking-wider uppercase">
                  Reg No: DRO-1/SOR/142/2018-19
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              The official statutory body representing all layout plot and house owners of Upkar Gardens. 
              Dedicated to transparent governance, infrastructure upkeep, 24x7 security, water management, 
              and community welfare.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-300 text-xs">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Model Residential Layout Community · Bangalore South</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-emerald-400 transition cursor-pointer">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-emerald-400 transition cursor-pointer">
                  About Association
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('committee')} className="hover:text-emerald-400 transition cursor-pointer">
                  Managing Committee
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('notices')} className="hover:text-emerald-400 transition cursor-pointer">
                  Notices & Circulars
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('events')} className="hover:text-emerald-400 transition cursor-pointer">
                  Layout Meetings & Events
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-emerald-400 transition cursor-pointer">
                  Rules & Bylaws
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Resident Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Resident Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openAuthModal('OWNER')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1 text-emerald-400 font-medium">
                  <span>Owner Login</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('OWNER')} className="hover:text-emerald-400 transition cursor-pointer">
                  Pay Maintenance Online
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('OWNER')} className="hover:text-emerald-400 transition cursor-pointer">
                  Apply for NOC Online
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('verify-noc')} className="hover:text-amber-300 transition cursor-pointer font-semibold text-amber-400">
                  Verify Issued NOC Certificate
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('documents')} className="hover:text-emerald-400 transition cursor-pointer">
                  Download Association Forms
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('ADMIN')} className="hover:text-slate-200 transition cursor-pointer text-slate-500">
                  Committee Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Association Desk
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Clubhouse Office, Upkar Gardens, Chandapura-Anekal Rd, Bangalore 560099</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-slate-300">+91 80 2783 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Security Desk: <strong className="font-mono text-white">+91 94801 23456</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">contact@upkargardens.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Strip */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Upkar Gardens Owners Association (R). All Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => handleNav('rules')} className="hover:text-slate-300 transition cursor-pointer">
              Bylaws & Terms
            </button>
            <span>·</span>
            <button onClick={() => handleNav('about')} className="hover:text-slate-300 transition cursor-pointer">
              Privacy Policy
            </button>
            <span>·</span>
            <button onClick={() => handleNav('verify-noc')} className="hover:text-slate-300 transition cursor-pointer">
              NOC Verification Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
