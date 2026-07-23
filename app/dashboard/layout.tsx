import { Sidebar, Topbar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)]">
      <Sidebar />
      <div className="lg:pl-60 transition-all duration-300">
        <Topbar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
