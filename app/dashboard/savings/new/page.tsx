'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Wallet, ArrowLeft, Save, Loader2, User, Search, Plus } from 'lucide-react';

export default function NewSavingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ownerType, setOwnerType] = useState<'member' | 'customer'>('member');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selected owner
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  
  // Inline customer creation state
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: '', nic: '', address: '', phone: '', customer_type: 'normal'
  });

  const [formData, setFormData] = useState({
    account_no: '',
    passbook_no: '',
    account_type: 'savings',
    opening_balance: '',
    interest_rate: '6.5',
  });

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const supabase = createClient();
      
      try {
        if (ownerType === 'member') {
          const { data } = await supabase
            .from('members')
            .select('id, full_name, member_no, nic')
            .eq('status', 'active')
            .or(`full_name.ilike.%${searchQuery}%,member_no.ilike.%${searchQuery}%,nic.ilike.%${searchQuery}%`)
            .limit(5);
          setSearchResults(data || []);
        } else {
          const { data } = await supabase
            .from('customers')
            .select('id, full_name, nic, phone, customer_type')
            .or(`full_name.ilike.%${searchQuery}%,nic.ilike.%${searchQuery}%`)
            .limit(5);
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, ownerType]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCustomerChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setNewCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOwner && !isCreatingCustomer) {
      setError('Please select an account owner.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      let finalCustomerId = selectedOwner?.id;

      // If creating a new non-member (customer) inline
      if (ownerType === 'customer' && isCreatingCustomer) {
        const { data: customerData, error: custError } = await supabase
          .from('customers')
          .insert([{
            full_name: newCustomer.full_name,
            nic: newCustomer.nic,
            address: newCustomer.address,
            phone: newCustomer.phone,
            customer_type: newCustomer.customer_type,
            is_minor: newCustomer.customer_type === 'minor'
          }])
          .select('id')
          .single();
          
        if (custError) throw custError;
        finalCustomerId = customerData.id;
      }
      
      // Insert savings account
      const { error: insertError } = await supabase
        .from('savings_accounts')
        .insert([{
          member_id: ownerType === 'member' ? finalCustomerId : null,
          customer_id: ownerType === 'customer' ? finalCustomerId : null,
          account_no: formData.account_no,
          passbook_no: formData.passbook_no,
          account_type: formData.account_type,
          opening_balance: Number(formData.opening_balance),
          current_balance: Number(formData.opening_balance),
          interest_rate: Number(formData.interest_rate),
          status: 'active'
        }]);

      if (insertError) throw insertError;
      
      router.push('/dashboard/savings');
    } catch (err: any) {
      console.error('Error creating savings account:', err);
      setError(err.message || 'Failed to create savings account (Likely a Permission / RLS error).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/savings" className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> Open New Account</h1>
          <p className="text-sm text-slate-500 mt-1">Open a savings account for a member or non-member</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Owner Selection */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" /> Account Owner
            </h2>
            <div className="flex items-center bg-slate-100 p-1 rounded-md">
              <button 
                type="button"
                onClick={() => { setOwnerType('member'); setSelectedOwner(null); setIsCreatingCustomer(false); setSearchQuery(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${ownerType === 'member' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Member
              </button>
              <button 
                type="button"
                onClick={() => { setOwnerType('customer'); setSelectedOwner(null); setSearchQuery(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${ownerType === 'customer' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Non-Member (Customer)
              </button>
            </div>
          </div>

          {!isCreatingCustomer && !selectedOwner && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${ownerType === 'member' ? 'members by name, member no, or NIC' : 'customers by name or NIC'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
              
              {/* Dropdown Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => { setSelectedOwner(res); setSearchQuery(''); }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-0 border-slate-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-slate-900">{res.full_name}</div>
                      <div className="text-xs text-slate-500">
                        {ownerType === 'member' ? `${res.member_no} • NIC: ${res.nic}` : `${res.customer_type.toUpperCase()} • NIC: ${res.nic || 'N/A'}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-4 text-center text-sm text-slate-500">
                  No {ownerType}s found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {ownerType === 'customer' && !selectedOwner && !isCreatingCustomer && (
            <div className="flex justify-center pt-2">
              <button 
                type="button" 
                onClick={() => setIsCreatingCustomer(true)}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Register New Non-Member Customer
              </button>
            </div>
          )}

          {/* Selected Owner Banner */}
          {selectedOwner && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-4">
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Selected {ownerType}</p>
                <p className="text-base font-bold text-slate-900">{selectedOwner.full_name}</p>
                <p className="text-sm text-slate-600">
                  {ownerType === 'member' ? `${selectedOwner.member_no} • NIC: ${selectedOwner.nic}` : `${selectedOwner.customer_type} • NIC: ${selectedOwner.nic}`}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedOwner(null)} className="text-sm text-emerald-700 hover:underline">Change</button>
            </div>
          )}

          {/* Inline Customer Creation Form */}
          {isCreatingCustomer && !selectedOwner && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">New Non-Member Details</h3>
                <button type="button" onClick={() => setIsCreatingCustomer(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name / Institution Name *</label>
                  <input name="full_name" type="text" value={newCustomer.full_name} onChange={handleCustomerChange} required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer Type *</label>
                  <select name="customer_type" value={newCustomer.customer_type} onChange={handleCustomerChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                    <option value="normal">Normal</option>
                    <option value="minor">Minor</option>
                    <option value="institution">Institution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">NIC / Reg No</label>
                  <input name="nic" type="text" value={newCustomer.nic} onChange={handleCustomerChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label>
                  <input name="phone" type="tel" value={newCustomer.phone} onChange={handleCustomerChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Address</label>
                  <input name="address" type="text" value={newCustomer.address} onChange={handleCustomerChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-600" /> Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account_type" className="block text-xs font-medium text-slate-700 mb-1.5">Account Type *</label>
              <select id="account_type" name="account_type" value={formData.account_type} onChange={handleChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div>
              <label htmlFor="account_no" className="block text-xs font-medium text-slate-700 mb-1.5">Account Number *</label>
              <input id="account_no" name="account_no" type="text" value={formData.account_no} onChange={handleChange} placeholder="SAV-0000001" required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="passbook_no" className="block text-xs font-medium text-slate-700 mb-1.5">Passbook Number *</label>
              <input id="passbook_no" name="passbook_no" type="text" value={formData.passbook_no} onChange={handleChange} placeholder="PB-001" required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="interest_rate" className="block text-xs font-medium text-slate-700 mb-1.5">Interest Rate (%) *</label>
              <input id="interest_rate" name="interest_rate" type="number" value={formData.interest_rate} onChange={handleChange} step="0.5" required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="opening_balance" className="block text-xs font-medium text-slate-700 mb-1.5">Opening Deposit (Rs.) *</label>
              <input id="opening_balance" name="opening_balance" type="number" value={formData.opening_balance} onChange={handleChange} placeholder="5000" required min="0" className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/savings" className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading || (!selectedOwner && !isCreatingCustomer)} className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening...</> : <><Save className="w-4 h-4" /> Open Account</>}
          </button>
        </div>
      </form>
    </div>
  );
}
