import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Plus, CheckCircle2, Clock, AlertCircle, 
  Printer, ArrowRight, X, Upload, ShieldAlert, FileText 
} from 'lucide-react';
import { api } from '../../services/api';
import { NocApplication, NocType } from '../../types';
import { NocCertificateModal } from '../common/NocCertificateModal';

interface OwnerNocProps {
  propertyId: string;
  siteNumber: string;
  totalOutstanding: number;
}

export const OwnerNoc: React.FC<OwnerNocProps> = ({ propertyId, siteNumber, totalOutstanding }) => {
  const [applications, setApplications] = useState<NocApplication[]>([]);
  const [nocTypes, setNocTypes] = useState<NocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeIssuedNoc, setActiveIssuedNoc] = useState<any | null>(null);

  // Apply Form State
  const [selectedType, setSelectedType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [bankName, setBankName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ documentName: string; fileName: string; fileUrl: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchApps = () => {
    Promise.all([api.getOwnerNocApplications(), api.getNocTypes()])
      .then(([apps, types]) => {
        setApplications(apps || []);
        setNocTypes(types || []);
        if (types && types.length > 0 && !selectedType) {
          setSelectedType(types[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, [propertyId]);

  const activeTypeObj = nocTypes.find(t => t.id === selectedType);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !purpose) {
      setFormError('Please select NOC type and state the specific purpose.');
      return;
    }

    if (totalOutstanding > 0) {
      setFormError(`Cannot submit NOC: Your property has pending maintenance dues of ₹${totalOutstanding.toLocaleString('en-IN')}. Please clear dues before applying.`);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await api.submitNocApplication({
        nocTypeId: selectedType,
        purpose,
        description,
        buyerName,
        bankName,
        documents: uploadedFiles
      });
      setShowApplyModal(false);
      setPurpose('');
      setDescription('');
      setBuyerName('');
      setBankName('');
      setUploadedFiles([]);
      fetchApps();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const simulateFileUpload = (reqName: string) => {
    const fakeFileName = `${reqName.replace(/[^a-zA-Z0-9]/g, '_')}_Site${siteNumber}.pdf`;
    const newDoc = {
      documentName: reqName,
      fileName: fakeFileName,
      fileUrl: `/docs/uploads/${fakeFileName}`
    };
    setUploadedFiles(prev => [...prev.filter(d => d.documentName !== reqName), newDoc]);
  };

  const handleViewIssuedNoc = async (app: NocApplication) => {
    if (app.issued_noc_number) {
      try {
        const data = await api.verifyNoc(app.issued_noc_number);
        if (data && data.noc) {
          setActiveIssuedNoc(data.noc);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">No Objection Certificate (NOC) Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Apply online for sale clearance, building construction, or bank loan mortgage clearances.
          </p>
        </div>

        <button
          onClick={() => { setShowApplyModal(true); setFormError(null); }}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for New NOC</span>
        </button>
      </div>

      {/* Dues Status Notice Banner */}
      {totalOutstanding > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Maintenance Dues Clearance Required</strong>
            <span>
              Your account shows an outstanding balance of <strong>₹{totalOutstanding.toLocaleString('en-IN')}</strong>. 
              As per association bylaws, zero dues clearance is mandatory prior to issuance of NOC. Please clear pending maintenance before applying.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Dues Clearance Status: <strong>Zero Outstanding Balance</strong> · Eligible for immediate NOC application.</span>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading NOC applications...</div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No NOC applications found for Site #{siteNumber}</p>
            <p>Click "Apply for New NOC" to initiate an online request.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{app.application_number}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-emerald-800">{app.noc_type_name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{app.created_at}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{app.purpose}</h3>
                  {app.description && <p className="text-xs text-slate-600">{app.description}</p>}

                  {app.admin_remarks && (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-700 border border-slate-200">
                      <strong>Committee Remarks:</strong> {app.admin_remarks}
                    </div>
                  )}

                  {app.documents && app.documents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span>Attached:</span>
                      {app.documents.map((d, i) => (
                        <span key={i} className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-emerald-700" />
                          <span>{d.document_name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    app.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : app.status === 'Under Review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : app.status === 'Documents Required'
                      ? 'bg-orange-100 text-orange-900 border border-orange-200'
                      : app.status === 'Rejected'
                      ? 'bg-red-100 text-red-900 border border-red-200'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {app.status}
                  </span>

                  {app.issued_noc_number && (
                    <button
                      onClick={() => handleViewIssuedNoc(app)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download NOC</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm text-white">Apply for Online NOC Certificate</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* NOC Type Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select NOC Type *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setUploadedFiles([]); }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {nocTypes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Fee: ₹{t.fee_amount})
                    </option>
                  ))}
                </select>
                {activeTypeObj && (
                  <p className="text-[11px] text-slate-500 mt-1">{activeTypeObj.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Intended Use *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sale of site to Mr. Rajesh Kumar / Construction of G+1 house"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {activeTypeObj?.code === 'NOC_SALE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prospective Buyer Name(s)
                  </label>
                  <input
                    type="text"
                    placeholder="Full name as in draft agreement"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              {activeTypeObj?.code === 'NOC_LOAN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank / Lending Institution Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India, Chandapura Branch"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific note for the Managing Committee..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Required Documents Checklist */}
              {activeTypeObj && activeTypeObj.requirements && activeTypeObj.requirements.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Document Checklist for {activeTypeObj.name}:
                  </span>

                  <div className="space-y-2">
                    {activeTypeObj.requirements.map((req) => {
                      const isAttached = uploadedFiles.some(f => f.documentName === req.document_name);
                      return (
                        <div key={req.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 block">{req.document_name}</span>
                            <span className="text-[11px] text-slate-400">{req.description || 'Mandatory verification document'}</span>
                          </div>

                          {isAttached ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Attached</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => simulateFileUpload(req.document_name)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-[11px] border border-emerald-300 cursor-pointer flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload PDF</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {submitting ? <span>Submitting Application...</span> : <span>Submit NOC Application</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Issued NOC Viewer Modal */}
      {activeIssuedNoc && (
        <NocCertificateModal
          noc={activeIssuedNoc}
          qrCodeSvg={activeIssuedNoc.qrCodeSvg}
          onClose={() => setActiveIssuedNoc(null)}
        />
      )}
    </div>
  );
};
