import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, Award, Printer, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { NocCertificateModal } from '../common/NocCertificateModal';

interface VerifyNocViewProps {
  initialQuery?: string;
}

export const VerifyNocView: React.FC<VerifyNocViewProps> = ({ initialQuery = '' }) => {
  const [nocNumber, setNocNumber] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  const handleVerify = async (queryToSearch: string) => {
    const clean = queryToSearch.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyNoc(clean);
      if (data && data.found) {
        setResult(data.noc);
      } else {
        setError(data.message || 'No active certificate found matching this serial number.');
      }
    } catch (err: any) {
      setError(err.message || 'No valid NOC certificate found in association registry.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(nocNumber);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Statutory Association Registry Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif">
          Public NOC Verification Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify the authenticity, validity, and issue record of any No Objection Certificate (NOC) 
          issued by Upkar Gardens Owners Association (R) for property transfer, building construction, or bank loans.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. UGOA/NOC/2026/00042"
              value={nocNumber}
              onChange={(e) => setNocNumber(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? <span>Verifying...</span> : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Record</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Serial numbers are printed at the top-left of every official certificate.</span>
          <button
            type="button"
            onClick={() => {
              setNocNumber('UGOA/NOC/2026/00042');
              handleVerify('UGOA/NOC/2026/00042');
            }}
            className="text-emerald-800 font-semibold hover:underline cursor-pointer"
          >
            Sample Test: Site 42 NOC
          </button>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Certificate Record Not Verified</strong>
            <p className="text-xs text-red-800 leading-relaxed">{error}</p>
            <p className="text-xs text-slate-600 pt-2">
              If you believe this is an error, please contact the Association Office at <strong>+91 80 2783 4567</strong> or email <strong>contact@upkargardens.org</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Verified Certificate Card */}
      {result && (
        <div className="bg-white rounded-2xl border-2 border-emerald-600 overflow-hidden shadow-lg">
          {/* Header Strip */}
          <div className="bg-emerald-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                  Registry Status: Authentic & Verified
                </span>
                <h3 className="text-lg font-bold text-white font-mono">{result.nocNumber}</h3>
              </div>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>View Full Certificate</span>
            </button>
          </div>

          {/* Details Table */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Layout Site Number</span>
                <div className="text-base font-bold text-slate-900">
                  Site #{result.siteNumber} {result.houseNumber !== 'N/A' ? `(House: ${result.houseNumber})` : ''}
                </div>
                <div className="text-xs text-slate-500">{result.blockPhase}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">NOC Category</span>
                <div className="text-base font-bold text-emerald-950">{result.nocType}</div>
                <div className="text-xs text-slate-500">Official Association Clearance</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Beneficiary Owner Name</span>
                <div className="text-base font-bold text-slate-900">{result.beneficiaryOwner}</div>
                <div className="text-xs text-emerald-800 font-medium">Verified Property Title</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date of Issuance</span>
                <div className="text-sm font-bold text-slate-900">{result.issueDate}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Validity Period</span>
                <div className="text-sm font-bold text-slate-900">{result.validUntil || 'Lifetime / Regular'}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Authorized Signatory</span>
                <div className="text-sm font-bold text-slate-900">{result.signatory}</div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privacy Safe: Owner contact numbers are protected and never displayed publicly.</span>
              </div>
              <span className="font-mono text-emerald-800 font-semibold">STATUS: ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal View */}
      {showCertificateModal && result && (
        <NocCertificateModal
          noc={result}
          qrCodeSvg={result.qrCodeSvg}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
