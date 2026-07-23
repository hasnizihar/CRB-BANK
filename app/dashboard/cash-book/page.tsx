'use client';

import { useState } from 'react';
import { BookOpen, Calendar, Download, Filter, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CashBookPage() {
  const [date, setDate] = useState('2024-01-20');

  const cashBookData = {
    opening_balance: 2150000,
    closing_balance: 2221872,
    transactions: [
      { id: '1', time: '09:00 AM', type: 'opening', description: 'Opening Balance', ref: '-', in: 2150000, out: 0, balance: 2150000 },
      { id: '2', time: '09:15 AM', type: 'deposit', description: 'Savings Deposit - SAV-000123', ref: 'RCP-001', in: 25000, out: 0, balance: 2175000 },
      { id: '3', time: '09:45 AM', type: 'withdrawal', description: 'Savings Withdrawal - SAV-000456', ref: 'WDR-001', in: 0, out: 10000, balance: 2165000 },
      { id: '4', time: '10:15 AM', type: 'recovery', description: 'Loan Recovery - LN-2023-045', ref: 'LRP-001', in: 15500, out: 0, balance: 2180500 },
      { id: '5', time: '11:00 AM', type: 'expense', description: 'Office Supplies', ref: 'VCH-001', in: 0, out: 2500, balance: 2178000 },
      { id: '6', time: '11:30 AM', type: 'deposit', description: 'Savings Deposit - SAV-000789', ref: 'RCP-002', in: 15000, out: 0, balance: 2193000 },
      { id: '7', time: '01:15 PM', type: 'recovery', description: 'Loan Recovery - LN-2022-089', ref: 'LRP-002', in: 24194, out: 0, balance: 2217194 },
      { id: '8', time: '02:30 PM', type: 'deposit', description: 'Savings Deposit - SAV-000101', ref: 'RCP-003', in: 10000, out: 0, balance: 2227194 },
      { id: '9', time: '03:15 PM', type: 'withdrawal', description: 'Savings Withdrawal - SAV-000202', ref: 'WDR-002', in: 0, out: 5322, balance: 2221872 },
    ]
  };

  const totalIn = cashBookData.transactions.filter(t => t.type !== 'opening').reduce((sum, t) => sum + t.in, 0);
  const totalOut = cashBookData.transactions.reduce((sum, t) => sum + t.out, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BookOpen className="w-6 h-6 text-brand-600" /> Cash Book</h1>
          <p className="text-sm text-slate-500 mt-1">Daily transaction log and cash balance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          <button className="p-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors" title="Print">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors" title="Export">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Opening Balance</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(cashBookData.opening_balance)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Inward</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">+{formatCurrency(totalIn)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Outward</p>
          <p className="text-xl font-bold text-amber-600 mt-1">-{formatCurrency(totalOut)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Closing Balance</p>
          <p className="text-xl font-bold text-brand-600 mt-1">{formatCurrency(cashBookData.closing_balance)}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Transactions - {formatDate(date)}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Ref / Voucher</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">In (Rs.)</th>
                <th className="text-right px-4 py-3">Out (Rs.)</th>
                <th className="text-right px-4 py-3">Balance (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cashBookData.transactions.map((txn) => (
                <tr key={txn.id} className={`hover:bg-slate-50 transition-colors ${txn.type === 'opening' ? 'bg-slate-50 font-medium' : ''}`}>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{txn.time}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{txn.ref}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{txn.description}</td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-600">{txn.in > 0 ? formatCurrency(txn.in) : '-'}</td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600">{txn.out > 0 ? formatCurrency(txn.out) : '-'}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(txn.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-slate-900">Total for the Day:</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(totalIn + cashBookData.opening_balance)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">{formatCurrency(totalOut)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-brand-600">{formatCurrency(cashBookData.closing_balance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
