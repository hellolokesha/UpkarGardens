import React from 'react';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';

interface NocCertificateModalProps {
  noc: any;
  qrCodeSvg?: string;
  onClose: () => void;
}

export const NocCertificateModal: React.FC<NocCertificateModalProps> = ({ noc, qrCodeSvg, onClose }) => {
  if (!noc) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-base">Official No Objection Certificate (NOC)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate */}
        <div id="printable-noc" className="p-8 sm:p-12 bg-white text-slate-900 relative border-8 border-double border-emerald-900 m-4 sm:m-6 rounded-lg">
          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <ShieldCheck className="w-96 h-96 text-emerald-900" />
          </div>

          {/* Association Certificate Header */}
          <div className="text-center border-b-2 border-emerald-900 pb-6 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-900 mb-2 border border-emerald-300">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 uppercase font-serif">
              UPKAR GARDENS OWNERS ASSOCIATION (R)
            </h1>
            <p className="text-xs text-slate-700 font-medium tracking-wide mt-1">
              Registered under the Karnataka Societies Registration Act, 1960 · Registration No: <strong className="font-mono text-slate-900">DRO-1/SOR/142/2018-19</strong>
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Clubhouse Office, Upkar Gardens Layout, Chandapura-Anekal Main Road, Bangalore - 560099
            </p>
            <div className="mt-4 inline-block bg-emerald-900 text-amber-300 font-bold px-6 py-1.5 rounded text-sm tracking-widest uppercase border border-amber-400">
              NO OBJECTION CERTIFICATE
            </div>
          </div>

          {/* Reference Numbers & Dates */}
          <div className="flex justify-between items-center my-6 text-sm">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Certificate Ref No.</div>
              <div className="font-mono font-bold text-emerald-950 text-base">{noc.noc_number || noc.nocNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Date of Issue</div>
              <div className="font-medium text-slate-900">{noc.issue_date || noc.issueDate}</div>
              {noc.valid_until && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Valid Until: <span className="font-medium text-slate-800">{noc.valid_until}</span>
                </div>
              )}
            </div>
          </div>

          {/* Salutation */}
          <div className="my-6">
            <h3 className="font-serif font-bold text-lg text-slate-950 tracking-wide">
              TO WHOMSOEVER IT MAY CONCERN
            </h3>
          </div>

          {/* Body */}
          <div className="text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 font-serif text-justify">
            {noc.noc_content_html ? (
              <div dangerouslySetInnerHTML={{ __html: noc.noc_content_html }} />
            ) : (
              <p>
                This is to certify that Sri/Smt. <strong>{noc.owner_name || noc.beneficiaryOwner}</strong> is the registered owner of{' '}
                <strong>Site Number {noc.site_number || noc.siteNumber}</strong>
                {noc.house_number ? ` (House No. ${noc.house_number})` : ''}, located in {noc.block_phase || noc.blockPhase || 'Upkar Gardens Layout'}.
                <br /><br />
                The Association records have been verified, and all layout maintenance dues, levies and charges have been paid up-to-date with zero outstanding balance.
                <br /><br />
                The Upkar Gardens Owners Association (R) has <strong>NO OBJECTION</strong> for the issuance of clearance in respect of:{' '}
                <strong>{noc.noc_type || noc.nocType || 'Property Clearance'}</strong>.
              </p>
            )}
            <p className="text-xs text-slate-500 italic pt-2">
              Note: This certificate is issued based on association records and does not substitute any statutory municipal, revenue, or legal title verification.
            </p>
          </div>

          {/* Signatures & QR */}
          <div className="grid grid-cols-2 gap-6 items-end mt-12 pt-6 border-t border-slate-200">
            {/* QR verification */}
            <div className="flex items-center gap-3">
              {qrCodeSvg ? (
                <div
                  className="w-20 h-20 border border-slate-300 rounded p-1 bg-white shrink-0"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] text-center text-slate-400 p-1 shrink-0">
                  Digital QR Verification
                </div>
              )}
              <div className="text-xs text-slate-600">
                <span className="font-bold text-emerald-950 block">Digital Verification</span>
                <span className="text-[11px] leading-tight block text-slate-500 mt-0.5">
                  Scan QR code or verify at <strong>/verify-noc</strong> using serial number.
                </span>
                <span className="font-mono text-[10px] text-slate-400 block mt-1">STATUS: ACTIVE & VERIFIED</span>
              </div>
            </div>

            {/* Official Seal and Signatory */}
            <div className="text-right">
              <div className="inline-block text-center border-t border-slate-800 pt-2 px-6">
                <div className="font-serif italic text-xs text-slate-400 mb-1">Digitally Signed & Certified</div>
                <div className="font-bold text-slate-950 text-sm">{noc.signatory_name || noc.signatory || 'President / Hon. Secretary'}</div>
                <div className="text-xs text-emerald-900 font-medium">{noc.signatory_designation || 'Upkar Gardens Owners Association (R)'}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">OFFICIAL ASSOCIATION SEAL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
