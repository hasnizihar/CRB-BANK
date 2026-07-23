'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowUpFromLine, Search, CheckCircle2, Loader2, Receipt, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

function WithdrawalsContent() {
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<'search' | 'amount' | 'verify' | 'success'>('search');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passbookPresented, setPassbookPresented] = useState(false);
  const [signatureVerified, setSignatureVerified] = useState(false);

  const [foundAccount, setFoundAccount] = useState<any>(null);
  const [todaysWithdrawals, setTodaysWithdrawals] = useState<any[]>([]);
  const [txnResult, setTxnResult] = useState<any>(null);

  // Pre-fill account from URL if present
  useEffect(() => {
    const acc = searchParams?.get('account');
    if (acc) {
      setAccountNo(acc);
    }
    fetchTodaysWithdrawals();
  }, [searchParams]);

  async function fetchTodaysWithdrawals() {
    try {
      const supabase = createClient();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('transactions')
        .select('*, savings_accounts(account_no, members(full_name), customers(full_name))')
        .eq('type', 'withdrawal')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodaysWithdrawals(data || []);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    }
  }

  // Debounced search for account
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!accountNo.trim() || step !== 'search') {
        setFoundAccount(null);
        setError(null);
        return;
      }

      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('savings_accounts')
          .select('*, members(full_name, member_no), customers(full_name, nic)')
          .eq('account_no', accountNo.trim().toUpperCase())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
             setFoundAccount(null);
          } else {
             throw error;
          }
        } else {
          setFoundAccount(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Error finding account');
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [accountNo, step]);

  async function handleVerify() {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const numAmount = parseFloat(amount);
      
      if (!foundAccount || numAmount <= 0) {
        throw new Error("Invalid account or amount");
      }

      if (numAmount > foundAccount.current_balance) {
        throw new Error("Insufficient funds");
      }

      // Call the secure Postgres RPC function
      const { data, error } = await supabase.rpc('process_transaction', {
        p_account_id: foundAccount.id,
        p_type: 'withdrawal',
        p_amount: numAmount,
        p_description: description || null
      });

      if (error) throw error;
      
      setTxnResult(data);
      setStep('success');
      fetchTodaysWithdrawals(); // Refresh list
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      setStep('verify'); // Go back so they can see error
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep('search');
    setAccountNo('');
    setAmount('');
    setDescription('');
    setPassbookPresented(false);
    setSignatureVerified(false);
    setFoundAccount(null);
    setTxnResult(null);
    setError(null);
  }

  const ownerName = foundAccount?.members?.full_name || foundAccount?.customers?.full_name;
  const ownerNo = foundAccount?.members?.member_no || foundAccount?.customers?.nic;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ArrowUpFromLine className="w-6 h-6 text-amber-600" /> Withdrawals</h1>
        <p className="text-sm text-slate-500 mt-1">Process cash withdrawals from savings accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === 'search' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">1. Search Account</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Enter account number (e.g. SAV-0000001)" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 text-sm uppercase focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                {accountNo && !foundAccount && (
                  <p className="text-xs text-slate-500">Searching...</p>
                )}
                {foundAccount && (
                  <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
                    <p className="text-sm font-medium text-slate-900">{ownerName}</p>
                    <p className="text-xs text-slate-600">{ownerNo} · {foundAccount.account_no}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-amber-700">Available Balance: {formatCurrency(foundAccount.current_balance)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${foundAccount.status === 'active' ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                        {foundAccount.status}
                      </span>
                    </div>
                  </div>
                )}
                {foundAccount && foundAccount.status !== 'closed' && foundAccount.status !== 'frozen' && (
                  <button onClick={() => setStep('amount')} className="w-full py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">Continue</button>
                )}
                {foundAccount && (foundAccount.status === 'closed' || foundAccount.status === 'frozen') && (
                  <p className="text-xs text-red-600 font-medium text-center">Cannot withdraw from a {foundAccount.status} account.</p>
                )}
              </div>
            )}

            {step === 'amount' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">2. Enter Amount</h2>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">{ownerName}</p>
                  <p className="text-sm text-slate-900 font-mono font-medium">{foundAccount?.account_no}</p>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label htmlFor="withdraw-amount" className="block text-xs font-medium text-slate-700">Withdrawal Amount (Rs.)</label>
                    <span className="text-[10px] text-slate-500">Max: {formatCurrency(foundAccount?.current_balance || 0)}</span>
                  </div>
                  <input id="withdraw-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="1" max={foundAccount?.current_balance} className="w-full px-3 py-2 rounded-md border border-slate-300 text-xl font-bold text-center focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  {parseFloat(amount) > (foundAccount?.current_balance || 0) && (
                    <p className="text-xs text-red-600 mt-1">Amount exceeds available balance.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="withdraw-description" className="block text-xs font-medium text-slate-700 mb-1.5">Description (optional)</label>
                  <input id="withdraw-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cash withdrawal" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('search')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={() => setStep('verify')} disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (foundAccount?.current_balance || 0)} className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">Continue</button>
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-600" /> Verification</h2>
                <div className="space-y-3 p-4 rounded-md bg-amber-50 border border-amber-200">
                  <div className="flex justify-between"><span className="text-xs text-slate-600">Account</span><span className="text-xs font-mono font-medium text-slate-900">{foundAccount?.account_no}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-600">Owner</span><span className="text-xs font-medium text-slate-900">{ownerName}</span></div>
                  <div className="border-t border-amber-200 pt-3 flex justify-between">
                    <span className="text-xs text-slate-600">Withdrawal Amount</span>
                    <span className="text-sm font-bold text-amber-600">- {formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={passbookPresented} onChange={(e) => setPassbookPresented(e.target.checked)} className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500" />
                    <span className="text-sm text-slate-700">Passbook presented</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={signatureVerified} onChange={(e) => setSignatureVerified(e.target.checked)} className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500" />
                    <span className="text-sm text-slate-700">Signature verified</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={handleVerify} disabled={loading || !passbookPresented || !signatureVerified} className="flex-1 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Process'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">Withdrawal Successful</h2>
                <p className="text-sm text-slate-500 mb-2">{formatCurrency(parseFloat(amount))} withdrawn from {foundAccount?.account_no}</p>
                {txnResult && (
                  <p className="text-xs font-mono text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded mb-6">
                    Receipt: {txnResult.receipt_no}
                  </p>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <Receipt className="w-4 h-4" /> Print Receipt
                  </button>
                  <button onClick={handleReset} className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                    New Withdrawal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Withdrawals</h2>
                <p className="text-xs text-slate-500 mt-0.5">Total: <span className="text-amber-600 font-semibold">{formatCurrency(todaysWithdrawals.reduce((s, d) => s + Number(d.amount), 0))}</span></p>
              </div>
            </div>
            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
              {todaysWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No withdrawals recorded today.</div>
              ) : (
                todaysWithdrawals.map((wdr) => {
                  const accountStr = wdr.savings_accounts?.account_no || 'Unknown';
                  const ownerName = wdr.savings_accounts?.members?.full_name || wdr.savings_accounts?.customers?.full_name || 'Unknown';
                  
                  return (
                    <div key={wdr.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border border-amber-100 bg-amber-50"><ArrowUpFromLine className="w-3.5 h-3.5 text-amber-600" /></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{ownerName}</p>
                          <p className="text-[10px] text-slate-500">{accountStr} · {formatDate(wdr.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600">-{formatCurrency(wdr.amount)}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{wdr.receipt_no}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading withdrawals...</div>}>
      <WithdrawalsContent />
    </Suspense>
  );
}
