'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  HandCoins,
  ReceiptText,
  BookOpen,
  FileBarChart2,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Members', href: '/dashboard/members', icon: Users },
  { label: 'Savings', href: '/dashboard/savings', icon: Wallet },
  { label: 'Deposits', href: '/dashboard/deposits', icon: ArrowDownToLine },
  { label: 'Withdrawals', href: '/dashboard/withdrawals', icon: ArrowUpFromLine },
  { label: 'Loans', href: '/dashboard/loans', icon: HandCoins },
  { label: 'Loan Recovery', href: '/dashboard/loan-recovery', icon: ReceiptText },
  { label: 'Cash Book', href: '/dashboard/cash-book', icon: BookOpen },
  { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart2 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-sidebar-border)] bg-white">
        <div className="flex-shrink-0 w-8 h-8 rounded bg-brand-600 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Kattankudy MPCS
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              CRB System
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[var(--color-sidebar-border)] p-3 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-[var(--color-sidebar-border)] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors bg-white"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-200 z-30 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md ml-12 lg:ml-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search members, accounts, loans..."
            className="w-full pl-9 pr-4 py-1.5 rounded-md border border-slate-200 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
