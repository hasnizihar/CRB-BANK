import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import type { UserRole } from './types';
import { getStoredSession, clearSession, sessionMinutesRemaining } from './lib/auth';
import type { AuthSession } from './lib/auth';
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
  // ─── Auth State ─────────────────────────────────────────────────────
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [currentRole, setCurrentRole] = useState<UserRole>(session?.role || 'SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isAuthenticated = !!session;

  // ─── Session Expiry Watcher ─────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const mins = sessionMinutesRemaining(session);

      // Warn at 15 minutes
      if (mins === 15) {
        toast.warning('Your session will expire in 15 minutes. Please save your work.', { id: 'session-warn' });
      }

      // Auto-logout at expiry
      if (mins <= 0) {
        handleLogout('session_expired');
      }
    }, 60_000); // check every minute

    return () => clearInterval(interval);
  }, [session]);

  // ─── Login Handler ──────────────────────────────────────────────────
  const handleLoginSuccess = (role: UserRole, _email: string, _fullName: string) => {
    const freshSession = getStoredSession();
    setSession(freshSession);
    setCurrentRole(role);
    setActiveTab('dashboard');
  };

  // ─── Logout Handler ─────────────────────────────────────────────────
  const handleLogout = useCallback((reason?: string) => {
    clearSession();
    setSession(null);
    setActiveTab('dashboard');

    if (reason === 'session_expired') {
      toast.error('Session expired. Please sign in again.', { duration: 5000 });
    } else {
      toast.info('You have been signed out securely.');
    }
  }, []);

  // ─── Search Navigation ──────────────────────────────────────────────
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

  // ─── Unauthenticated: Show Login ────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" theme="light" richColors />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // ─── Content Renderer ───────────────────────────────────────────────
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
      <Toaster position="top-right" theme="light" richColors closeButton />
      <LayoutComponent
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchTerm('');
        }}
        onSearchSelect={handleSearchSelect}
        onLogout={handleLogout}
        sessionInfo={session}
      >
        {renderContent()}
      </LayoutComponent>
    </>
  );
}
