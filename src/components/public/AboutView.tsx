import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Award, CheckCircle, FileText, Calendar, Building, Users } from 'lucide-react';
import { api } from '../../services/api';

export const AboutView: React.FC = () => {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    api.getAssociationInfo().then(setInfo).catch(() => {});
  }, []);

  const s = info?.settings || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Registered Association Profile
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          About Upkar Gardens Owners Association (R)
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          The democratic, statutory residential association constituted for the protection, maintenance, 
          infrastructure enhancement, and harmonious welfare of all layout plot and villa owners in Upkar Gardens.
        </p>
      </div>

      {/* Statutory Registration Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Registration Number</span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">{s.registration_number || 'DRO-1/SOR/142/2018-19'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Regd under Karnataka Societies Act 1960</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Registration Date</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{s.registration_date || '12 October 2018'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Recognized layout authority</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Layout Extent</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{s.total_sites_count || '350'} Demarcated Sites</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 45 Acres in Phase 1 & 2</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Location & Taluk</span>
          </div>
          <div className="text-sm font-bold text-slate-900">Chandapura-Anekal Main Rd</div>
          <div className="text-[11px] text-slate-500 mt-1">Bangalore Urban District - 560099</div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-950 text-white p-8 rounded-2xl relative overflow-hidden">
          <div className="text-amber-400 font-serif font-bold text-lg mb-2">Our Mission</div>
          <p className="text-emerald-100 text-sm leading-relaxed">
            {s.about_mission || 'To foster a secure, clean, self-sustaining, vibrant residential community with transparent governance, dependable infrastructure, and equitable association services for every property owner.'}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>Accountability & Financial Transparency</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden">
          <div className="text-emerald-400 font-serif font-bold text-lg mb-2">Our Vision</div>
          <p className="text-slate-200 text-sm leading-relaxed">
            {s.about_vision || 'To establish Upkar Gardens as one of Bangalore South’s model eco-friendly, green, and technologically connected residential layouts.'}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Sustainable Living & Green Canopy</span>
          </div>
        </div>
      </div>

      {/* Layout Infrastructure Highlights */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Layout Amenities & Civic Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-slate-700">
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-900">24/7 Security & Access Control</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipped with automated RFID boom barriers, CCTV surveillance across all junctions, and round-the-clock trained security personnel.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-900">Dedicated Water Supply Grid</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multiple high-yield deep borewells connected to automated overhead balancing reservoirs ensuring regular distribution to all houses.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-900">Civic Cleanliness & Waste Disposal</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daily door-to-door segregated waste collection, avenue tree maintenance, and regular stormwater drain desilting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
