import React from 'react';
import { 
  Users, 
  PiggyBank, 
  HandCoins, 
  Gem, 
  ArrowUpRight, 
  PlusCircle, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { localStore } from '../../lib/store';
import { formatCurrency, formatDateTime, formatDate } from '../../lib/formatters';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface DashboardPageProps {
  currentRole: UserRole;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentRole: _currentRole, onNavigate }) => {
  const members = localStore.getMembers();
  const savings = localStore.getSavings();
  const loans = localStore.getLoans();
  const pawns = localStore.getPawns();
  const transactions = localStore.getTransactions();

  // Calculations
  const totalSavingsBalance = savings.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLoanOutstanding = loans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);
  const totalPawnValuation = pawns.reduce((acc, curr) => acc + curr.valuation_amount, 0);

  const todayDeposits = transactions
    .filter(t => t.transaction_type === 'DEPOSIT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayWithdrawals = transactions
    .filter(t => t.transaction_type === 'WITHDRAWAL')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Expiring Pawns (Due within 45 days or overdue)
  const today = new Date();
  const expiringPawns = pawns.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    const dueDate = new Date(p.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 45;
  });

  // Simple clean chart data
  const chartData = [
    { name: 'Mon', deposits: 45000, withdrawals: 12000 },
    { name: 'Tue', deposits: 52000, withdrawals: 18000 },
    { name: 'Wed', deposits: 38000, withdrawals: 25000 },
    { name: 'Thu', deposits: 65000, withdrawals: 14000 },
    { name: 'Fri', deposits: todayDeposits || 72000, withdrawals: todayWithdrawals || 15000 },
    { name: 'Sat', deposits: 85000, withdrawals: 30000 },
    { name: 'Sun', deposits: 20000, withdrawals: 5000 },
  ];

  const handleQuickAction = (action: string) => {
    toast.success(`Opening ${action} module...`);
    onNavigate(action);
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>Core Operations</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Institutional Ledger Dashboard</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Real-time operational summary, balance verifications, and audit overview.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => handleQuickAction('members')}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}
          >
            <PlusCircle size={16} />
            <span>New Member</span>
          </button>
          <button 
            onClick={() => handleQuickAction('loans')}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}
          >
            <HandCoins size={16} />
            <span>Issue Loan</span>
          </button>
        </div>
      </div>

      {/* Top Summary Row (4 equal cards) */}
      <div className="grid-cols-4">
        <div className="glass-panel p-4">
          <div className="flex-between text-[#64748b] text-xs font-medium">
            <span>Total Active Members</span>
            <Users size={16} className="text-[#0284c7]" />
          </div>
          <div className="mt-2 text-xl font-semibold font-mono text-[#0f172a]">
            {members.length}
          </div>
          <div className="mt-1 text-[11px] text-[#059669] flex items-center gap-1">
            <ArrowUpRight size={12} />
            <span>+12 verified this month</span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex-between text-[#64748b] text-xs font-medium">
            <span>Loan Portfolio Outstanding</span>
            <HandCoins size={16} className="text-[#0284c7]" />
          </div>
          <div className="mt-2 text-xl font-semibold font-mono text-[#0f172a]">
            {formatCurrency(totalLoanOutstanding)}
          </div>
          <div className="mt-1 text-[11px] text-[#64748b]">
            Across {loans.filter(l => l.status === 'ACTIVE').length} active borrower agreements
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex-between text-[#64748b] text-xs font-medium">
            <span>Savings Deposit Base</span>
            <PiggyBank size={16} className="text-[#059669]" />
          </div>
          <div className="mt-2 text-xl font-semibold font-mono text-[#0f172a]">
            {formatCurrency(totalSavingsBalance)}
          </div>
          <div className="mt-1 text-[11px] text-[#059669] flex items-center gap-1">
            <ArrowUpRight size={12} />
            <span>+4.2% liquidity reserve growth</span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex-between text-[#64748b] text-xs font-medium">
            <span>Vault Security & Expiring</span>
            <Gem size={16} className="text-[#d97706]" />
          </div>
          <div className="mt-2 text-xl font-semibold font-mono text-[#0f172a]">
            {formatCurrency(totalPawnValuation)}
          </div>
          <div className="mt-1 text-[11px] text-[#d97706] font-medium flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>{expiringPawns.length} ticket(s) due ≤ 45 days</span>
          </div>
        </div>
      </div>

      {/* Middle Analytical Zone: Single Clean Chart */}
      <div className="glass-panel p-5">
        <div className="flex-between mb-4 pb-3 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-sm font-semibold text-[#0f172a]">Weekly Cashflow & Deposit Liquidity</h2>
            <p className="text-xs text-[#64748b]">Branch KTK-01 • Daily deposit inflows vs withdrawal outflows</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#0284c7]" />
              <span className="text-[#64748b]">Deposits (Inflow)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#94a3b8]" />
              <span className="text-[#64748b]">Withdrawals (Outflow)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)', fontSize: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Amount']}
              />
              <Area type="monotone" dataKey="deposits" stroke="#0284c7" fillOpacity={0.1} fill="#0284c7" strokeWidth={2} />
              <Area type="monotone" dataKey="withdrawals" stroke="#94a3b8" fillOpacity={0.1} fill="#94a3b8" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Operational Split (2-Column Grid) */}
      <div className="grid-cols-2">
        {/* Left: Vault Security & Expiration Alarm Ledger */}
        <div className="glass-panel flex flex-col overflow-hidden">
          <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#d97706]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0f172a]">Pawning Expiration Alarm (≤ 45 Days)</h3>
            </div>
            <span className="badge badge-warning">{expiringPawns.length} Action Required</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Member</th>
                  <th className="text-right">Valuation</th>
                  <th>Due Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {expiringPawns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#64748b]">
                      No vault pawn tickets are nearing expiration.
                    </td>
                  </tr>
                ) : (
                  expiringPawns.slice(0, 5).map((p) => {
                    const m = members.find(mem => mem.id === p.member_id);
                    return (
                      <tr key={p.id}>
                        <td className="font-mono text-xs font-medium text-[#0f172a]">{p.id}</td>
                        <td className="text-xs text-[#0f172a]">{m ? `${m.first_name} ${m.last_name}` : 'Unknown Member'}</td>
                        <td className="text-right font-mono text-xs text-[#0f172a]">{formatCurrency(p.valuation_amount)}</td>
                        <td className="text-xs font-mono text-[#d97706]">{formatDate(p.due_date)}</td>
                        <td className="text-right">
                          <button 
                            onClick={() => {
                              toast.info(`Sending reminder notice for Ticket ${p.id}...`);
                              onNavigate('pawning');
                            }}
                            className="text-xs text-[#0284c7] hover:underline font-medium"
                          >
                            Redeem / Notice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] text-right">
            <button onClick={() => onNavigate('pawning')} className="text-xs text-[#0284c7] font-medium hover:underline inline-flex items-center gap-1">
              <span>View full vault pawning ledger</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Right: Recent Branch Activity Ledger */}
        <div className="glass-panel flex flex-col overflow-hidden">
          <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#0284c7]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0f172a]">Chronological Branch Activity</h3>
            </div>
            <span className="text-xs text-[#64748b] font-mono">Live Audit Trail</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Trans ID</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs text-[#64748b]">{t.id}</td>
                    <td>
                      <span className={`badge ${
                        t.transaction_type === 'DEPOSIT' ? 'badge-success' :
                        t.transaction_type === 'WITHDRAWAL' ? 'badge-warning' :
                        t.transaction_type === 'LOAN_DISBURSEMENT' ? 'badge-info' : 'badge-purple'
                      }`}>
                        {t.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-xs text-[#64748b] font-mono">{formatDateTime(t.created_at)}</td>
                    <td className="text-right font-mono text-xs font-medium text-[#0f172a]">
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] text-right">
            <button onClick={() => onNavigate('reports')} className="text-xs text-[#0284c7] font-medium hover:underline inline-flex items-center gap-1">
              <span>Export consolidated audit CSV</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
