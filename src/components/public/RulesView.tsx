import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { RuleRegulation } from '../../types';

export const RulesView: React.FC = () => {
  const [rules, setRules] = useState<RuleRegulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRules()
      .then(res => setRules(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Association Bylaws
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Rules & Regulations
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Standard code of conduct, construction protocols, vehicle speed limits, and waste segregation norms approved by the General Body.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading layout bylaws...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center font-mono text-emerald-900">
                  {idx + 1}
                </span>
                <span>{rule.category}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{rule.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rule.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold mb-1">Compliance & Layout Harmony</strong>
          All plot owners, contractors, and tenants are strictly required to adhere to these registered bylaws. Violations involving road excavation or debris dumping are subject to restoration charges.
        </div>
      </div>
    </div>
  );
};
