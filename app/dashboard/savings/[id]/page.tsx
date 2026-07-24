'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSaving } from '@/hooks/use-savings';
import { ArrowLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity, Loader2, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function SavingsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: account, isLoading: loading, error: fetchError } = useSaving(id);
  const error = fetchError?.message || null;
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      if (!id) return;
      try {
        const supabase = createClient();
        const { data: txnData, error: txnError } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', id)
          .order('created_at', { ascending: false });

        if (txnError) throw txnError;
        setTransactions(txnData || []);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
      }
    }
    
    fetchTransactions();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-sm text-slate-500">Loading account details...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-600 mb-4">
          {error || 'Account not found'}
        </div>
        <Link href="/dashboard/savings" className="text-sm text-brand-600 hover:underline">
          &larr; Back to savings accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/savings" className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" /> {account.account_no}
              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ml-2 ${account.member_id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                {account.account_type}
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              {account.member_id 
                ? `${account.members?.full_name} · ${account.members?.member_no}` 
                : `${account.customers?.full_name} · NIC: ${account.customers?.nic}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${account.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
            {account.status}
          </span>
          <Link href={`/dashboard/savings/${account.id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Current Balance</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(account.current_balance)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Opening Balance</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(account.opening_balance)}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Interest Rate</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{account.interest_rate}%</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Passbook</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{account.passbook_no}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/dashboard/deposits?account=${account.account_no}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors shadow-sm">
          <ArrowDownToLine className="w-4 h-4" /> Deposit
        </Link>
        <Link href={`/dashboard/withdrawals?account=${account.account_no}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors shadow-sm">
          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
        </Link>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-600" /> Transaction History</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {transactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              No transactions found for this account.
            </div>
          ) : (
            transactions.map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md border ${txn.type === 'deposit' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    {txn.type === 'deposit' ? <ArrowDownToLine className="w-3.5 h-3.5" /> : <ArrowUpFromLine className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{txn.type}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{txn.receipt_no} · {formatDate(txn.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txn.type === 'deposit' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>
                  <p className="text-[10px] text-slate-500">Balance: {formatCurrency(txn.balance_after)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
