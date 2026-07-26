import React, { useState } from 'react';
import { Search, Bell, Shield, User, ChevronDown, RefreshCw, LogOut, Clock } from 'lucide-react';
import type { UserRole } from '../types';
import type { AuthSession } from '../lib/auth';
import { sessionMinutesRemaining } from '../lib/auth';
import { localStore } from '../lib/store';
import { toast } from 'sonner';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearchSelect?: (term: string) => void;
  onLogout?: () => void;
  sessionInfo?: AuthSession | null;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onSearchSelect, onLogout, sessionInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearchSelect) {
      onSearchSelect(searchTerm.trim());
      toast.info(`Searching across Kattankudy MPCS records for "${searchTerm}"...`);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data to default Kattankudy MPCS Ltd records?')) {
      localStore.resetToDefaults();
      toast.success('Demo records reset successfully! Reloading...');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setShowUserMenu(false);
      onLogout?.();
    }
  };

  const minsRemaining = sessionInfo ? sessionMinutesRemaining(sessionInfo) : 0;
  const hoursRemaining = Math.floor(minsRemaining / 60);
  const minsLeft = minsRemaining % 60;

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0.75rem 1.5rem', 
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '2.25rem', 
            height: '2.25rem', 
            borderRadius: '0.375rem', 
            background: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#fff',
            letterSpacing: '-0.03em'
          }}>
            CRB
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.2, fontWeight: 600, color: '#0f172a' }}>Kattankudy MPCS Ltd</h2>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cooperative Rural Bank Management</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search member (MEM-000001), account, NIC, loan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.25rem', 
              background: '#f8fafc', 
              borderColor: '#e2e8f0',
              color: '#0f172a',
              fontSize: '0.85rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem'
            }}
          />
        </form>
      </div>

      {/* Actions & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={handleResetDemo}
          title="Reset Demo Database"
          className="btn btn-outline"
          style={{ 
            padding: '0.35rem 0.65rem', 
            fontSize: '0.75rem',
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <RefreshCw size={13} />
          <span>Reset Demo</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button style={{ position: 'relative', color: '#64748b', padding: '0.4rem', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Bell size={17} />
            <span style={{ 
              position: 'absolute', 
              top: '0.3rem', 
              right: '0.3rem', 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: '#0284c7'
            }} />
          </button>
        </div>

        <div style={{ height: '1.25rem', width: '1px', background: '#e2e8f0' }} />

        {/* Role Switcher dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowUserMenu(false); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.35rem 0.65rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Shield size={14} style={{ color: currentRole === 'SUPER_ADMIN' ? '#0284c7' : '#64748b' }} />
            <span>Role: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{currentRole}</strong></span>
            <ChevronDown size={13} style={{ color: '#64748b' }} />
          </button>
          
          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.35rem',
              width: '190px',
              padding: '0.35rem',
              zIndex: 50,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', padding: '0.35rem 0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Switch Active Role
              </div>
              {(['SUPER_ADMIN', 'BANK_ADMIN', 'MANAGER', 'ACCOUNTANT', 'LOAN_OFFICER', 'MEMBER'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setShowRoleMenu(false);
                    toast.success(`Switched role to ${role}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    color: currentRole === role ? '#0284c7' : '#0f172a',
                    background: currentRole === role ? '#f0f9ff' : 'transparent',
                    fontWeight: currentRole === role ? 600 : 400,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ 
                    width: '5px', 
                    height: '5px', 
                    borderRadius: '50%', 
                    background: currentRole === role ? '#0284c7' : 'transparent' 
                  }} />
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User / Logout dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowRoleMenu(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.65rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#0f172a',
            }}
          >
            <div style={{ 
              width: '1.6rem', 
              height: '1.6rem', 
              borderRadius: '0.375rem', 
              background: '#f1f5f9', 
              border: '1px solid #e2e8f0',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}>
              <User size={12} />
            </div>
            {sessionInfo && (
              <span style={{ fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sessionInfo.fullName.split(' ')[0]}
              </span>
            )}
            <ChevronDown size={12} style={{ color: '#94a3b8' }} />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.35rem',
              width: '260px',
              padding: '0',
              zIndex: 50,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}>
              {/* User info section */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                  {sessionInfo?.fullName || 'Staff User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {sessionInfo?.email || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                  }}>
                    {currentRole}
                  </span>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}>
                    Branch: {sessionInfo?.branch || 'KTK-01'}
                  </span>
                </div>
              </div>

              {/* Session timer */}
              <div style={{ padding: '0.65rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
                <Clock size={12} style={{ color: minsRemaining < 30 ? '#dc2626' : '#64748b' }} />
                <span>Session: <strong style={{ color: minsRemaining < 30 ? '#dc2626' : '#0f172a' }}>{hoursRemaining}h {minsLeft}m</strong> remaining</span>
              </div>

              {/* Logout button */}
              <div style={{ padding: '0.5rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#dc2626',
                    background: '#fff1f2',
                    border: '1px solid #fecaca',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
