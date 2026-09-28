import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, QrCode } from 'lucide-react';
import { api } from '../../services/api';

interface OwnerPaymentModalProps {
  isOpen: boolean;
  totalOutstanding: number;
  monthlyAmount: number;
  allowPartial: boolean;
  siteNumber: string;
  ownerName: string;
  onClose: () => void;
  onPaymentSuccess: (receiptNumber: string) => void;
}

export const OwnerPaymentModal: React.FC<OwnerPaymentModalProps> = ({
  isOpen,
  totalOutstanding,
  monthlyAmount,
  allowPartial,
  siteNumber,
  ownerName,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(totalOutstanding > 0 ? totalOutstanding : monthlyAmount);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setError('Please enter an amount greater than ₹0');
      return;
    }

    if (!allowPartial && paymentAmount < totalOutstanding) {
      setError(`Partial payments are not enabled. Please pay the total outstanding amount of ₹${totalOutstanding.toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.payMaintenance({
        amount: paymentAmount,
        paymentMethod,
        gatewayReference: `rzp_tx_${Date.now()}_site${siteNumber}`
      });

      if (res.success && res.result?.receiptNumber) {
        onPaymentSuccess(res.result.receiptNumber);
      } else {
        setError(res.error || 'Payment transaction verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Gateway Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Online Maintenance Payment</h3>
              <p className="text-xs text-emerald-300">Site #{siteNumber} · {ownerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Current Outstanding:</span>
              <span className="font-mono font-bold text-slate-900">₹{totalOutstanding.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Amount to Pay (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={1}
                  max={totalOutstanding > 0 ? totalOutstanding : 50000}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full pl-8 pr-3 py-2 text-lg font-bold font-mono text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Amount Buttons if Partial Payment Allowed */}
            {allowPartial && totalOutstanding > 1000 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Quick:</span>
                {[1000, 2000, 2500, totalOutstanding].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPaymentAmount(amt)}
                    className="px-2 py-0.5 bg-white border border-slate-300 hover:border-emerald-600 rounded text-[11px] font-mono font-medium text-slate-700 cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <span className="text-xs">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span className="text-xs">Net Banking</span>
              </button>
            </div>
          </div>

          {/* Method Subform Details */}
          {paymentMethod === 'UPI' && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <QrCode className="w-4 h-4 text-emerald-800" />
                <span>Instant UPI Gateway (GPay, PhonePe, Paytm, BHIM)</span>
              </div>
              <input
                type="text"
                placeholder="Enter UPI ID (e.g. mobile@upi or name@okhdfcbank)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Or scan dynamic QR code generated at checkout</span>
                <span className="text-emerald-800 font-semibold">Zero Surcharge</span>
              </div>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800">Supported Cards:</span>
              <p>RuPay, Visa, MasterCard, Maestro debit & credit cards issued in India.</p>
              <p className="text-[11px] text-slate-400">Card details are securely verified directly via PCI-DSS compliant payment gateway.</p>
            </div>
          )}

          {paymentMethod === 'NETBANKING' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800">Direct Bank Integration:</span>
              <p>State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Canara Bank, Kotak & 50+ other Indian banks.</p>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying with Gateway...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>PROCEED TO PAY ₹{paymentAmount.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Gateway Transaction · Instant Official Receipt</span>
          </div>
        </form>
      </div>
    </div>
  );
};
