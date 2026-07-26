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
import { formatDate, generateSequenceId } from '../../lib/formatters';
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
    toast.success(`Account ${member.member_number} status updated to ${nextStatus}`);
    
    if (selectedMember && selectedMember.id === member.id) {
      setSelectedMember({ ...selectedMember, membership_status: nextStatus as any });
    }
  };

  // 1. FULL PAGE VIEW: Member 360° Profile
  if (selectedMember) {
    return (
      <Member360Page 
        member={selectedMember} 
        onBack={() => setSelectedMember(null)} 
        onStatusToggle={handleToggleStatus} 
      />
    );
  }

  // 2. FULL PAGE VIEW: Account Registration Form (No Popup Modal)
  if (showAddPage) {
    const handleCreateMember = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFirstName || !newLastName || !newNic || !newPhone) {
        toast.error('Please fill in all required fields (Name, NIC, Phone)');
        return;
      }

      const prefix = newMemberType === 'MEMBER' ? 'MEM' : 'CUS';
      const nextId = generateSequenceId(prefix, members.length);
      const finalNonMemberType = newMemberType === 'NON_MEMBER' 
        ? (newNonMemberTypeCategory === 'OTHER' ? (newCustomNonMemberType || 'Other') : newNonMemberTypeCategory)
        : undefined;

      const newMember: Member = {
        id: `mem-${Date.now()}`,
        organization_id: 'org-1',
        member_number: nextId,
        first_name: newFirstName,
        last_name: newLastName,
        nic: newNic,
        phone: newPhone,
        email: newEmail,
        address: newAddress || 'Main Street',
        city: newCity,
        occupation: newOccupation || 'Merchant',
        member_type: newMemberType,
        non_member_type: finalNonMemberType,
        membership_status: 'ACTIVE',
        membership_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      const updated = [newMember, ...members];
      localStore.saveMembers(updated);
      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: newMemberType === 'MEMBER' ? 'MEMBER_REGISTER' : 'CUSTOMER_REGISTER',
        target_id: nextId,
        target_type: 'MEMBER',
        details: `Registered new ${newMemberType === 'MEMBER' ? 'Cooperative Member' : 'Non-Member Customer'} ${newFirstName} ${newLastName} (${nextId})`
      });

      setMembers(updated);
      setShowAddPage(false);
      toast.success(`${newMemberType === 'MEMBER' ? 'Member' : 'Customer'} ${newFirstName} ${newLastName} registered as ${nextId}!`);
      
      // Reset form
      setNewFirstName('');
      setNewLastName('');
      setNewNic('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
    };

    return (
      <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setShowAddPage(false)} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Registry</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Members & Customers</span>
              <span>/</span>
              <span style={{ color: '#10b981', fontWeight: 500 }}>Account Registration Portal</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Kattankudy MPCS Ltd • Branch KTK-01</span>
          </div>
        </div>

        {/* Form Title Banner */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCheck size={24} style={{ color: '#10b981' }} />
            <span>Cooperative Account Registration</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Complete the formal KYC intake below to establish a new cooperative shareholding member or non-member customer profile.
          </p>
        </div>

        {/* Full Page Registration Form */}
        <form onSubmit={handleCreateMember} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Category Selection */}
          <div style={{ padding: '1.25rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Select Institutional Account Category *</span>
            </label>
            <select 
              value={newMemberType} 
              onChange={e => setNewMemberType(e.target.value as any)}
              style={{ fontWeight: 600, fontSize: '0.95rem', padding: '0.65rem 1rem', color: newMemberType === 'MEMBER' ? '#10b981' : '#38bdf8' }}
            >
              <option value="MEMBER">Registered Cooperative Member (Shareholder & Voting Rights)</option>
              <option value="NON_MEMBER">Non-Member Customer (Savings / Pawning / Lending Only)</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.6rem' }}>
              <CheckCircle size={14} style={{ color: newMemberType === 'MEMBER' ? '#10b981' : '#38bdf8' }} />
              <span>
                {newMemberType === 'MEMBER' 
                  ? 'Issues official MEM- sequence number. Eligible for annual cooperative share dividends and general assembly voting.' 
                  : 'Issues official CUS- sequence number. Fully compliant with Rule 1 for general deposit, lending, and pawning services without share capital requirement.'}
              </span>
            </div>

            {newMemberType === 'NON_MEMBER' && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Non-Member Customer Classification Type *</span>
                </label>
                <select 
                  value={newNonMemberTypeCategory} 
                  onChange={e => setNewNonMemberTypeCategory(e.target.value as any)}
                  style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.6rem 1rem', color: '#38bdf8', background: '#0f172a' }}
                >
                  <option value="MINOR">Minor (Children under 18 / Guardian Trust)</option>
                  <option value="INSTITUTION">Institution / Corporate Entity / Partnership</option>
                  <option value="OTHER">Other (Specify Custom Classification Type)</option>
                </select>

                {newNonMemberTypeCategory === 'OTHER' && (
                  <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#fff', fontSize: '0.8rem' }}>Specify Custom Type (Typeable) *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Joint Venture / Sports Club / Ngo / Society" 
                      value={newCustomNonMemberType} 
                      onChange={e => setNewCustomNonMemberType(e.target.value)} 
                      required 
                      style={{ background: '#0f172a' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Personal Identification */}
          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              1. Personal Identification & Legal KYC
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">First Name (Given Names) *</label>
                <input type="text" placeholder="e.g. Ahamed" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Last Name (Family Name / Surname) *</label>
                <input type="text" placeholder="e.g. Nizar" value={newLastName} onChange={e => setNewLastName(e.target.value)} required />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '1.25rem', marginTop: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">National Identity Card (NIC Number) *</label>
                <input type="text" placeholder="e.g. 953451234V or 199534501234" value={newNic} onChange={e => setNewNic(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Occupation / Primary Business</label>
                <input type="text" placeholder="e.g. Teacher / Hardware Store Owner" value={newOccupation} onChange={e => setNewOccupation(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Residency */}
          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              2. Contact Details & Residential Address
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Mobile / Telephone Number *</label>
                <input type="text" placeholder="e.g. 077-1234567" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address (Optional)</label>
                <input type="email" placeholder="e.g. ahamed.nizar@example.lk" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '1.25rem', marginTop: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Residential Address (Street / House No.)</label>
                <input type="text" placeholder="e.g. 45 Mosque Road, Division 02" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City / Divisional Secretariat</label>
                <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setShowAddPage(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              Cancel Registration
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600 }}>
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
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} style={{ color: '#10b981' }} />
            <span>Members & Customers Registry</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Manage KYC, membership shares, and non-member customer records with 360° profile inspection.
          </p>
        </div>

        <button onClick={() => setShowAddPage(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Register New Account</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', background: '#1e293b' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by ID (MEM- / CUS-), Name, NIC, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', background: '#0f172a' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={15} style={{ color: 'var(--text-muted)' }} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              style={{ width: 'auto', minWidth: '170px', background: '#0f172a' }}
            >
              <option value="ALL">All Categories ({members.length})</option>
              <option value="MEMBER">Registered Members Only</option>
              <option value="NON_MEMBER">Non-Member Customers Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ width: 'auto', minWidth: '150px', background: '#0f172a' }}
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
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isMember = (m.member_type || 'MEMBER') === 'MEMBER';
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: isMember ? '#10b981' : '#38bdf8' }}>
                        {m.member_number}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isMember ? 'badge-success' : 'badge-info'}`}>
                        {isMember ? 'Registered Member' : `Non-Member (${m.non_member_type || 'General'})`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</div>
                      {m.occupation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.occupation}</div>}
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '0.8rem', background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {m.nic}
                      </span>
                    </td>
                    <td className="mono">{m.phone}</td>
                    <td>{m.city}</td>
                    <td>
                      <span className={`badge ${
                        m.membership_status === 'ACTIVE' ? 'badge-success' : 
                        m.membership_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {m.membership_status}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem' }}>{formatDate(m.membership_date)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setSelectedMember(m)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#0f172a' }}
                          title="View 360° Full Page Profile"
                        >
                          <Eye size={14} />
                          <span>360° Page</span>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(m)}
                          style={{ 
                            padding: '0.35rem 0.5rem', 
                            background: '#0f172a', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-sm)',
                            color: m.membership_status === 'ACTIVE' ? '#fb7185' : '#34d399'
                          }}
                          title="Toggle Status"
                        >
                          {m.membership_status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
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
