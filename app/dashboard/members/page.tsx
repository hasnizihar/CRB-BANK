'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMembers, useUpdateMember } from '@/hooks/use-members';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Unlock
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: result, isLoading: loading, error } = useMembers({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
  });

  const { mutateAsync: updateMember, isPending: updating } = useUpdateMember();

  const members = result?.data || [];
  const total = result?.count || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      await updateMember({ id, data: { status: newStatus } });
      toast.success(`Member ${newStatus === 'active' ? 'reactivated' : 'suspended'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Members
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage cooperative society members</p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Member
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, NIC, member no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md text-sm border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 rounded-md text-sm border border-slate-200 min-w-[140px] focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3">Member No</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">NIC</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Phone</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Join Date</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading members...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-500">
                    Error loading members: {error.message}
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-brand-600">{member.member_no}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold border border-slate-200 uppercase">
                          {member.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{member.full_name}</p>
                          <p className="text-xs text-slate-500">{member.occupation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">{member.nic}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{member.phone}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">
                      {member.join_date ? formatDate(member.join_date) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        member.status === 'inactive' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {member.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(member.id, member.status)}
                          disabled={updating}
                          className={`p-1.5 rounded-md transition-colors ${member.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                          title={member.status === 'suspended' ? 'Reactivate Member' : 'Suspend Member'}
                        >
                          {member.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <Link href={`/dashboard/members/${member.id}`} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/members/${member.id}/edit`} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing {members.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} members
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 text-xs font-medium">
              {page} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
