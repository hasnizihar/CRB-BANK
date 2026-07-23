'use client';

import Link from 'next/link';
import { HandCoins, ArrowLeft, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getLoanCategoryLabel } from '@/lib/utils';

const statusSteps = [
  { key: 'pending', label: 'Application' },
  { key: 'reviewed', label: 'Officer Review' },
  { key: 'approved', label: 'Manager Approval' },
  { key: 'disbursed', label: 'Disbursement' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function LoanDetailPage() {
  const loan = {
    id: '1', member_name: 'Mohamed Rilwan', member_no: 'CRB-00001', category: 'livelihood',
    requested_amount: 500000, approved_amount: 500000, interest_rate: 12, repayment_period: 24,
    monthly_installment: 23537, guarantor: 'Abdul Hameed (CRB-00003)', purpose: 'To expand existing grocery shop in Kattankudy main bazaar',
    status: 'active', start_date: '2023-06-01', end_date: '2025-06-01', balance: 320000,
  };

  const currentStepIndex = statusSteps.findIndex((s) => s.key === loan.status);

  const payments = [
    { id: '1', date: '2024-01-15', capital: 18055, interest: 5482, total: 23537, balance: 320000, receipt: 'LRP-20240115-001' },
    { id: '2', date: '2023-12-15', capital: 17875, interest: 5662, total: 23537, balance: 338055, receipt: 'LRP-20231215-001' },
    { id: '3', date: '2023-11-15', capital: 17697, interest: 5840, total: 23537, balance: 355930, receipt: 'LRP-20231115-001' },
    { id: '4', date: '2023-10-15', capital: 17520, interest: 6017, total: 23537, balance: 373627, receipt: 'LRP-20231015-001' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/loans" className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><HandCoins className="w-5 h-5 text-amber-600" /> Loan Details</h1>
            <p className="text-sm text-slate-500">{loan.member_name} · {loan.member_no}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>{loan.status}</span>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Approval Workflow</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {statusSteps.map((step, idx) => {
            const isPast = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPast ? 'bg-brand-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-brand-50' : ''}`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 whitespace-nowrap ${isPast ? 'text-brand-700 font-medium' : 'text-slate-500'}`}>{step.label}</span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-1 ${idx < currentStepIndex ? 'bg-brand-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase">Approved Amount</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(loan.approved_amount)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase">Outstanding</p>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(loan.balance)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase">Monthly Installment</p>
          <p className="text-lg font-bold text-brand-600 mt-1">{formatCurrency(loan.monthly_installment)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase">Category</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{getLoanCategoryLabel(loan.category)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Loan Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-xs text-slate-500 block mb-0.5">Interest Rate</span><p className="text-slate-900 font-medium">{loan.interest_rate}% per annum</p></div>
          <div><span className="text-xs text-slate-500 block mb-0.5">Repayment Period</span><p className="text-slate-900 font-medium">{loan.repayment_period} months</p></div>
          <div><span className="text-xs text-slate-500 block mb-0.5">Start Date</span><p className="text-slate-900 font-medium">{loan.start_date ? formatDate(loan.start_date) : '—'}</p></div>
          <div><span className="text-xs text-slate-500 block mb-0.5">End Date</span><p className="text-slate-900 font-medium">{loan.end_date ? formatDate(loan.end_date) : '—'}</p></div>
          <div><span className="text-xs text-slate-500 block mb-0.5">Guarantor</span><p className="text-slate-900 font-medium">{loan.guarantor}</p></div>
          <div className="col-span-2"><span className="text-xs text-slate-500 block mb-0.5">Purpose</span><p className="text-slate-900 font-medium">{loan.purpose}</p></div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Capital</th>
                <th className="text-right px-4 py-3">Interest</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-left px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-900">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(p.capital)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(p.interest)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(p.total)}</td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600 font-medium">{formatCurrency(p.balance)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{p.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
