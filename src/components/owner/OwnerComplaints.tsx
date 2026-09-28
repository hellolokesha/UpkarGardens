import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, CheckCircle2, Clock, AlertTriangle, Send, X } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

interface OwnerComplaintsProps {
  propertyId: string;
  siteNumber: string;
}

export const OwnerComplaints: React.FC<OwnerComplaintsProps> = ({ propertyId, siteNumber }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  // Form
  const [category, setCategory] = useState('Water');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(`Opposite Site #${siteNumber}`);
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Water', 'Electricity', 'Road', 'Drainage', 'Security', 
    'Street Lights', 'Garbage', 'Common Area', 'Maintenance', 'Other'
  ];

  const fetchComplaints = () => {
    api.getOwnerComplaints()
      .then(res => setComplaints(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitComplaint({
        category,
        subject,
        description,
        location,
        priority
      });
      setShowRaiseModal(false);
      setSubject('');
      setDescription('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Complaints & Layout Service Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log and track resolution for streetlights, water supply, security patrols, and civic maintenance.
          </p>
        </div>

        <button
          onClick={() => setShowRaiseModal(true)}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Request</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading requests...</div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No active complaints logged</p>
            <p>Everything looks good! Click "Raise New Request" if you encounter any layout issues.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{c.complaint_number}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-emerald-800">{c.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{c.created_at}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{c.subject}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                  <p className="text-[11px] text-slate-400">Location: {c.location}</p>

                  {c.admin_remarks && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-950 border border-emerald-200 mt-2">
                      <strong>Association Supervisor Note:</strong> {c.admin_remarks}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Raise a Complaint / Request</h3>
              <button onClick={() => setShowRaiseModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  placeholder="e.g. Street light malfunctioning near pole #14"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Location / Landmark</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent (e.g. major water leak, power failure)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {submitting ? <span>Logging request...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Service Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
