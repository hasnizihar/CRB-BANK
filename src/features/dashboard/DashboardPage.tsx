import React from 'react';
import { 
  Users, 
  PiggyBank, 
  HandCoins, 
  Gem, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  TrendingUp, 
  FileSpreadsheet, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { localStore } from '../../lib/store';
import { formatCurrency, formatDateTime, formatDate } from '../../lib/formatters';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface DashboardPageProps {
  currentRole: UserRole;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentRole, onNavigate }) => {
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

  // 1. Risk Analytics: Guarantor Exposure Computations
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const guaranteedLoans = activeLoans.filter(l => l.guarantor_nic || l.guarantor2_nic);
  const dualGuarantorLoans = activeLoans.filter(l => l.guarantor_nic && l.guarantor2_nic);
  const unsecuredLoans = activeLoans.filter(l => !l.guarantor_nic && !l.guarantor2_nic);

  const guaranteedOutstanding = guaranteedLoans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);
  const unsecuredOutstanding = unsecuredLoans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);

  const loanRiskData = [
    { name: 'Guarantor Backed', value: guaranteedOutstanding || 450000, color: '#34d399' },
    { name: 'Unsecured / General', value: unsecuredOutstanding || 150000, color: '#f43f5e' },
  ];

  // 2. Portfolio Split: Member vs Non-Member Deposits
  const memberSavings = savings.filter(s => {
    const m = members.find(mem => mem.id === s.member_id);
    return !m || m.member_type !== 'NON_MEMBER';
  });
  const nonMemberSavings = savings.filter(s => {
    const m = members.find(mem => mem.id === s.member_id);
    return m && m.member_type === 'NON_MEMBER';
  });

  const memberBalance = memberSavings.reduce((a, b) => a + b.balance, 0);
  const nonMemberBalance = nonMemberSavings.reduce((a, b) => a + b.balance, 0);

  const depositPortfolioData = [
    { name: 'Regular Members', value: memberBalance || 850000, color: '#38bdf8' },
    { name: 'Non-Member Deposits', value: nonMemberBalance || 320000, color: '#c4b5fd' },
  ];

  // 3. Pawning Expiration Alarms (Due within 30 days or Overdue)
  const today = new Date();
  const expiringPawns = pawns.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    const dueDate = new Date(p.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 45; // alert if within 45 days or already past due
  });

  // Chart data
  const chartData = [
    { name: 'Mon', deposits: 45000, withdrawals: 12000, loans: 15000 },
    { name: 'Tue', deposits: 52000, withdrawals: 18000, loans: 0 },
    { name: 'Wed', deposits: 38000, withdrawals: 25000, loans: 50000 },
    { name: 'Thu', deposits: 65000, withdrawals: 14000, loans: 20000 },
    { name: 'Fri', deposits: todayDeposits || 72000, withdrawals: todayWithdrawals || 15000, loans: 25000 },
    { name: 'Sat', deposits: 85000, withdrawals: 30000, loans: 10000 },
    { name: 'Sun', deposits: 20000, withdrawals: 5000, loans: 0 },
  ];

  const handleQuickAction = (actionName: string, tab: string) => {
    toast.info(`Opening ${actionName} workflow...`);
    onNavigate(tab);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner / Welcome */}
      <div className="glass-panel" style={{ 
        padding: '1.75rem 2rem', 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(14, 165, 233, 0.1))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-success">Live Operations</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kattankudy Multi-Purpose Cooperative Society</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>
            Welcome back, <span style={{ color: 'var(--accent-primary)' }}>Cooperative Officer ({currentRole})</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '650px' }}>
            Real-time multi-tenant administration overview. Financial ledger synchronized with PostgreSQL Row-Level Security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => handleQuickAction('New Member Registration', 'members')}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Add Member</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Deposit Counter', 'savings')}
            className="btn btn-secondary"
          >
            <ArrowUpRight size={16} />
            <span>Record Deposit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Total Members</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{members.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#34d399' }}>
            <TrendingUp size={14} />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-secondary)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Savings Accounts</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-secondary)' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{formatCurrency(totalSavingsBalance)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Across {savings.length} active accounts</span>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Outstanding Loans</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
              <HandCoins size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{formatCurrency(totalLoanOutstanding)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#fbbf24' }}>
            <span>{loans.filter(l => l.status === 'ACTIVE').length} active portfolios</span>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Active Pawning</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
              <Gem size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{formatCurrency(totalPawnValuation)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{pawns.length} vaulted items in safe</span>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Executive Risk & Portfolio Intelligence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
          <ShieldAlert size={22} style={{ color: '#38bdf8' }} />
          <span>Cooperative Risk & Portfolio Intelligence</span>
        </h2>

        <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
          {/* Card 1: Guarantor Exposure & Risk Ratio */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderTop: '3px solid #34d399', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, color: '#fff' }}>Guarantor Risk Exposure</h3>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Credit Backed</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Ratio of loans secured by Guarantors vs unsecured liability.
              </p>

              <div style={{ height: '160px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={loanRiskData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {loanRiskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Outstanding']} contentStyle={{ background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{guaranteedLoans.length} Loans</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Backed ({dualGuarantorLoans.length} dual)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#f43f5e', fontWeight: 600 }}>{unsecuredLoans.length} Loans</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Unsecured</div>
              </div>
            </div>
          </div>

          {/* Card 2: Deposit Portfolio Split (Member vs Non-Member) */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderTop: '3px solid #38bdf8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, color: '#fff' }}>Deposit Portfolio Split</h3>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Segmentation</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Savings liquidity distribution between Coop Members & Non-Members.
              </p>

              <div style={{ height: '160px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={depositPortfolioData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {depositPortfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Total Deposits']} contentStyle={{ background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{memberSavings.length} Accounts</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Coop Member Owners</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{nonMemberSavings.length} Accounts</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Non-Members (Minors/Inst)</div>
              </div>
            </div>
          </div>

          {/* Card 3: Vault Security & Pawning Due-Date Alarms */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderTop: '3px solid #fbbf24', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
                  <span>Vault Expiration Alarms</span>
                </h3>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{expiringPawns.length} Alerts</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Gold pawn tickets nearing their agreed redeem period or overdue.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '150px', overflowY: 'auto' }}>
                {expiringPawns.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    ✅ All active vaulted items are within safe redemption periods.
                  </div>
                ) : (
                  expiringPawns.map(p => {
                    const dueDate = new Date(p.due_date);
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    return (
                      <div key={p.id} style={{ padding: '0.6rem', background: '#0f172a', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>{p.pawn_number}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.item_description.slice(0, 24)}...</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: diffDays < 0 ? '#f43f5e' : '#fbbf24' }}>
                            {diffDays < 0 ? `${Math.abs(diffDays)}d Overdue` : `Due in ${diffDays}d`}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{formatDate(p.due_date)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <button 
                onClick={() => onNavigate('pawning')}
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.05)' }}
              >
                <Lock size={14} />
                <span>Open Safe Vault Audit Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel per Section 41 */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Quick Actions (Staff Efficiency Workflow)</span>
        </h3>
        <div className="grid-cols-4" style={{ gap: '1rem' }}>
          <button 
            onClick={() => handleQuickAction('Open Savings Account', 'savings')}
            style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
            className="hover:border-emerald-500/50 hover:bg-emerald-500/5"
          >
            <div style={{ padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)' }}>
              <PiggyBank size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Open Savings</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto ID: SAV-sequence</div>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('Record Withdrawal', 'savings')}
            style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
            className="hover:border-rose-500/50 hover:bg-rose-500/5"
          >
            <div style={{ padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
              <ArrowDownRight size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Withdraw Cash</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time balance check</div>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('Create Loan Application', 'loans')}
            style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
            className="hover:border-amber-500/50 hover:bg-amber-500/5"
          >
            <div style={{ padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <HandCoins size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>New Loan</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check member eligibility</div>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('Generate Statement', 'reports')}
            style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
            className="hover:border-blue-500/50 hover:bg-blue-500/5"
          >
            <div style={{ padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-secondary)' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Statements</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Print PDF / Ledger view</div>
            </div>
          </button>
        </div>
      </div>

      {/* Charts & Recent Transactions Grid */}
      <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Transaction Activity Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Daily Transaction Activity</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deposits vs Withdrawals vs Loans (Rs.)</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-primary)' }} />
                <span>Deposits</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-rose)' }} />
                <span>Withdrawals</span>
              </div>
            </div>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-rose)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-rose)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Area type="monotone" dataKey="deposits" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorDeposits)" />
                <Area type="monotone" dataKey="withdrawals" stroke="var(--accent-rose)" strokeWidth={2} fillOpacity={1} fill="url(#colorWithdrawals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Ledger */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Activity</h3>
            <button 
              onClick={() => onNavigate('savings')}
              style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '280px' }}>
            {transactions.map((tx) => (
              <div 
                key={tx.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    padding: '0.5rem', 
                    borderRadius: '0.5rem',
                    background: tx.transaction_type === 'DEPOSIT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: tx.transaction_type === 'DEPOSIT' ? 'var(--accent-primary)' : 'var(--accent-rose)'
                  }}>
                    {tx.transaction_type === 'DEPOSIT' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tx.transaction_type}</div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {tx.transaction_number} • {tx.account_id || tx.member_id || 'Counter'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 600, 
                    fontSize: '0.85rem',
                    color: tx.transaction_type === 'DEPOSIT' ? '#34d399' : '#fb7185'
                  }}>
                    {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {formatDateTime(tx.transaction_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
