import React, { useState, useEffect } from 'react';
import { FolderDown, FileText, Download, ShieldCheck, Search } from 'lucide-react';
import { api } from '../../services/api';
import { AssociationDocument } from '../../types';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<AssociationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    api.getDocuments()
      .then(res => setDocuments(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', 'Rules & Regulations', 'Association Documents', 'Financial Documents', 'Forms'];

  const filtered = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                          (d.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || d.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Public Repository
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Association Documents & Forms
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Download registered society bylaws, sanctioned layout demarcation plans, construction compliance guidelines, and prescribed application forms.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                category === c
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c === 'ALL' ? 'All Documents' : c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          <FolderDown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No documents found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">
                    {doc.category} · <span className="font-mono">{doc.file_type} ({doc.file_size})</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
