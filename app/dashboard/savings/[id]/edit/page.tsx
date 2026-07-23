'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Wallet, ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditSavingsPage() {
  const router = useRouter();
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountOwner, setAccountOwner] = useState<string>('');
  
  const [formData, setFormData] = useState({
    account_no: '',
    passbook_no: '',
    account_type: 'savings',
    interest_rate: '0',
    status: 'active'
  });

  useEffect(() => {
    async function fetchAccount() {
      if (!params.id) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('savings_accounts')
          .select('*, members(full_name), customers(full_name)')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        
        setFormData({
          account_no: data.account_no || '',
          passbook_no: data.passbook_no || '',
          account_type: data.account_type || 'savings',
          interest_rate: data.interest_rate?.toString() || '0',
          status: data.status || 'active'
        });
        
        setAccountOwner(data.members?.full_name || data.customers?.full_name || 'Unknown');
      } catch (err: any) {
        console.error('Error fetching account:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, [params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({
          account_no: formData.account_no,
          passbook_no: formData.passbook_no,
          account_type: formData.account_type,
          interest_rate: Number(formData.interest_rate),
          status: formData.status
        })
        .eq('id', params.id);

      if (updateError) throw updateError;
      
      router.push(`/dashboard/savings/${params.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-sm text-slate-500">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/savings/${params.id}`} className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> Edit Account</h1>
          <p className="text-sm text-slate-500 mt-1">Update details for account owned by {accountOwner}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account_no" className="block text-xs font-medium text-slate-700 mb-1.5">Account Number *</label>
              <input id="account_no" name="account_no" type="text" value={formData.account_no} onChange={handleChange} required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="passbook_no" className="block text-xs font-medium text-slate-700 mb-1.5">Passbook Number *</label>
              <input id="passbook_no" name="passbook_no" type="text" value={formData.passbook_no} onChange={handleChange} required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="account_type" className="block text-xs font-medium text-slate-700 mb-1.5">Account Type *</label>
              <select id="account_type" name="account_type" value={formData.account_type} onChange={handleChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div>
              <label htmlFor="interest_rate" className="block text-xs font-medium text-slate-700 mb-1.5">Interest Rate (%) *</label>
              <input id="interest_rate" name="interest_rate" type="number" step="0.01" value={formData.interest_rate} onChange={handleChange} required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1.5">Account Status *</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="active">Active</option>
                <option value="dormant">Dormant</option>
                <option value="closed">Closed</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/dashboard/savings/${params.id}`} className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
