import React, { useState } from 'react';
import { 
  Users, 
  History, 
  Search, 
  Terminal,
  Database,
  Plus,
  Edit3,
  Check,
  X,
  UserCheck,
  Key,
  Shield
} from 'lucide-react';
import { localStore } from '../../lib/store';
import { formatDateTime } from '../../lib/formatters';
import { toast } from 'sonner';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'LOAN_OFFICER' | 'PAWN_APPRAISER' | 'CASHIER_TELLER' | 'AUDITOR_READONLY';
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'database'>('roles');
  const [search, setSearch] = useState('');
  const [audits] = useState(localStore.getAudits());

  // Interactive Staff State
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([
    { id: 'usr-1', name: 'Ahamed Nizar', email: 'admin@kattankudympcs.lk', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '10 mins ago' },
    { id: 'usr-2', name: 'Samsudeen Rahman', email: 'rahman@kattankudympcs.lk', role: 'PAWN_APPRAISER', status: 'ACTIVE', lastLogin: '2 hours ago' },
    { id: 'usr-3', name: 'Zahra Fathima', email: 'zahra@kattankudympcs.lk', role: 'LOAN_OFFICER', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: 'usr-4', name: 'Mohamed Rikas', email: 'rikas@kattankudympcs.lk', role: 'CASHIER_TELLER', status: 'ACTIVE', lastLogin: 'Yesterday' },
    { id: 'usr-5', name: 'Fawz Mohamed', email: 'fawz@kattankudympcs.lk', role: 'AUDITOR_READONLY', status: 'ACTIVE', lastLogin: '3 days ago' },
  ]);

  // New staff form state
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffUser['role']>('CASHIER_TELLER');

  // Edit role modal state
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<StaffUser['role']>('CASHIER_TELLER');

  const filteredAudits = audits.filter(a => 
    a.action.toLowerCase().includes(search.toLowerCase()) ||
    a.details.toLowerCase().includes(search.toLowerCase()) ||
    a.user_email.toLowerCase().includes(search.toLowerCase()) ||
    a.target_id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      toast.error('Please enter valid staff name and official email address.');
      return;
    }
    const newOfficer: StaffUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      status: 'ACTIVE',
      lastLogin: 'Never'
    };
    setStaffUsers([newOfficer, ...staffUsers]);
    setShowNewStaff(false);
    setNewStaffName('');
    setNewStaffEmail('');
    toast.success(`Provisioned new cooperative officer account: ${newOfficer.email}`);
  };

  const handleUpdateRole = (userId: string) => {
    setStaffUsers(staffUsers.map(u => u.id === userId ? { ...u, role: editRole } : u));
    setEditingStaffId(null);
    toast.success('Updated security RBAC role successfully!');
  };

  const toggleUserStatus = (userId: string) => {
    setStaffUsers(staffUsers.map(u => {
      if (u.id === userId) {
        const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        toast.info(`Changed officer ${u.name} status to ${next}`);
        return { ...u, status: next };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>System Admin & Security</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Cooperative Administration & RBAC Security</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Manage branch staff permissions, inspect audit logs, and verify Supabase Row-Level Security policies.</p>
          </div>
        </div>
      </div>

      {/* Admin Switcher Tabs */}
      <div className="flex gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
        {[
          { id: 'roles', label: 'RBAC Staff Roles', icon: Users, count: staffUsers.length },
          { id: 'audit', label: 'System Audit Ledger', icon: History, count: audits.length },
          { id: 'database', label: 'Supabase RLS Inspection', icon: Database, count: undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive ? 'bg-[#0284c7] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#f1f5f9]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: RBAC Staff Roles & Permission Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                <Key size={18} className="text-[#059669]" />
                <span>Cooperative Staff Directory & Role Access Control</span>
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Assign fine-grained access boundaries for Kattankudy MPCS branch officers.
              </p>
            </div>

            <button 
              onClick={() => setShowNewStaff(!showNewStaff)}
              className="btn btn-primary text-xs font-semibold bg-[#059669] hover:bg-[#047857]"
            >
              <Plus size={16} />
              <span>{showNewStaff ? 'Close Form' : 'Provision New Staff Officer'}</span>
            </button>
          </div>

          {/* New Staff Form */}
          {showNewStaff && (
            <form onSubmit={handleCreateStaff} className="glass-panel p-6 bg-[#f8fafc] border-l-4 border-l-[#059669] space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-[#059669] flex items-center gap-2">
                <UserCheck size={18} />
                <span>Provision New Cooperative Staff Officer</span>
              </h4>

              <div className="grid-cols-3">
                <div className="form-group mb-0">
                  <label className="form-label">Full Name *</label>
                  <input type="text" placeholder="e.g. Ibrahim Kaleel" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required className="bg-white" />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Official Cooperative Email *</label>
                  <input type="email" placeholder="e.g. kaleel@kattankudympcs.lk" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required className="bg-white" />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Security Role *</label>
                  <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value as any)} className="bg-white">
                    <option value="CASHIER_TELLER">Cashier / Teller (Deposits & Withdrawals Only)</option>
                    <option value="LOAN_OFFICER">Loan Officer (Credit Appraisal & Disbursements)</option>
                    <option value="PAWN_APPRAISER">Pawn Appraiser (Gold Valuation & Safe Vault)</option>
                    <option value="BRANCH_MANAGER">Branch Manager (Full Operations Review)</option>
                    <option value="SUPER_ADMIN">Super Administrator (Full Access & RBAC Control)</option>
                    <option value="AUDITOR_READONLY">External Auditor (Read-Only Ledger Access)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewStaff(false)} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs font-semibold bg-[#059669] hover:bg-[#047857]">
                  Authorize Account
                </button>
              </div>
            </form>
          )}

          {/* Staff Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Email Address</th>
                  <th>Assigned RBAC Role</th>
                  <th>Account Status</th>
                  <th>Last Active</th>
                  <th className="text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-semibold text-xs text-[#0f172a]">{u.name}</div>
                      <div className="font-mono text-[11px] text-[#64748b]">ID: {u.id}</div>
                    </td>
                    <td className="font-mono text-xs text-[#0f172a]">{u.email}</td>
                    <td>
                      {editingStaffId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <select value={editRole} onChange={e => setEditRole(e.target.value as any)} className="p-1 text-xs bg-white border border-[#cbd5e1] rounded">
                            <option value="CASHIER_TELLER">CASHIER_TELLER</option>
                            <option value="LOAN_OFFICER">LOAN_OFFICER</option>
                            <option value="PAWN_APPRAISER">PAWN_APPRAISER</option>
                            <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="AUDITOR_READONLY">AUDITOR_READONLY</option>
                          </select>
                          <button onClick={() => handleUpdateRole(u.id)} className="p-1 rounded bg-[#059669] text-white hover:bg-[#047857]" title="Save">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingStaffId(null)} className="p-1 rounded bg-[#64748b] text-white hover:bg-[#475569]" title="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-info font-mono">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(u.id)} 
                        className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'} cursor-pointer border-none`}
                        title="Click to toggle status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="text-xs text-[#64748b]">{u.lastLogin}</td>
                    <td className="text-right">
                      <button 
                        onClick={() => { setEditingStaffId(u.id); setEditRole(u.role); }}
                        className="btn btn-secondary text-[11px] py-1 px-2 text-[#0284c7]"
                      >
                        <Edit3 size={13} />
                        <span>Edit Role</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RBAC Permission Boundary Matrix */}
          <div className="glass-panel p-6 bg-[#f8fafc]">
            <h4 className="text-sm font-semibold text-[#0f172a] mb-2 flex items-center gap-2">
              <Shield size={18} className="text-[#0284c7]" />
              <span>RBAC Operational Permission Matrix</span>
            </h4>
            <p className="text-xs text-[#64748b] mb-4">
              Summary of enforced operational boundaries per staff role. Supabase Row-Level Security validates JWT claims against this matrix.
            </p>

            <div className="table-container bg-white">
              <table>
                <thead>
                  <tr>
                    <th>Security Role</th>
                    <th className="text-center">Savings Deposits/Withdrawals</th>
                    <th className="text-center">Loan Disbursal & Approval</th>
                    <th className="text-center">Gold Pawning Safe Vault</th>
                    <th className="text-center">Audit Logs & System Reset</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-xs text-[#0284c7] font-mono">SUPER_ADMIN</td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-xs text-[#059669] font-mono">BRANCH_MANAGER</td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-xs text-[#d97706] font-mono">LOAN_OFFICER</td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-xs text-[#4f46e5] font-mono">PAWN_APPRAISER</td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-xs text-[#0f172a] font-mono">CASHIER_TELLER</td>
                    <td className="text-center text-[#059669]"><Check size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                    <td className="text-center text-[#dc2626]"><X size={16} className="mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-xs text-[#64748b] font-mono">AUDITOR_READONLY</td>
                    <td className="text-center text-xs text-[#64748b]">Read-Only</td>
                    <td className="text-center text-xs text-[#64748b]">Read-Only</td>
                    <td className="text-center text-xs text-[#64748b]">Read-Only</td>
                    <td className="text-center text-xs text-[#64748b]">Read-Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 bg-[#f8fafc] flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input 
                type="text"
                placeholder="Search audit trail by action name, user email, ID, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white text-xs"
              />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Performed By (Email)</th>
                  <th>Detailed Log Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map(a => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs text-[#64748b] whitespace-nowrap">
                      {formatDateTime(a.created_at)}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {a.action}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold text-[#0f172a]">
                        {a.target_id || 'N/A'} <small className="text-[#64748b]">({a.target_type})</small>
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[#0f172a]">{a.user_email}</td>
                    <td className="text-xs text-[#0f172a]">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Supabase & RLS */}
      {activeTab === 'database' && (
        <div className="glass-panel p-6 bg-[#f8fafc] space-y-4">
          <div className="flex items-center gap-2 text-[#0284c7]">
            <Terminal size={20} />
            <h3 className="text-sm font-semibold text-[#0f172a]">Supabase Schema & RLS Policy Verification</h3>
          </div>

          <p className="text-xs text-[#64748b]">
            All 11 cooperative tables in the Supabase PostgreSQL backend are protected by Row-Level Security policies that enforce <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#e2e8f0]">organization_id</code> checking.
          </p>

          <div className="grid-cols-2">
            <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-sm">
              <div className="text-xs font-semibold text-[#059669] mb-2 font-mono">RLS Policy: members</div>
              <pre className="font-mono text-[11px] text-[#0f172a] bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] m-0 whitespace-pre-wrap">
{`CREATE POLICY "Enforce org isolation on members"
ON members
FOR ALL
USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);`}
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-sm">
              <div className="text-xs font-semibold text-[#0284c7] mb-2 font-mono">RLS Policy: savings_accounts</div>
              <pre className="font-mono text-[11px] text-[#0f172a] bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] m-0 whitespace-pre-wrap">
{`CREATE POLICY "Enforce org isolation on savings"
ON savings_accounts
FOR ALL
USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
