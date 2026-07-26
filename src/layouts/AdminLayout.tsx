import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { UserRole } from '../types';

interface AdminLayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSearchSelect?: (term: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  onSearchSelect,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header 
        currentRole={currentRole} 
        onRoleChange={onRoleChange} 
        onSearchSelect={onSearchSelect} 
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
