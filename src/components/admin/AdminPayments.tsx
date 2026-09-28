import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, AlertTriangle, ShieldCheck, Printer, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Payment } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Reconcile Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newStatus, setNewStatus] = useState('Successful');
  const [reconcileRemarks, setReconcileRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Receipt
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [receiptQr, setReceiptQr] = useState<string | undefined>(undefined);

  const fetchPayments = () => {
    api.getAdminPayments({ search, status: statusFilter })
      .then(res => setPayments(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter]);

  const handleOpenReconcile = (p: Payment) => {
    setSelectedPayment(p);
    setNewStatus(p.status || 'Successful');
    setReconcileRemarks('');
  };

  const handleExecuteReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setSubmitting(true);
    try {
      await api.reconcilePayment({
        paymentId: selectedPayment.id,
        newStatus,
        remarks: reconcileRemarks
      });
      setSelectedPayment(null);
      fetchPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to reconcile payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReceipt = async (receiptNum: string) => {
    try {
      const data = await api.getOwnerReceipt(receiptNum);
      if (data && data.receipt) {
        setViewingReceipt(data.receipt);
        setReceiptQr(data.qrCodeSvg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Audit & Reconciliation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming gateway settlements, transaction IDs, receipts, and resolve exceptions.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search receipt, site #, owner, transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        >
          <option value="">All Payment Statuses</option>
          <option value="Successful">Successful / Captured</option>
          <option value="Pending">Pending Reconciliation</option>
          <option value="Failed">Failed / Declined</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading payment transactions...</div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No transactions recorded</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Site & Owner</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method & Gateway ID</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.receipt_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">Site #{p.site_number}</span>
                      <span className="text-[11px] text-slate-500">{p.owner_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.payment_date}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div>{p.payment_method} ({p.gateway_provider || 'Direct'})</div>
                      <div className="text-slate-400 text-[10px]">{p.gateway_payment_id || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.status === 'Successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewReceipt(p.receipt_number)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition cursor-pointer"
                      >
                        Receipt
                      </button>
                      <button
                        onClick={() => handleOpenReconcile(p)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-[11px] transition cursor-pointer border border-emerald-200"
                      >
                        Reconcile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reconcile Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Reconcile Payment: {selectedPayment.receipt_number}</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReconcile} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><strong>Site:</strong> Site #{selectedPayment.site_number} ({selectedPayment.owner_name})</div>
                <div><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString('en-IN')}</div>
                <div><strong>Gateway Tx ID:</strong> {selectedPayment.gateway_payment_id || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Override</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Successful">Successful (Settled)</option>
                  <option value="Pending">Pending Confirmation</option>
                  <option value="Failed">Failed / Disputed</option>
                  <option value="Refunded">Refunded to Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reconciliation Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State bank statement reference or reconciliation justification..."
                  value={reconcileRemarks}
                  onChange={(e) => setReconcileRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Confirm Reconciliation Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {viewingReceipt && (
        <ReceiptModal
          receipt={viewingReceipt}
          qrCodeSvg={receiptQr}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
