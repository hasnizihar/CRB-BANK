'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HandCoins, Plus, Search, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getStatusColor, getLoanCategoryLabel } from '@/lib/utils';

const LOANS_DATA = [
  { id: '1', loan_no: 'LN-2023-001', member_name: 'Mohamed Rilwan', member_no: 'CRB-00001', category: 'livelihood', amount: 500000, balance: 320000, interest_rate: 12, status: 'active', start_date: '2023-06-01' },
  { id: '2', loan_no: 'LN-2023-045', member_name: 'Fathima Rizna', member_no: 'CRB-00002', category: 'consumption', amount: 100000, balance: 85000, interest_rate: 14, status: 'active', start_date: '2023-10-15' },
  { id: '3', loan_no: 'LN-2024-012', member_name: 'Abdul Hameed', member_no: 'CRB-00003', category: 'production', amount: 250000, balance: 250000, interest_rate: 10, status: 'pending', start_date: null },
  { id: '4', loan_no: 'LN-2022-089', member_name: 'Mohamed Farook', member_no: 'CRB-00005', category: 'livelihood', amount: 400000, balance: 0, interest_rate: 12, status: 'completed', start_date: '2022-01-10' },
  { id: '5', loan_no: 'LN-2023-022', member_name: 'Ahamed Lebbe', member_no: 'CRB-00007', category: 'small_industrial', amount: 1000000, balance: 850000, interest_rate: 9, status: 'defaulted', start_date: '2023-08-01' },
];

export default function LoansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = LOANS_DATA.filter((l) => {
    const matchesSearch = l.loan_no.toLowerCase().includes(searchQuery.toLowerCase()) || l.member_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.member_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = filtered.reduce((sum, l) => sum + l.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-amber-600" /> Loans
          </h1>
          <p className="text-sm text-slate-500 mt-1">Total Outstanding: <span className="text-amber-600 font-semibold">{formatCurrency(totalOutstanding)}</span></p>
        </div>
        <Link href="/dashboard/loans/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" /> New Loan
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by loan no, member name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-md text-sm border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-md text-sm border border-slate-200 min-w-[140px] focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="defaulted">Defaulted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3">Loan No</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">Outstanding</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-brand-600 font-medium">{loan.loan_no}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{loan.member_name}</p>
                    <p className="text-xs text-slate-500">{loan.member_no}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">{getLoanCategoryLabel(loan.category)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-900">{formatCurrency(loan.amount)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">{formatCurrency(loan.balance)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/loans/${loan.id}`} className="text-slate-400 hover:text-brand-600 transition-colors inline-flex">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">Showing {filtered.length} loans</p>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 text-xs font-medium">1</span>
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
