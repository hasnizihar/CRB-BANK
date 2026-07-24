'use client';

import { useState, useEffect } from 'react';
import { ArrowDownToLine, Search, CheckCircle2, Loader2, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useSearchAccount } from '@/hooks/use-savings';
import { useTransactionsByType, useProcessTransaction } from '@/hooks/use-transactions';
import { useDebounce } from '@/hooks/use-debounce';

export default function DepositsPage() {
  const [step, setStep] = useState<'search' | 'amount' | 'confirm' | 'success'>('search');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [txnResult, setTxnResult] = useState<any>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  
  // Debounce search term to prevent excessive API calls
  const debouncedAccountNo = useDebounce(accountNo, 500);

  // Queries
  const { data: foundAccount, isLoading: isSearching, error: searchError } = useSearchAccount(
    step === 'search' ? debouncedAccountNo : ''
  );
  const { data: todaysDeposits = [] } = useTransactionsByType('deposit');
  
  // Mutations
  const processDeposit = useProcessTransaction();

  async function handleConfirm() {
    setCustomError(null);
    
    try {
      const numAmount = parseFloat(amount);
      if (!foundAccount || numAmount <= 0) {
        throw new Error("Invalid account or amount");
      }

      const result = await processDeposit.mutateAsync({
        accountId: foundAccount.id,
        type: 'deposit',
        amount: numAmount,
        description: description || undefined
      });

      setTxnResult(result);
      setStep('success');
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setCustomError(err.message || 'Transaction failed. Please try again.');
      setStep('amount');
    }
  }

  function handleReset() {
    setStep('search');
    setAccountNo('');
    setAmount('');
    setDescription('');
    setTxnResult(null);
    setCustomError(null);
  }

  const error = customError || (searchError ? 'Error finding account' : null);

  const ownerName = foundAccount?.members?.full_name || foundAccount?.customers?.full_name;
  const ownerNo = foundAccount?.members?.member_no || foundAccount?.customers?.nic;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ArrowDownToLine className="w-6 h-6 text-emerald-600" /> Deposits</h1>
        <p className="text-sm text-slate-500 mt-1">Process cash deposits to savings accounts</p>
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
                {isSearching && (
                  <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Searching...</p>
                )}
                {foundAccount && (
                  <div className="p-4 rounded-md bg-emerald-50 border border-emerald-100">
                    <p className="text-sm font-medium text-slate-900">{ownerName}</p>
                    <p className="text-xs text-slate-600">{ownerNo} · {foundAccount.account_no}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-emerald-700">Balance: {formatCurrency(foundAccount.current_balance)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${foundAccount.status === 'active' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                        {foundAccount.status}
                      </span>
                    </div>
                  </div>
                )}
                {foundAccount && foundAccount.status !== 'closed' && foundAccount.status !== 'frozen' && (
                  <button onClick={() => setStep('amount')} className="w-full py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">Continue</button>
                )}
                {foundAccount && (foundAccount.status === 'closed' || foundAccount.status === 'frozen') && (
                  <p className="text-xs text-red-600 font-medium text-center">Cannot deposit to a {foundAccount.status} account.</p>
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
                  <label htmlFor="deposit-amount" className="block text-xs font-medium text-slate-700 mb-1.5">Deposit Amount (Rs.)</label>
                  <input id="deposit-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="1" className="w-full px-3 py-2 rounded-md border border-slate-300 text-xl font-bold text-center focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label htmlFor="deposit-description" className="block text-xs font-medium text-slate-700 mb-1.5">Description (optional)</label>
                  <input id="deposit-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cash deposit" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('search')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={() => setStep('confirm')} disabled={!amount || parseFloat(amount) <= 0} className="flex-1 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">Review</button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">3. Confirm Deposit</h2>
                <div className="space-y-3 p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Account</span><span className="text-xs font-mono font-medium text-slate-900">{foundAccount?.account_no}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Owner</span><span className="text-xs font-medium text-slate-900">{ownerName}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Current Balance</span><span className="text-xs text-slate-600">{formatCurrency(foundAccount?.current_balance || 0)}</span></div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="text-xs text-slate-500">Deposit Amount</span>
                    <span className="text-sm font-bold text-emerald-600">+ {formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-700">New Balance</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency((foundAccount?.current_balance || 0) + (parseFloat(amount) || 0))}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Back</button>
                  <button onClick={handleConfirm} disabled={processDeposit.isPending} className="flex-1 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {processDeposit.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Confirm Deposit'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">Deposit Successful</h2>
                <p className="text-sm text-slate-500 mb-2">{formatCurrency(parseFloat(amount))} deposited to {foundAccount?.account_no}</p>
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
                    New Deposit
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
                <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Deposits</h2>
                <p className="text-xs text-slate-500 mt-0.5">Total: <span className="text-emerald-600 font-semibold">{formatCurrency(todaysDeposits.reduce((s, d) => s + Number(d.amount), 0))}</span></p>
              </div>
            </div>
            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
              {todaysDeposits.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No deposits recorded today.</div>
              ) : (
                todaysDeposits.map((dep) => {
                  const accountStr = dep.savings_accounts?.account_no || 'Unknown';
                  const ownerName = dep.savings_accounts?.members?.full_name || dep.savings_accounts?.customers?.full_name || 'Unknown';
                  
                  return (
                    <div key={dep.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md border border-emerald-100 bg-emerald-50"><ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" /></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{ownerName}</p>
                          <p className="text-[10px] text-slate-500">{accountStr} · {formatDate(dep.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">+{formatCurrency(dep.amount)}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{dep.receipt_no}</p>
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
