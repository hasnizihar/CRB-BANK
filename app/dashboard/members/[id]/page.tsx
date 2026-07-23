'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CreditCard,
  Wallet,
  HandCoins,
  Pencil,
  Activity,
  Loader2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMember() {
      if (!params.id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setMember(data);
      } catch (err: any) {
        console.error('Error fetching member:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [params.id]);

  // We will load these from Supabase in the future
  const accounts: any[] = [];
  const loans: any[] = [];
  const recentTransactions: any[] = [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-sm text-slate-500">Loading member details...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-600 mb-4">
          {error || 'Member not found'}
        </div>
        <Link href="/dashboard/members" className="text-sm text-brand-600 hover:underline">
          &larr; Back to members
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/members" className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xl font-bold border border-brand-200 uppercase">
              {member.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{member.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-brand-600">{member.member_no}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                  {member.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/members/${member.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <Pencil className="w-4 h-4" /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Personal Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: CreditCard, label: 'NIC', value: member.nic },
              { icon: Calendar, label: 'Date of Birth', value: member.dob ? formatDate(member.dob) : 'N/A' },
              { icon: Phone, label: 'Phone', value: member.phone },
              { icon: Briefcase, label: 'Occupation', value: member.occupation },
              { icon: MapPin, label: 'Address', value: member.address },
              { icon: Calendar, label: 'Member Since', value: member.join_date ? formatDate(member.join_date) : 'N/A' },
            ].map((item) => (
              <div key={item.label} className={item.label === 'Address' ? 'col-span-2' : ''}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <item.icon className="w-3 h-3" /> {item.label}
                </p>
                <p className="text-sm text-slate-900 font-medium">{item.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-900">Total Savings</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(0)}</p>
            <p className="text-[10px] text-slate-500 mt-1">0 account(s)</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <HandCoins className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-slate-900">Active Loans</span>
            </div>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(0)}</p>
            <p className="text-[10px] text-slate-500 mt-1">0 active loan(s)</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-600" />
          Savings Accounts
        </h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No savings accounts found.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <Link
                key={acc.id}
                href={`/dashboard/savings/${acc.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors"
              >
                <div>
                  <p className="text-sm font-mono text-brand-600 font-medium">{acc.account_no}</p>
                  <p className="text-xs text-slate-500">{acc.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(acc.balance)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${acc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                    {acc.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          Recent Transactions
        </h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No recent transactions found.</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-md border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${txn.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {txn.type === 'deposit' ? <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{txn.type}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{txn.receipt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txn.type === 'deposit' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {txn.type === 'deposit' ? '+' : '-'} {formatCurrency(txn.amount)}
                  </p>
                  <p className="text-[10px] text-slate-500">{formatDate(txn.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
