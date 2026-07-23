'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HandCoins, ArrowLeft, Save, Loader2, Search, User } from 'lucide-react';
import { getLoanCategoryLabel } from '@/lib/utils';

const loanCategories = [
  { value: 'livelihood', label: 'Livelihood Loan' },
  { value: 'production', label: 'Production Loan' },
  { value: 'small_industrial', label: 'Small Industrial Loan' },
  { value: 'consumption', label: 'Consumption Loan' },
  { value: 'government_servant', label: 'Government Servant Loan' },
  { value: 'special', label: 'Special Loan' },
];

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [formData, setFormData] = useState({
    loan_category: 'livelihood', requested_amount: '', interest_rate: '12', repayment_period: '12', purpose: '', guarantor: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    router.push('/dashboard/loans');
  }

  const monthlyInstallment = (() => {
    const p = parseFloat(formData.requested_amount) || 0;
    const r = (parseFloat(formData.interest_rate) || 0) / 100 / 12;
    const n = parseInt(formData.repayment_period) || 1;
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/loans" className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><HandCoins className="w-6 h-6 text-amber-600" /> New Loan Application</h1>
          <p className="text-sm text-slate-500 mt-1">Submit a new loan request for approval</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-brand-600" /> Member</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search member by name, NIC, or member no..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><HandCoins className="w-4 h-4 text-amber-600" /> Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loan_category" className="block text-xs font-medium text-slate-700 mb-1.5">Loan Category *</label>
              <select id="loan_category" name="loan_category" value={formData.loan_category} onChange={handleChange} className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                {loanCategories.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="requested_amount" className="block text-xs font-medium text-slate-700 mb-1.5">Requested Amount (Rs.) *</label>
              <input id="requested_amount" name="requested_amount" type="number" value={formData.requested_amount} onChange={handleChange} placeholder="500000" required min="1" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="interest_rate" className="block text-xs font-medium text-slate-700 mb-1.5">Interest Rate (%) *</label>
              <input id="interest_rate" name="interest_rate" type="number" value={formData.interest_rate} onChange={handleChange} step="0.5" min="0" required className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="repayment_period" className="block text-xs font-medium text-slate-700 mb-1.5">Repayment Period (months) *</label>
              <input id="repayment_period" name="repayment_period" type="number" value={formData.repayment_period} onChange={handleChange} min="1" required className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="purpose" className="block text-xs font-medium text-slate-700 mb-1.5">Purpose *</label>
              <textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Describe the loan purpose" required rows={2} className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="guarantor" className="block text-xs font-medium text-slate-700 mb-1.5">Guarantor *</label>
              <input id="guarantor" name="guarantor" type="text" value={formData.guarantor} onChange={handleChange} placeholder="Guarantor name and member number" required className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        {parseFloat(formData.requested_amount) > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Loan Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-[10px] text-slate-600">Monthly Installment</p><p className="text-lg font-bold text-amber-600">Rs. {monthlyInstallment.toLocaleString('en', { maximumFractionDigits: 0 })}</p></div>
              <div><p className="text-[10px] text-slate-600">Total Payable</p><p className="text-lg font-bold text-slate-900">Rs. {(monthlyInstallment * parseInt(formData.repayment_period || '1')).toLocaleString('en', { maximumFractionDigits: 0 })}</p></div>
              <div><p className="text-[10px] text-slate-600">Total Interest</p><p className="text-lg font-bold text-slate-700">Rs. {(monthlyInstallment * parseInt(formData.repayment_period || '1') - parseFloat(formData.requested_amount || '0')).toLocaleString('en', { maximumFractionDigits: 0 })}</p></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/loans" className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Save className="w-4 h-4" /> Submit Application</>}
          </button>
        </div>
      </form>
    </div>
  );
}
