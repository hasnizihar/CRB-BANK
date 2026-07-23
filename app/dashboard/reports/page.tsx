'use client';

import { useState } from 'react';
import { FileBarChart2, Calendar, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const reportTypes = [
  { id: 'daily-cash', label: 'Daily Cash Report', category: 'Financial' },
  { id: 'savings', label: 'Savings Report', category: 'Accounts' },
  { id: 'loan', label: 'Loan Report', category: 'Loans' },
  { id: 'loan-recovery', label: 'Loan Recovery Report', category: 'Loans' },
  { id: 'member', label: 'Member Report', category: 'Members' },
  { id: 'trial-balance', label: 'Trial Balance', category: 'Financial' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('daily-cash');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');

  const dailyCashData = [
    { date: '2024-01-20', opening: 2150000, deposits: 125400, withdrawals: 78250, loan_disbursements: 0, loan_recovery: 24722, closing: 2221872 },
    { date: '2024-01-19', opening: 2100000, deposits: 98000, withdrawals: 48000, loan_disbursements: 0, loan_recovery: 0, closing: 2150000 },
    { date: '2024-01-18', opening: 2050000, deposits: 110000, withdrawals: 60000, loan_disbursements: 0, loan_recovery: 0, closing: 2100000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileBarChart2 className="w-6 h-6 text-brand-600" /> Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and view financial reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Report</h2>
            <div className="space-y-1">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedReport === report.id
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {report.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              <span className="text-xs text-slate-500">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <button className="ml-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">{reportTypes.find((r) => r.id === selectedReport)?.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Period: {dateFrom} to {dateTo}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-right px-4 py-3">Opening</th>
                    <th className="text-right px-4 py-3">Deposits</th>
                    <th className="text-right px-4 py-3">Withdrawals</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Loan Disb.</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Loan Recovery</th>
                    <th className="text-right px-4 py-3">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dailyCashData.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-900">{row.date}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(row.opening)}</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-600">+{formatCurrency(row.deposits)}</td>
                      <td className="px-4 py-3 text-right text-sm text-amber-600">-{formatCurrency(row.withdrawals)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 hidden lg:table-cell">{formatCurrency(row.loan_disbursements)}</td>
                      <td className="px-4 py-3 text-right text-sm text-brand-600 hidden lg:table-cell">{formatCurrency(row.loan_recovery)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
