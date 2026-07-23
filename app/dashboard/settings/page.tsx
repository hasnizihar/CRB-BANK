'use client';

import { useState } from 'react';
import { Settings, Users, Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { getRoleLabel, getStatusColor } from '@/lib/utils';

const usersData = [
  { id: '1', name: 'Admin User', username: 'admin', role: 'administrator', status: 'active' },
  { id: '2', name: 'Rizwan Manager', username: 'rizwan.m', role: 'bank_manager', status: 'active' },
  { id: '3', name: 'Fathima Cashier', username: 'fathima.c', role: 'cashier', status: 'active' },
  { id: '4', name: 'Hameed Loan', username: 'hameed.l', role: 'loan_officer', status: 'active' },
  { id: '5', name: 'Salma Accountant', username: 'salma.a', role: 'accountant', status: 'active' },
  { id: '6', name: 'Farook Auditor', username: 'farook.au', role: 'auditor', status: 'inactive' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'general'>('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Settings className="w-6 h-6 text-slate-500" /> Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage system users and configurations</p>
      </div>

      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit shadow-sm">
        {(['users', 'general'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab === 'users' ? 'User Management' : 'General Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Username</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersData.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold border border-brand-200">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          <Shield className="w-3 h-3 text-slate-500" /> {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">System Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Organization Name</label>
              <input type="text" defaultValue="Kattankudy MPCS Limited" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Branch</label>
              <input type="text" defaultValue="Main Branch - Kattankudy" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Default Interest Rate (%)</label>
              <input type="number" defaultValue="6.5" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Currency</label>
              <select className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option>LKR - Sri Lankan Rupee</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Session Timeout (minutes)</label>
              <input type="number" defaultValue="30" className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Backup Schedule</label>
              <select className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="px-5 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
