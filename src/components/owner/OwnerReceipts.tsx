import React, { useState, useEffect } from 'react';
import { Receipt, Printer, Download, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Payment } from '../../types';

interface OwnerReceiptsProps {
  onViewReceipt: (receiptNumber: string) => void;
}

export const OwnerReceipts: React.FC<OwnerReceiptsProps> = ({ onViewReceipt }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getOwnerPayments()
      .then(res => setPayments(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => {
    return p.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
           p.payment_method.toLowerCase().includes(search.toLowerCase()) ||
           (p.billing_period || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Receipts Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download and print official receipts for all completed maintenance contributions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search receipt no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading receipts...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <span>No receipts found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition font-sans">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.receipt_number}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.payment_date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{p.billing_period || 'Regular Contribution'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.payment_method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(p.receipt_number)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs transition inline-flex items-center gap-1 cursor-pointer border border-emerald-200"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
