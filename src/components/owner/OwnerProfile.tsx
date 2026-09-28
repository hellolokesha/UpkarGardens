import React from 'react';
import { User, Home, Phone, Mail, MapPin, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { Property, Owner } from '../../types';

interface OwnerProfileProps {
  owner: Owner;
  property: Property;
}

export const OwnerProfile: React.FC<OwnerProfileProps> = ({ owner, property }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Registered Owner & Property Dossier</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official membership information registered in Upkar Gardens layout records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Owner Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Primary Registered Owner</span>
              <span className="text-sm font-bold text-slate-900">{owner.owner_name}</span>
            </div>

            {owner.joint_owners && (
              <div>
                <span className="text-slate-400 block font-medium">Joint Owner(s)</span>
                <span className="text-sm font-semibold text-slate-800">{owner.joint_owners}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 block font-medium">Ownership Structure</span>
              <span className="text-slate-800 font-semibold">{owner.ownership_type || 'Individual'}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span className="font-mono text-slate-900 font-bold">Primary: +91 {owner.primary_mobile}</span>
              </div>
              {owner.alt_mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-slate-600">Alternate: +91 {owner.alt_mobile}</span>
                </div>
              )}
              {owner.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span className="text-slate-700">{owner.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium">Correspondence Address</span>
              <span className="text-slate-700 leading-relaxed block mt-0.5">
                {owner.correspondence_address || `Site #${property.site_number}, Upkar Gardens, Bangalore`}
              </span>
            </div>
          </div>
        </div>

        {/* Property Coordinates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 border-b border-slate-100 pb-3">
            <Home className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Property & Layout Details
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Site Number</span>
              <span className="text-lg font-bold font-mono text-emerald-950">Site #{property.site_number}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">House Number</span>
              <span className="text-lg font-bold font-mono text-slate-900">{property.house_number || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Layout Phase / Block</span>
              <span className="text-slate-800 font-semibold">{property.block_phase || 'Phase 1'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Property Category</span>
              <span className="text-slate-800 font-semibold">{property.property_type || 'Plot / Site'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Occupancy Status</span>
              <span className="text-slate-800 font-semibold">{property.status} ({property.occupancy_status || 'Self'})</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Monthly Maintenance</span>
              <span className="text-emerald-950 font-bold font-mono text-sm">₹{property.monthly_maintenance}/mo</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block font-medium">Registered Layout Location</span>
            <span className="text-slate-700 leading-relaxed block mt-0.5">
              {property.address || `Plot No. ${property.site_number}, Upkar Gardens, Chandapura-Anekal Main Road, Bangalore 560099`}
            </span>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Official member of Upkar Gardens Owners Association (R).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
