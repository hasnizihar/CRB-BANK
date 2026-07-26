import React, { useState } from 'react';
import { Search, Bell, Shield, User, ChevronDown, RefreshCw } from 'lucide-react';
import type { UserRole } from '../types';
import { localStore } from '../lib/store';
import { toast } from 'sonner';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearchSelect?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onSearchSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0.75rem 1.5rem', 
      background: '#0f172a',
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
            background: '#10b981',
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
            <h2 style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.2, fontWeight: 600 }}>Kattankudy MPCS Ltd</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cooperative Rural Bank Management</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search member (MEM-000001), account, NIC, loan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.25rem', 
              background: '#1e293b', 
              borderColor: 'var(--border-color)',
              fontSize: '0.85rem',
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem'
            }}
          />
        </form>
      </div>

      {/* Actions & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={handleResetDemo}
          title="Reset Demo Database"
          className="btn btn-outline"
          style={{ 
            padding: '0.35rem 0.65rem', 
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <RefreshCw size={13} />
          <span>Reset Demo</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button style={{ position: 'relative', color: 'var(--text-muted)', padding: '0.4rem', display: 'flex', alignItems: 'center' }}>
            <Bell size={17} />
            <span style={{ 
              position: 'absolute', 
              top: '0.3rem', 
              right: '0.3rem', 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)'
            }} />
          </button>
        </div>

        <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />

        {/* Role Switcher dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.35rem 0.65rem',
              background: '#1e293b',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            <Shield size={14} style={{ color: currentRole === 'SUPER_ADMIN' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }} />
            <span>Role: <strong style={{ color: '#fff', fontWeight: 600 }}>{currentRole}</strong></span>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
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
              background: '#1e293b',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0.35rem 0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
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
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    color: currentRole === role ? '#fff' : 'var(--text-muted)',
                    background: currentRole === role ? '#334155' : 'transparent',
                    fontWeight: currentRole === role ? 600 : 400
                  }}
                >
                  <div style={{ 
                    width: '5px', 
                    height: '5px', 
                    borderRadius: '50%', 
                    background: currentRole === role ? 'var(--accent-primary)' : 'transparent' 
                  }} />
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ 
            width: '1.8rem', 
            height: '1.8rem', 
            borderRadius: '0.375rem', 
            background: '#334155', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}>
            <User size={13} />
          </div>
        </div>
      </div>
    </header>
  );
};
