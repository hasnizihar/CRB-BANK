'use client';

import { useState } from 'react';
import { ReceiptText, Search, CheckCircle2, Loader2, Receipt, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function LoanRecoveryPage() {
  const [step, setStep] = useState<'search' | 'amount' | 'confirm' | 'success'>('search');
  const [loanNo, setLoanNo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const foundLoan = loanNo === 'LN-2023-001'
    ? { loan_no: 'LN-2023-001', member_name: 'Mohamed Rilwan', member_no: 'CRB-00001', balance: 320000, installment: 23537, due_date: '2024-02-01', status: 'active', arrears: 0 }
    : loanNo === 'LN-2023-022'
    ? { loan_no: 'LN-2023-022', member_name: 'Ahamed Lebbe', member_no: 'CRB-00007', balance: 850000, installment: 28000, due_date: '2024-01-01', status: 'defaulted', arrears: 28000 }
    : null;

  async function handleConfirm() {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    setStep('success');
  }

  const todaysRecoveries = [
    { id: '1', time: '10:15 AM', loan: 'LN-2023-045', member: 'Fathima Rizna', amount: 15500, receipt: 'LRP-20240115-001' },
    { id: '2', time: '11:45 AM', loan: 'LN-2022-089', member: 'Mohamed Farook', amount: 24194, receipt: 'LRP-20240115-002' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ReceiptText className="w-6 h-6 text-brand-600" /> Loan Recovery</h1>
        <p className="text-sm text-slate-500 mt-1">Process loan installment payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            {step === 'search' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">1. Search Loan</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Enter loan number (try LN-2023-001)" value={loanNo} onChange={(e) => setLoanNo(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                {foundLoan && (
                  <div className={`p-4 rounded-md border ${foundLoan.arrears > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{foundLoan.member_name}</p>
                        <p className="text-xs text-slate-600">{foundLoan.member_no} · {foundLoan.loan_no}</p>
                      </div>
                      {foundLoan.arrears > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Arrears
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Outstanding:</span> <span className="font-semibold text-slate-900">{formatCurrency(foundLoan.balance)}</span></div>
                      <div><span className="text-slate-500">Installment:</span> <span className="font-semibold text-slate-900">{formatCurrency(foundLoan.installment)}</span></div>
                      <div><span className="text-slate-500">Due Date:</span> <span className="font-semibold text-slate-900">{formatDate(foundLoan.due_date)}</span></div>
                      {foundLoan.arrears > 0 && <div><span className="text-slate-500">Arrears:</span> <span className="font-semibold text-red-600">{formatCurrency(foundLoan.arrears)}</span></div>}
                    </div>
                  </div>
                )}
                {foundLoan && (
                  <button onClick={() => { setAmount((foundLoan.installment + foundLoan.arrears).toString()); setStep('amount'); }} className="w-full py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">Continue</button>
                )}
              </div>
            )}

            {step === 'amount' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">2. Enter Payment</h2>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">{foundLoan?.member_name}</p>
                  <p className="text-sm text-slate-900 font-mono font-medium">{foundLoan?.loan_no}</p>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label htmlFor="recovery-amount" className="block text-xs font-medium text-slate-700">Payment Amount (Rs.)</label>
                    <span className="text-[10px] text-slate-500">Due: {formatCurrency((foundLoan?.installment || 0) + (foundLoan?.arrears || 0))}</span>
                  </div>
                  <input id="recovery-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="1" className="w-full px-3 py-2 rounded-md border border-slate-300 text-xl font-bold text-center focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('search')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={() => setStep('confirm')} disabled={!amount || parseFloat(amount) <= 0} className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">Review</button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">3. Confirm Recovery</h2>
                <div className="space-y-3 p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Loan</span><span className="text-xs font-mono font-medium text-slate-900">{foundLoan?.loan_no}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Member</span><span className="text-xs font-medium text-slate-900">{foundLoan?.member_name}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Previous Balance</span><span className="text-xs text-slate-600">{formatCurrency(foundLoan?.balance || 0)}</span></div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="text-xs text-slate-500">Payment Amount</span>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-700">New Balance</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency((foundLoan?.balance || 0) - (parseFloat(amount) || 0))}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">Payment Successful</h2>
                <p className="text-sm text-slate-500 mb-6">{formatCurrency(parseFloat(amount))} recovered for {foundLoan?.loan_no}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <Receipt className="w-4 h-4" /> Print Receipt
                  </button>
                  <button onClick={() => { setStep('search'); setLoanNo(''); setAmount(''); }} className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                    New Recovery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Recoveries</h2>
              <p className="text-xs text-slate-500 mt-0.5">Total: <span className="text-emerald-600 font-semibold">{formatCurrency(todaysRecoveries.reduce((s, d) => s + d.amount, 0))}</span></p>
            </div>
            <div className="divide-y divide-slate-200">
              {todaysRecoveries.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border border-brand-100 bg-brand-50"><ReceiptText className="w-3.5 h-3.5 text-brand-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{rec.member}</p>
                      <p className="text-[10px] text-slate-500">{rec.loan} · {rec.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(rec.amount)}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{rec.receipt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
