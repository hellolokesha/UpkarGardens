import React from 'react';
import { ShieldCheck, MapPin, Award, CheckCircle, FileText, Calendar, Building, Users, Phone, Mail, Clock } from 'lucide-react';
import { useAssociation } from '../../context/AssociationContext';

export const AboutView: React.FC = () => {
  const { 
    regNo, regDate, totalSites, address, phone, emergencyPhone, email,
    adminName, adminPhone, adminEmail, cmsUpdatedDate, mission, vision 
  } = useAssociation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
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

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 shrink-0 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-emerald-700" />
          <div className="text-xs">
            <span className="text-emerald-800 font-semibold block">Website CMS Synchronized:</span>
            <span className="font-mono font-bold text-emerald-950">{cmsUpdatedDate}</span>
          </div>
        </div>
      </div>

      {/* Statutory Registration Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Registration Number</span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">{regNo}</div>
          <div className="text-[11px] text-slate-500 mt-1">Regd under Karnataka Societies Act 1960</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Registration Date</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{regDate}</div>
          <div className="text-[11px] text-slate-500 mt-1">Recognized layout authority</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Layout Extent</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{totalSites} Demarcated Sites</div>
          <div className="text-[11px] text-slate-500 mt-1">Divided into North Block & South Block</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Location & Address</span>
          </div>
          <div className="text-sm font-bold text-slate-900 line-clamp-1">{address}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bangalore Urban District - 560099</div>
        </div>
      </div>

      {/* Administration & Governance Details Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-base text-slate-900">Official Association Administration & Leadership</h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-1 rounded-full">
            Active Term 2024–2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Principal Admin / President</span>
            <div className="text-sm font-bold text-slate-900">{adminName}</div>
            <p className="text-xs text-slate-500">Official Executive Head of Association</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Admin Direct Phone</span>
            <div className="text-sm font-mono font-bold text-emerald-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{adminPhone}</span>
            </div>
            <p className="text-xs text-slate-500">Association Helpline & Executive Reach</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Admin Official Email</span>
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{adminEmail}</span>
            </div>
            <p className="text-xs text-slate-500">Official Correspondence Desk</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-950 text-white p-8 rounded-2xl relative overflow-hidden">
          <div className="text-amber-400 font-serif font-bold text-lg mb-2">Our Mission</div>
          <p className="text-emerald-100 text-sm leading-relaxed">
            {mission}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>Accountability & Financial Transparency</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden">
          <div className="text-emerald-400 font-serif font-bold text-lg mb-2">Our Vision</div>
          <p className="text-slate-200 text-sm leading-relaxed">
            {vision}
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
              Equipped with automated RFID boom barriers, CCTV surveillance across all junctions, and round-the-clock trained security personnel. Security Gate Phone: <strong className="font-mono text-emerald-900">{emergencyPhone}</strong>.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-900">Dedicated Water Supply Grid</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multiple high-yield deep borewells connected to automated overhead balancing reservoirs ensuring regular distribution to all houses in North Block and South Block.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-900">Civic Cleanliness & Waste Disposal</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daily door-to-door segregated waste collection, avenue tree maintenance, and regular stormwater drain desilting across all layout streets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
