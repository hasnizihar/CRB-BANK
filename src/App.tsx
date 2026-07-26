import { useState } from 'react';
import { Toaster } from 'sonner';
import type { UserRole } from './types';
import { LoginPage } from './features/auth/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { MemberLayout } from './layouts/MemberLayout';

// Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { MembersPage } from './features/members/MembersPage';
import { SavingsPage } from './features/savings/SavingsPage';
import { LoansPage } from './features/loans/LoansPage';
import { PawningPage } from './features/pawning/PawningPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { AdminPage } from './features/admin/AdminPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { MemberPortalPage } from './features/members/MemberPortalPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleSearchSelect = (term: string) => {
    setSearchTerm(term);
    if (term.toUpperCase().startsWith('MEM-')) {
      setActiveTab('members');
    } else if (term.toUpperCase().startsWith('SAV-')) {
      setActiveTab('savings');
    } else if (term.toUpperCase().startsWith('LON-')) {
      setActiveTab('loans');
    } else if (term.toUpperCase().startsWith('PWN-')) {
      setActiveTab('pawning');
    } else {
      setActiveTab('members');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" theme="dark" richColors />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderContent = () => {
    if (currentRole === 'MEMBER' && activeTab === 'dashboard') {
      return <MemberPortalPage onNavigate={setActiveTab} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage currentRole={currentRole} onNavigate={setActiveTab} />;
      case 'members':
        return <MembersPage initialSearch={searchTerm} />;
      case 'savings':
        return <SavingsPage />;
      case 'loans':
        return <LoansPage />;
      case 'pawning':
        return <PawningPage />;
      case 'reports':
        return <ReportsPage />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return currentRole === 'MEMBER' ? <MemberPortalPage onNavigate={setActiveTab} /> : <DashboardPage currentRole={currentRole} onNavigate={setActiveTab} />;
    }
  };

  const LayoutComponent = currentRole === 'MEMBER' ? MemberLayout : AdminLayout;

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <LayoutComponent
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchTerm('');
        }}
        onSearchSelect={handleSearchSelect}
      >
        {renderContent()}
      </LayoutComponent>
    </>
  );
}
