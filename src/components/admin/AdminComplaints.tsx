import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Update modal
  const [selectedCmp, setSelectedCmp] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed'>('In Progress');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = () => {
    api.getAdminComplaints({ status: statusFilter, category: categoryFilter })
      .then(res => setComplaints(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCmp) return;
    setSubmitting(true);
    try {
      await api.updateComplaint(selectedCmp.id, {
        status: newStatus,
        adminRemarks: remarks
      });
      setSelectedCmp(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Complaints & Operations Helpdesk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign maintenance staff, monitor layout resolution timelines, and close resident tickets.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No complaints found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{c.complaint_number}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-emerald-800">{c.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{c.created_at}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{c.subject}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.description}</p>
                  <p className="text-[11px] text-slate-500">
                    Site #{c.site_number} · Owner: <strong>{c.owner_name}</strong> (+91 {c.primary_mobile}) · Location: {c.location}
                  </p>

                  {c.admin_remarks && (
                    <div className="p-2.5 bg-slate-100 rounded text-xs text-slate-700 mt-2">
                      <strong>Resolution Note:</strong> {c.admin_remarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => { setSelectedCmp(c); setNewStatus(c.status as any); setRemarks(c.admin_remarks || ''); }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Update Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedCmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Update Ticket: {selectedCmp.complaint_number}</h3>
              <button onClick={() => setSelectedCmp(null)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress (Supervisor Assigned)</option>
                  <option value="Resolved">Resolved / Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Remarks / Action Taken</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Electrician replaced street light ballast on 28 Sep..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Save Ticket Status'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
