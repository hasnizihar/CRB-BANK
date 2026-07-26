import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  History, 
  Search, 
  RefreshCw,
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
  const [audits, setAudits] = useState(localStore.getAudits());

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

  const handleRefreshAudits = () => {
    setAudits(localStore.getAudits());
    toast.success('Audit logs refreshed from storage');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      toast.error('Please enter name and official email address');
      return;
    }
    const newStaff: StaffUser = {
      id: `usr-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      status: 'ACTIVE',
      lastLogin: 'Never'
    };
    setStaffUsers([newStaff, ...staffUsers]);
    setShowNewStaff(false);
    setNewStaffName('');
    setNewStaffEmail('');
    toast.success(`Staff account created for ${newStaffName} (${newStaffRole})`);

    localStore.addAudit({
      organization_id: 'org-1',
      user_email: 'admin@kattankudympcs.lk',
      action: 'RBAC_USER_CREATED',
      target_id: newStaff.id,
      target_type: 'USER',
      details: `Granted ${newStaffRole} access to new officer ${newStaffName} (${newStaffEmail})`
    });
  };

  const handleUpdateRole = (id: string) => {
    const user = staffUsers.find(u => u.id === id);
    if (!user) return;
    setStaffUsers(staffUsers.map(u => u.id === id ? { ...u, role: editRole } : u));
    setEditingStaffId(null);
    toast.success(`Updated ${user.name}'s security role to ${editRole}`);

    localStore.addAudit({
      organization_id: 'org-1',
      user_email: 'admin@kattankudympcs.lk',
      action: 'RBAC_ROLE_UPDATED',
      target_id: id,
      target_type: 'USER',
      details: `Modified permission boundary for ${user.name} from ${user.role} to ${editRole}`
    });
  };

  const toggleUserStatus = (id: string) => {
    setStaffUsers(staffUsers.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        toast.info(`Officer ${u.name} status changed to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={28} style={{ color: '#10b981' }} />
            <span>Security & Administration Portal</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Monitor immutable system audit logs, manage RBAC permissions, and inspect Supabase schema.
          </p>
        </div>

        <button onClick={handleRefreshAudits} className="btn btn-outline">
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', width: 'fit-content', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('roles')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'roles' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeTab === 'roles' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Users size={16} />
          <span>RBAC Staff Roles & Permissions ({staffUsers.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'audit' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeTab === 'audit' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <History size={16} />
          <span>System Audit Ledger ({audits.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('database')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'database' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeTab === 'database' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Database size={16} />
          <span>Supabase RLS Inspection</span>
        </button>
      </div>

      {/* Tab 1: RBAC Staff Roles & Permission Matrix */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Header */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} />
                <span>Cooperative Staff Directory & Role Access Control</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Assign fine-grained access boundaries for Kattankudy MPCS branch officers.
              </p>
            </div>

            <button 
              onClick={() => setShowNewStaff(!showNewStaff)}
              className="btn btn-primary"
              style={{ background: '#34d399', color: '#0f172a', fontWeight: 600 }}
            >
              <Plus size={18} />
              <span>{showNewStaff ? 'Close Form' : 'Provision New Staff Officer'}</span>
            </button>
          </div>

          {/* New Staff Form */}
          {showNewStaff && (
            <form onSubmit={handleCreateStaff} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: '#1e293b', borderLeft: '4px solid #34d399', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} />
                <span>Provision New Cooperative Staff Officer</span>
              </h4>

              <div className="grid-cols-3" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" placeholder="e.g. Ibrahim Kaleel" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Cooperative Email *</label>
                  <input type="email" placeholder="e.g. kaleel@kattankudympcs.lk" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Role *</label>
                  <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value as any)}>
                    <option value="CASHIER_TELLER">Cashier / Teller (Deposits & Withdrawals Only)</option>
                    <option value="LOAN_OFFICER">Loan Officer (Credit Appraisal & Disbursements)</option>
                    <option value="PAWN_APPRAISER">Pawn Appraiser (Gold Valuation & Safe Vault)</option>
                    <option value="BRANCH_MANAGER">Branch Manager (Full Operations Review)</option>
                    <option value="SUPER_ADMIN">Super Administrator (Full Access & RBAC Control)</option>
                    <option value="AUDITOR_READONLY">External Auditor (Read-Only Ledger Access)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowNewStaff(false)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', background: '#34d399', color: '#0f172a', fontWeight: 600 }}>
                  Authorize Account
                </button>
              </div>
            </form>
          )}

          {/* Staff Table */}
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Email Address</th>
                  <th>Assigned RBAC Role</th>
                  <th>Account Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'right' }}>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                    </td>
                    <td className="mono" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      {editingStaffId === u.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <select value={editRole} onChange={e => setEditRole(e.target.value as any)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#0f172a' }}>
                            <option value="CASHIER_TELLER">CASHIER_TELLER</option>
                            <option value="LOAN_OFFICER">LOAN_OFFICER</option>
                            <option value="PAWN_APPRAISER">PAWN_APPRAISER</option>
                            <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="AUDITOR_READONLY">AUDITOR_READONLY</option>
                          </select>
                          <button onClick={() => handleUpdateRole(u.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', background: '#34d399', color: '#0f172a' }} title="Save">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingStaffId(null)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${
                          u.role === 'SUPER_ADMIN' ? 'badge-purple' : 
                          u.role === 'BRANCH_MANAGER' ? 'badge-success' : 
                          u.role === 'AUDITOR_READONLY' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(u.id)} 
                        className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingStaffId(u.id); setEditRole(u.role); }}
                        className="btn btn-outline" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                      >
                        <Edit3 size={13} style={{ marginRight: '0.3rem' }} />
                        <span>Edit Role</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RBAC Permission Boundary Matrix */}
          <div className="glass-panel" style={{ padding: '1.75rem', background: '#0f172a', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              <span>RBAC Operational Permission Matrix</span>
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0' }}>
              Summary of enforced operational boundaries per staff role. Supabase Row-Level Security validates JWT claims against this matrix.
            </p>

            <div className="table-container" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Security Role</th>
                    <th style={{ textAlign: 'center' }}>Savings Deposits/Withdrawals</th>
                    <th style={{ textAlign: 'center' }}>Loan Disbursal & Approval</th>
                    <th style={{ textAlign: 'center' }}>Gold Pawning Safe Vault</th>
                    <th style={{ textAlign: 'center' }}>Audit Logs & System Reset</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#c4b5fd' }}>SUPER_ADMIN</td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#34d399' }}>BRANCH_MANAGER</td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#38bdf8' }}>LOAN_OFFICER</td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#fbbf24' }}>PAWN_APPRAISER</td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#a78bfa' }}>CASHIER_TELLER</td>
                    <td style={{ textAlign: 'center', color: '#34d399' }}><Check size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center', color: '#f43f5e' }}><X size={18} style={{ margin: '0 auto' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#f87171' }}>AUDITOR_READONLY</td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>Read-Only</td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>Read-Only</td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>Read-Only</td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>Read-Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Ledger */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search audit trail by action name, user email, ID, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="table-container glass-panel">
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
                    <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(a.created_at)}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'none' }}>
                        {a.action}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                        {a.target_id || 'N/A'} <small style={{ color: 'var(--text-dim)' }}>({a.target_type})</small>
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '0.8rem' }}>{a.user_email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Supabase & RLS */}
      {activeTab === 'database' && (
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#38bdf8' }}>
            <Terminal size={24} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Supabase Schema & RLS Policy Verification</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            All 11 cooperative tables in the Supabase PostgreSQL backend are protected by Row-Level Security policies that enforce <code className="mono">organization_id</code> checking.
          </p>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#34d399', marginBottom: '0.5rem' }}>RLS Policy: members</div>
              <pre className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap' }}>
{`CREATE POLICY "Enforce org isolation on members"
ON members
FOR ALL
USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);`}
              </pre>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>RLS Policy: savings_accounts</div>
              <pre className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap' }}>
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
