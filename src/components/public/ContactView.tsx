import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.submitContact(formData);
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Association Office
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Contact Us & Office Hours
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Reach out to the Association Managing Committee, Layout Supervisor, or 24/7 Security Gate Desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Association Office Address
            </h3>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Upkar Gardens Clubhouse Office</strong>
                  <span>Chandapura-Anekal Main Road, Bangalore Urban - 560099, Karnataka</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">General Inquiries / Office:</span>
                  <span className="font-mono font-bold text-slate-900">+91 80 2783 4567</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">24/7 Security & Emergency Gate Desk:</span>
                  <span className="font-mono font-bold text-emerald-900">+91 94801 23456</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Official Association Email:</span>
                  <span className="text-slate-900 font-medium">contact@upkargardens.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-2 border-t border-slate-100">
                <Clock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Association Office Timings</strong>
                  <span className="text-xs text-slate-600">
                    Monday to Saturday: 9:30 AM – 1:00 PM & 4:30 PM – 7:00 PM<br />
                    Sunday: 10:00 AM – 1:00 PM (Committee Resident Walk-in)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Send an Inquiry or Feedback</h3>
          <p className="text-xs text-slate-500 mb-6">
            Members, prospective owners, or visitors can send messages directly to the Secretary's desk.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-base">Message Sent Successfully</h4>
              <p className="text-xs text-slate-600">
                Thank you. Your communication has been dispatched to the Upkar Gardens Association Office.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Site Maintenance, Construction Inquiry, Water connection"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Detail *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? <span>Sending...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
