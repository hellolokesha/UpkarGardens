import React, { useState, useEffect } from 'react';
import { Phone, Mail, Award, Shield, User } from 'lucide-react';
import { api } from '../../services/api';
import { CommitteeMember } from '../../types';

export const CommitteeView: React.FC = () => {
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCommittee()
      .then(res => setCommittee(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Association Leadership
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Managing Committee (2024 – 2026)
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Elected representatives entrusted by the General Body of Upkar Gardens Owners Association (R) 
          to govern layout operations, finance, infrastructure development, and community welfare.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading committee directory...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {committee.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm transition"
            >
              <div className="p-6 flex items-start gap-4">
                <img
                  src={member.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80'}
                  alt={member.name}
                  className="w-18 h-18 rounded-xl object-cover border-2 border-emerald-800 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{member.name}</h3>
                  <div className="text-xs font-bold text-emerald-800">{member.designation}</div>
                  <div className="text-[11px] text-slate-500">Term: 2024 – 2026</div>
                </div>
              </div>

              {/* Contact strip if authorized by Admin */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                {member.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-mono text-slate-800">{member.phone}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Contact via Association Desk: +91 80 2783 4567
                  </div>
                )}

                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-slate-700">{member.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Governance Note */}
      <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
        <Award className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold mb-1">Democratic Association Bylaws</strong>
          Committee elections are held biennially during the Annual General Body Meeting (AGM) as per the Karnataka Societies Registration Act. All active property owners are eligible to participate and vote.
        </div>
      </div>
    </div>
  );
};
