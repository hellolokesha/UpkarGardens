import React, { useState, useEffect } from 'react';
import { FileCheck, Search, CheckCircle2, XCircle, Clock, AlertTriangle, Printer, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { NocApplication } from '../../types';
import { NocCertificateModal } from '../common/NocCertificateModal';

export const AdminNoc: React.FC = () => {
  const [applications, setApplications] = useState<NocApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Action Modal
  const [selectedApp, setSelectedApp] = useState<NocApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_DOCS' | 'REQUEST_PAYMENT'>('APPROVE');
  const [actionRemarks, setActionRemarks] = useState('');

  // Issue Certificate Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [validMonths, setValidMonths] = useState(12);
  const [signatoryName, setSignatoryName] = useState('Sri. K. Venkatesh');
  const [signatoryRole, setSignatoryRole] = useState('President, UGOA (R)');
  const [customWording, setCustomWording] = useState('');

  // View Modal
  const [viewingNoc, setViewingNoc] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchApps = () => {
    api.getAdminNocApplications({ status: statusFilter })
      .then(res => setApplications(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  const handleOpenAction = (app: NocApplication, act: 'APPROVE' | 'REJECT' | 'REQUEST_DOCS' | 'REQUEST_PAYMENT') => {
    setSelectedApp(app);
    setActionType(act);
    setActionRemarks('');
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      await api.actionNocApplication({
        applicationId: selectedApp.id,
        action: actionType,
        remarks: actionRemarks
      });
      setSelectedApp(null);
      fetchApps();
    } catch (err: any) {
      alert(err.message || 'Failed to update NOC status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenIssue = (app: NocApplication) => {
    setSelectedApp(app);
    setValidMonths(12);
    setCustomWording('');
    setShowIssueModal(true);
  };

  const handleExecuteIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const res = await api.issueNocCertificate({
        applicationId: selectedApp.id,
        validMonths,
        customContent: customWording || undefined,
        signatoryName,
        signatoryDesignation: signatoryRole
      });
      alert(`NOC Certificate #${res.nocNumber} issued successfully!`);
      setShowIssueModal(false);
      setSelectedApp(null);
      fetchApps();
    } catch (err: any) {
      alert(err.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewNoc = async (nocNumber: string) => {
    try {
      const data = await api.verifyNoc(nocNumber);
      if (data && data.noc) {
        setViewingNoc(data.noc);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">NOC Applications & Issuance Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review applicant documents, verify zero-dues clearance, and issue digitally signed certificates.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        >
          <option value="">All Application Statuses</option>
          <option value="Submitted">Submitted (New)</option>
          <option value="Under Review">Under Review</option>
          <option value="Documents Required">Documents Required</option>
          <option value="Approved">Approved / Ready to Issue</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No applications found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{app.application_number}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-emerald-800">{app.noc_type_name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{app.created_at}</span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    Site #{app.site_number} · Owner: {app.owner_name} (+91 {app.primary_mobile})
                  </div>
                  <p className="text-xs text-slate-700 font-medium">Purpose: {app.purpose}</p>

                  {/* Dues Alert */}
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className={`font-mono font-bold ${
                      (app.outstanding_balance || 0) > 0 ? 'text-amber-900' : 'text-emerald-800'
                    }`}>
                      Outstanding Maintenance: ₹{Number(app.outstanding_balance || 0).toLocaleString('en-IN')}
                    </span>
                    {(app.outstanding_balance || 0) > 0 && (
                      <span className="text-amber-700 text-[11px] font-semibold">(Pending Dues!)</span>
                    )}
                  </div>

                  {app.admin_remarks && (
                    <div className="p-2 bg-slate-100 rounded text-xs text-slate-700">
                      <strong>Remarks:</strong> {app.admin_remarks}
                    </div>
                  )}

                  {/* Attached Documents */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span>Documents:</span>
                      {app.documents.map((d, i) => (
                        <span key={i} className="inline-flex items-center gap-1 font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-emerald-700" />
                          <span>{d.document_name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    app.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {app.status}
                  </span>

                  {app.issued_noc_number ? (
                    <button
                      onClick={() => handleViewNoc(app.issued_noc_number!)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Issued NOC</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAction(app, 'APPROVE')}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenIssue(app)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Issue Certificate
                      </button>
                      <button
                        onClick={() => handleOpenAction(app, 'REJECT')}
                        className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal (Approve / Reject / Req docs) */}
      {selectedApp && !showIssueModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Review Action: {selectedApp.application_number}</h3>
              <button onClick={() => setSelectedApp(null)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Status</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="APPROVE">Approve Application</option>
                  <option value="REJECT">Reject Application</option>
                  <option value="REQUEST_DOCS">Request Additional Documents</option>
                  <option value="REQUEST_PAYMENT">Request NOC Fee Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Committee Remarks to Applicant</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter remarks visible to the property owner..."
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Confirm Action'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Official Certificate Modal */}
      {showIssueModal && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Generate Official NOC Certificate</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteIssue} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><strong>Site Number:</strong> Site #{selectedApp.site_number}</div>
                <div><strong>Owner:</strong> {selectedApp.owner_name}</div>
                <div><strong>Purpose:</strong> {selectedApp.purpose}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Validity (Months)</label>
                  <input
                    type="number"
                    value={validMonths}
                    onChange={(e) => setValidMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Designation</label>
                  <input
                    type="text"
                    value={signatoryRole}
                    onChange={(e) => setSignatoryRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Certificate Wording (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Leave empty for standard statutory association wording..."
                  value={customWording}
                  onChange={(e) => setCustomWording(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Generating...' : 'Issue Serial NOC with QR Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingNoc && (
        <NocCertificateModal
          noc={viewingNoc}
          qrCodeSvg={viewingNoc.qrCodeSvg}
          onClose={() => setViewingNoc(null)}
        />
      )}
    </div>
  );
};
