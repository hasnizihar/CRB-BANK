import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { UserRole } from '../types';

interface MemberLayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header 
        currentRole={currentRole} 
        onRoleChange={onRoleChange} 
      />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={onSelectTab} 
          currentRole={currentRole} 
        />
        
        <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0, paddingBottom: '3rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
