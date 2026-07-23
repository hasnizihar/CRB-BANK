'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Wallet, Plus, Search, Eye, ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SavingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('savings_accounts')
          .select('*, members(full_name, member_no), customers(full_name, nic, customer_type)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAccounts(data || []);
      } catch (err: any) {
        console.error('Error fetching savings accounts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  const filtered = accounts.filter((a) => {
    const ownerName = a.members?.full_name || a.customers?.full_name || '';
    const ownerNo = a.members?.member_no || a.customers?.nic || '';
    const matchesSearch = 
      a.account_no?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ownerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ownerNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBalance = filtered.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" /> Savings Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">Total Balance: <span className="text-emerald-600 font-semibold">{formatCurrency(totalBalance)}</span></p>
        </div>
        <Link href="/dashboard/savings/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Open Account
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by account no, owner name..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 rounded-md text-sm border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="px-3 py-2 rounded-md text-sm border border-slate-200 min-w-[140px] focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="dormant">Dormant</option>
          <option value="closed">Closed</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3">Account No</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Passbook</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Type/Rate</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading accounts...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-500">
                    Error loading accounts: {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => {
                  const isMember = !!acc.member_id;
                  const ownerName = isMember ? acc.members?.full_name : acc.customers?.full_name;
                  const ownerNo = isMember ? acc.members?.member_no : (acc.customers?.nic || 'Non-Member');
                  const badgeColor = isMember ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200';
                  
                  return (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-emerald-600 font-medium">{acc.account_no}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{ownerName || 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500">{ownerNo}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase tracking-wider ${badgeColor}`}>
                              {isMember ? 'Member' : acc.customers?.customer_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">{acc.passbook_no}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(acc.current_balance)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">
                      <div className="capitalize font-medium text-slate-700">{acc.account_type}</div>
                      <div className="text-xs text-slate-500">{acc.interest_rate}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${acc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/savings/${acc.id}`} className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/savings/${acc.id}/edit`} className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">Showing {filtered.length} of {accounts.length} accounts</p>
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
