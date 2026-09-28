import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertTriangle, Calendar, FileText, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api';
import { Notice } from '../../types';

export const NoticesView: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  useEffect(() => {
    api.getNotices()
      .then(res => setNotices(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', 'General', 'Maintenance Notice', 'Meeting Notice', 'Water Notice', 'Security Notice'];

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || n.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Official Communications
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Notices & Circulars
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Stay informed on official announcements, layout maintenance schedules, water supply updates, and statutory general meetings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading notice board...</div>
      ) : filteredNotices.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No notices found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActiveNotice(notice)}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-emerald-800">{notice.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{notice.publish_date}</span>
                  {notice.priority === 'Urgent' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Urgent</span>
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-800 transition">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {notice.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Audience: {notice.audience}</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <span>Read full notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Detail Modal */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-6 relative">
              <button
                onClick={() => setActiveNotice(null)}
                className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-emerald-300 mb-2">
                <span>{activeNotice.category}</span>
                <span aria-hidden="true">·</span>
                <span>Published {activeNotice.publish_date}</span>
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">{activeNotice.title}</h3>
            </div>

            <div className="p-6 text-sm text-slate-800 leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{activeNotice.description}</p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Target Audience:</span> {activeNotice.audience}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Priority:</span> {activeNotice.priority}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveNotice(null)}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
