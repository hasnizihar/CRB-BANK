'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateMember } from '@/hooks/use-members';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';
import {
  UserPlus,
  ArrowLeft,
  Save,
  Loader2,
  User,
  MapPin,
  Phone,
  Briefcase,
  Calendar,
  CreditCard,
  Upload,
} from 'lucide-react';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutateAsync: createMember } = useCreateMember();
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    member_no: '',
    nic: '',
    full_name: '',
    address: '',
    phone: '',
    gender: 'male',
    occupation: '',
    dob: '',
    join_date: new Date().toISOString().split('T')[0],
    nominee: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      let photo_url = null;
      let signature_url = null;

      if (photoInputRef.current?.files?.[0]) {
        photo_url = await uploadFile('photos', 'members', photoInputRef.current.files[0]);
      }
      
      if (signatureInputRef.current?.files?.[0]) {
        signature_url = await uploadFile('signatures', 'members', signatureInputRef.current.files[0]);
      }

      await createMember({
        ...formData,
        photo_url,
        signature_url,
        status: 'active'
      });

      toast.success('Member created successfully');
      router.push('/dashboard/members');
    } catch (err: any) {
      console.error('Error creating member:', err);
      toast.error(err.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/members"
          className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-brand-600" />
            New Member
          </h1>
          <p className="text-sm text-slate-500 mt-1">Register a new cooperative society member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="member_no" className="block text-xs font-medium text-slate-700 mb-1.5">Member No *</label>
              <input id="member_no" name="member_no" type="text" value={formData.member_no} onChange={handleChange} placeholder="CRB-00001" required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="nic" className="block text-xs font-medium text-slate-700 mb-1.5">NIC Number *</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="nic" name="nic" type="text" value={formData.nic} onChange={handleChange} placeholder="901234567V" required className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="full_name" className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} placeholder="Enter member's full name" required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-xs font-medium text-slate-700 mb-1.5">Gender *</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block text-xs font-medium text-slate-700 mb-1.5">Date of Birth *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Contact & Occupation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-medium text-slate-700 mb-1.5">Address *</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" required rows={2} className="w-full px-3 py-2 rounded-md text-sm resize-none border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-slate-700 mb-1.5">Telephone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="077-1234567" required className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label htmlFor="occupation" className="block text-xs font-medium text-slate-700 mb-1.5">Occupation</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="occupation" name="occupation" type="text" value={formData.occupation} onChange={handleChange} placeholder="Businessman, Teacher, etc." className="w-full pl-9 pr-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label htmlFor="join_date" className="block text-xs font-medium text-slate-700 mb-1.5">Membership Date *</label>
              <input id="join_date" name="join_date" type="date" value={formData.join_date} onChange={handleChange} required className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label htmlFor="nominee" className="block text-xs font-medium text-slate-700 mb-1.5">Nominee</label>
              <input id="nominee" name="nominee" type="text" value={formData.nominee} onChange={handleChange} placeholder="Nominee name" className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-brand-600" />
            Documents & Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Member Photo</label>
              <input type="file" accept="image/*" ref={photoInputRef} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Signature</label>
              <input type="file" accept="image/*" ref={signatureInputRef} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard/members" className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Member</>}
          </button>
        </div>
      </form>
    </div>
  );
}
