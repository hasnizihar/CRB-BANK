import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  HandCoins, 
  Gem, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Building2
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, currentRole }) => {
  const isAdminOrStaff = currentRole !== 'MEMBER';

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users, badge: '5' },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'loans', label: 'Loans', icon: HandCoins },
    { id: 'pawning', label: 'Pawning', icon: Gem },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'admin', label: 'Administration', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const memberNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Member Home', icon: LayoutDashboard },
    { id: 'savings', label: 'My Accounts', icon: PiggyBank },
    { id: 'loans', label: 'My Loans', icon: HandCoins },
    { id: 'pawning', label: 'My Pawning', icon: Gem },
    { id: 'reports', label: 'Statements', icon: FileText },
  ];

  const items = isAdminOrStaff ? adminNavItems : memberNavItems;

  return (
    <aside style={{
      width: '250px',
      minWidth: '250px',
      background: '#0f172a',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 61px)',
      position: 'sticky',
      top: '61px',
      zIndex: 30
    }}>
      {/* Organization Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <Building2 size={13} style={{ color: 'var(--accent-primary)' }} />
          <span>Active Institution</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginTop: '0.3rem' }}>
          Kattankudy MPCS Ltd
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
          Branch Code: <span className="mono" style={{ color: 'var(--text-muted)' }}>KTK-01</span>
        </div>
      </div>

      {/* Navigation menu */}
      <div style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', padding: '0 0.75rem 0.5rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
          {isAdminOrStaff ? 'Administration Portal' : 'Member Portal View'}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? '#1e293b' : 'transparent',
                  border: isActive ? '1px solid #334155' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--accent-primary)' : '#1e293b',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Help */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#1e293b', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>RLS Multi-Tenant</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
            System isolated by Org ID (<span className="mono" style={{ color: 'var(--text-main)' }}>org-1</span>). Audit ledger active.
          </p>
        </div>
      </div>
    </aside>
  );
};
