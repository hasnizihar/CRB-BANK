import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  UserCheck, 
  UserX, 
  User,
  ArrowLeft,
  Building2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { localStore } from '../../lib/store';
import type { Member } from '../../types';
import { formatDate } from '../../lib/formatters';
import { toast } from 'sonner';
import { Member360Page } from './Member360Page';

interface MembersPageProps {
  initialSearch?: string;
}

export const MembersPage: React.FC<MembersPageProps> = ({ initialSearch = '' }) => {
  const [members, setMembers] = useState<Member[]>(localStore.getMembers());
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MEMBER' | 'NON_MEMBER'>('ALL');
  
  // Page Navigation State (Full Page Views instead of Popup Modals)
  const [showAddPage, setShowAddPage] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form state for full page account registration
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNic, setNewNic] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Kattankudy');
  const [newOccupation, setNewOccupation] = useState('');
  const [newMemberType, setNewMemberType] = useState<'MEMBER' | 'NON_MEMBER'>('MEMBER');
  const [newNonMemberTypeCategory, setNewNonMemberTypeCategory] = useState<'MINOR' | 'INSTITUTION' | 'OTHER'>('MINOR');
  const [newCustomNonMemberType, setNewCustomNonMemberType] = useState('');

  const handleToggleStatus = (member: Member) => {
    const nextStatus = member.membership_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = members.map(m => m.id === member.id ? { ...m, membership_status: nextStatus as any } : m);
    localStore.saveMembers(updated);
    setMembers(updated);
    toast.success(`Updated status for ${member.member_number} to ${nextStatus}`);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newNic || !newPhone) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    const nextIdNum = members.length + 1;
    const nextId = newMemberType === 'MEMBER'
      ? `MEM-${String(nextIdNum).padStart(6, '0')}`
      : `CUS-${String(nextIdNum).padStart(6, '0')}`;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      organization_id: 'org-1',
      member_number: nextId,
      first_name: newFirstName,
      last_name: newLastName,
      nic: newNic,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      city: newCity,
      occupation: newOccupation,
      member_type: newMemberType,
      non_member_type: newMemberType === 'NON_MEMBER' 
        ? (newNonMemberTypeCategory === 'OTHER' ? newCustomNonMemberType : newNonMemberTypeCategory) 
        : undefined,
      membership_status: 'ACTIVE',
      membership_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    const updatedMembers = [newMember, ...members];
    localStore.saveMembers(updatedMembers);

    setMembers(updatedMembers);
    toast.success(`Registered successfully! ID: ${newMember.member_number}`);
    setShowAddPage(false);
    
    // Reset fields
    setNewFirstName('');
    setNewLastName('');
    setNewNic('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewOccupation('');
  };

  // 1. FULL PAGE VIEW: MEMBER 360 PROFILE INSPECTION
  if (selectedMember) {
    return (
      <Member360Page 
        member={selectedMember} 
        onBack={() => {
          setSelectedMember(null);
          setMembers(localStore.getMembers());
        }}
        onStatusToggle={(m) => {
          handleToggleStatus(m);
          setSelectedMember({ ...m, membership_status: m.membership_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' });
        }}
      />
    );
  }

  // 2. FULL PAGE VIEW: ACCOUNT REGISTRATION FORM
  if (showAddPage) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex-between pb-4 border-b border-[#e2e8f0]">
          <button 
            onClick={() => setShowAddPage(false)} 
            className="btn btn-secondary text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Members Registry</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#64748b] font-mono">
            <Building2 size={14} className="text-[#0284c7]" />
            <span>Kattankudy MPCS Ltd • Branch KTK-01</span>
          </div>
        </div>

        {/* Form Title Banner */}
        <div className="glass-panel p-6 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284c7] text-white rounded-lg">
              <UserCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0f172a]">Cooperative Account Registration</h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Complete formal KYC intake to establish a new cooperative shareholding member or non-member customer profile.
              </p>
            </div>
          </div>
        </div>

        {/* Full Page Registration Form */}
        <form onSubmit={handleCreateMember} className="glass-panel p-8 space-y-6">
          {/* Section 1: Category Selection */}
          <div className="p-5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#0f172a] flex items-center gap-2">
              <FileText size={16} className="text-[#0284c7]" />
              <span>Select Institutional Account Category *</span>
            </label>
            <select 
              value={newMemberType} 
              onChange={e => setNewMemberType(e.target.value as any)}
              className="font-medium text-sm p-2.5 bg-white border border-[#cbd5e1] rounded w-full"
            >
              <option value="MEMBER">Registered Cooperative Member (Shareholder & Voting Rights)</option>
              <option value="NON_MEMBER">Non-Member Customer (Savings / Pawning / Lending Only)</option>
            </select>
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <CheckCircle size={14} className="text-[#059669] shrink-0" />
              <span>
                {newMemberType === 'MEMBER' 
                  ? 'Issues official MEM- sequence number. Eligible for annual cooperative share dividends and general assembly voting.' 
                  : 'Issues official CUS- sequence number. Fully compliant for deposit, lending, and pawning services without share capital requirement.'}
              </span>
            </div>

            {newMemberType === 'NON_MEMBER' && (
              <div className="pt-4 border-t border-[#e2e8f0] space-y-3">
                <label className="text-xs font-semibold text-[#0284c7] block">
                  Non-Member Customer Classification Type *
                </label>
                <select 
                  value={newNonMemberTypeCategory} 
                  onChange={e => setNewNonMemberTypeCategory(e.target.value as any)}
                  className="font-medium text-xs p-2 bg-white border border-[#cbd5e1] rounded w-full"
                >
                  <option value="MINOR">Minor (Children under 18 / Guardian Trust)</option>
                  <option value="INSTITUTION">Institution / Corporate Entity / Partnership</option>
                  <option value="OTHER">Other (Specify Custom Classification Type)</option>
                </select>

                {newNonMemberTypeCategory === 'OTHER' && (
                  <div className="form-group mb-0">
                    <label className="form-label">Specify Custom Type (Typeable) *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Joint Venture / Sports Club / Ngo / Society" 
                      value={newCustomNonMemberType} 
                      onChange={e => setNewCustomNonMemberType(e.target.value)} 
                      required 
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Personal Identification */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider pb-2 border-b border-[#e2e8f0]">
              1. Personal Identification & Legal KYC
            </h3>
            <div className="grid-cols-2">
              <div className="form-group mb-0">
                <label className="form-label">First Name (Given Names) *</label>
                <input type="text" placeholder="e.g. Ahamed" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Last Name (Family Name / Surname) *</label>
                <input type="text" placeholder="e.g. Nizar" value={newLastName} onChange={e => setNewLastName(e.target.value)} required />
              </div>
            </div>

            <div className="grid-cols-2 pt-2">
              <div className="form-group mb-0">
                <label className="form-label">National Identity Card (NIC Number) *</label>
                <input type="text" placeholder="e.g. 953451234V or 199534501234" value={newNic} onChange={e => setNewNic(e.target.value)} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Occupation / Primary Business</label>
                <input type="text" placeholder="e.g. Teacher / Hardware Store Owner" value={newOccupation} onChange={e => setNewOccupation(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Residency */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider pb-2 border-b border-[#e2e8f0]">
              2. Contact Details & Residential Address
            </h3>
            <div className="grid-cols-2">
              <div className="form-group mb-0">
                <label className="form-label">Primary Mobile / Telephone Number *</label>
                <input type="text" placeholder="e.g. 077-1234567" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Email Address (Optional)</label>
                <input type="email" placeholder="e.g. ahamed.nizar@example.lk" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid-cols-2 pt-2">
              <div className="form-group mb-0">
                <label className="form-label">Residential Address (Street / House No.)</label>
                <input type="text" placeholder="e.g. 45 Mosque Road, Division 02" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">City / Divisional Secretariat</label>
                <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#e2e8f0]">
            <button type="button" onClick={() => setShowAddPage(false)} className="btn btn-secondary text-xs">
              Cancel Registration
            </button>
            <button type="submit" className="btn btn-primary text-xs font-semibold">
              Save Account & Issue ID Card
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. MAIN REGISTRY TABLE VIEW
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.member_number.toLowerCase().includes(search.toLowerCase()) ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.nic.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || m.membership_status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || (m.member_type || 'MEMBER') === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>KYC Registry</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Members & Customers Registry</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Manage KYC, membership shares, and non-member customer records with 360° profile inspection.</p>
          </div>
        </div>
        <button onClick={() => setShowAddPage(true)} className="btn btn-primary" style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}>
          <Plus size={16} />
          <span>Register New Account</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex gap-4 items-center flex-wrap bg-[#f8fafc]">
        <div className="flex-1 min-w-[280px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input 
            type="text"
            placeholder="Search by ID (MEM- / CUS-), Name, NIC, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white text-xs"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <User size={15} className="text-[#64748b]" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-white text-xs min-w-[180px]"
            >
              <option value="ALL">All Categories ({members.length})</option>
              <option value="MEMBER">Registered Members Only</option>
              <option value="NON_MEMBER">Non-Member Customers Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={15} className="text-[#64748b]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white text-xs min-w-[150px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Category</th>
              <th>Full Name</th>
              <th>NIC Number</th>
              <th>Contact Phone</th>
              <th>City / Division</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-[#64748b]">
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isMember = (m.member_type || 'MEMBER') === 'MEMBER';
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-[#0f172a]">
                        {m.member_number}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isMember ? 'badge-success' : 'badge-info'}`}>
                        {isMember ? 'Registered Member' : `Non-Member (${m.non_member_type || 'General'})`}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-[#0f172a]">{m.first_name} {m.last_name}</div>
                      {m.occupation && <div className="text-[11px] text-[#64748b]">{m.occupation}</div>}
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-[#f8fafc] border border-[#e2e8f0] px-1.5 py-0.5 rounded text-[#0f172a]">
                        {m.nic}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#64748b]">{m.phone}</td>
                    <td className="text-xs text-[#0f172a]">{m.city}</td>
                    <td>
                      <span className={`badge ${
                        m.membership_status === 'ACTIVE' ? 'badge-success' : 
                        m.membership_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#64748b]">{formatDate(m.membership_date)}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedMember(m)}
                          className="btn btn-secondary text-[11px] py-1 px-2.5"
                          title="View 360° Full Page Profile"
                        >
                          <Eye size={13} />
                          <span>360° View</span>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(m)}
                          className="p-1.5 rounded border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#64748b]"
                          title="Toggle Status"
                        >
                          {m.membership_status === 'ACTIVE' ? <UserX size={14} className="text-[#dc2626]" /> : <UserCheck size={14} className="text-[#059669]" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
