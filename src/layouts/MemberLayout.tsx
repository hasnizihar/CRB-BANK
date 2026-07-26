import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { UserRole } from '../types';
import type { AuthSession } from '../lib/auth';

interface MemberLayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSearchSelect?: (term: string) => void;
  onLogout?: () => void;
  sessionInfo?: AuthSession | null;
  children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  onLogout,
  sessionInfo,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header 
        currentRole={currentRole} 
        onRoleChange={onRoleChange}
        onLogout={onLogout}
        sessionInfo={sessionInfo}
      />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={onSelectTab} 
          currentRole={currentRole} 
        />
        
        <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0, padding: '2rem 3rem 4rem 3rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
