import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: any;
  qrCodeSvg?: string;
  settings?: Record<string, string>;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, qrCodeSvg, settings, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const associationName = settings?.association_name || 'UPKAR GARDENS OWNERS ASSOCIATION (R)';
  const regNumber = settings?.registration_number || 'DRO-1/SOR/142/2018-19';
  const address = settings?.address || 'Chandapura-Anekal Main Road, Bangalore - 560099';
  const contactPhone = settings?.contact_phone || '+91 80 2783 4567';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Controls - Hidden during print */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-base">Official Payment Receipt</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 sm:p-10 bg-white text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-emerald-800 pb-5 text-center relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 mb-2 border border-emerald-200">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 uppercase">
              {associationName}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Govt. Regd. No: <span className="font-mono font-semibold text-slate-900">{regNumber}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {address} · Ph: {contactPhone}
            </p>
            <div className="mt-3 inline-block bg-emerald-100 text-emerald-900 font-bold px-4 py-1 rounded text-xs tracking-wider uppercase">
              MAINTENANCE PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Meta Details */}
          <div className="grid grid-cols-2 gap-4 my-6 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Receipt Number</div>
              <div className="font-mono font-bold text-slate-900 text-base">{receipt.receipt_number}</div>
              <div className="text-xs text-slate-500 pt-2">Payment Date</div>
              <div className="font-medium text-slate-800">{receipt.payment_date}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-500">Site & House Number</div>
              <div className="font-bold text-emerald-900 text-base">
                Site #{receipt.site_number} {receipt.house_number ? `(House: ${receipt.house_number})` : ''}
              </div>
              <div className="text-xs text-slate-500 pt-2">Phase / Block</div>
              <div className="font-medium text-slate-800">{receipt.block_phase || 'Phase 1'}</div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-slate-500">Received With Thanks From:</span>
                <div className="font-bold text-slate-900">{receipt.owner_name}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Registered Mobile:</span>
                <div className="font-mono text-slate-800">{receipt.primary_mobile || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-sm mb-6 border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold">Description</th>
                <th className="py-2.5 px-3 text-center font-semibold">Billing Period</th>
                <th className="py-2.5 px-3 text-right font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3 text-slate-800 font-medium">
                  Residential Layout Maintenance Contribution
                  <div className="text-xs text-slate-500 mt-0.5">Mode: {receipt.payment_method} · Ref: {receipt.gateway_payment_id || 'Direct'}</div>
                </td>
                <td className="py-3 px-3 text-center text-slate-700">
                  {receipt.billing_period || 'Regular Contribution'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                  ₹{Number(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-emerald-50/50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 text-slate-800 text-right">
                  Total Amount Paid:
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-900 font-mono text-base">
                  ₹{Number(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer & QR */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              {qrCodeSvg ? (
                <div
                  className="w-16 h-16 border border-slate-200 rounded p-1 bg-white"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[9px] text-center text-slate-400 p-1">
                  Digital Verification
                </div>
              )}
              <div className="text-slate-500 leading-tight">
                <span className="font-semibold text-slate-700">Digital Verification QR</span>
                <p className="text-[11px] mt-0.5">Computer-generated official receipt.</p>
                <p className="text-[11px]">Valid without physical signature.</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 font-serif italic text-xs mb-1">Digitally Authorized By</div>
              <div className="font-bold text-emerald-950">Treasurer / Hon. Secretary</div>
              <div className="text-[11px] text-slate-500">Upkar Gardens Owners Association (R)</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
