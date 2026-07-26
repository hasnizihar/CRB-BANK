import React, { useState } from 'react';
import { 
  PiggyBank, 
  HandCoins, 
  Gem, 
  ShieldAlert, 
  FileSpreadsheet, 
  CheckCircle2,
  Calculator,
  Download
} from 'lucide-react';
import { localStore } from '../../lib/store';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/formatters';
import { toast } from 'sonner';

interface MemberPortalPageProps {
  onNavigate: (tab: string) => void;
}

export const MemberPortalPage: React.FC<MemberPortalPageProps> = ({ onNavigate }) => {
  const members = localStore.getMembers();
  const savings = localStore.getSavings();
  const loans = localStore.getLoans();
  const pawns = localStore.getPawns();

  // Allow switching member to demo self-service view
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const currentMember = members.find(m => m.id === selectedMemberId) || members[0];

  // Loan eligibility calculator state
  const [calcAmount, setCalcAmount] = useState<string>('100000');
  const [calcMonths, setCalcMonths] = useState<string>('12');
  const [calcRate, setCalcRate] = useState<string>('12.5');

  if (!currentMember) {
    return (
      <div style={{ padding: '2rem', color: '#fff' }}>
        <h2>No member profile found. Please register a member in administration.</h2>
      </div>
    );
  }

  // Member specific accounts
  const mySavings = savings.filter(s => s.member_id === currentMember.id);
  const myLoans = loans.filter(l => l.member_id === currentMember.id);
  const myPawns = pawns.filter(p => p.member_id === currentMember.id);

  // Guarantor responsibilities (loans where this member's NIC is guarantor_nic or guarantor2_nic)
  const myGuaranteedLoans = loans.filter(l => 
    l.status === 'ACTIVE' && 
    (l.guarantor_nic === currentMember.nic || l.guarantor2_nic === currentMember.nic)
  );

  // Financial summary
  const totalSavingsBalance = mySavings.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLoanOutstanding = myLoans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);
  const totalPawnValuation = myPawns.reduce((acc, curr) => acc + curr.valuation_amount, 0);
  const totalGuaranteedExposure = myGuaranteedLoans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);

  // Calculator computation
  const principal = parseFloat(calcAmount) || 0;
  const tenure = parseInt(calcMonths) || 1;
  const rate = parseFloat(calcRate) || 0;
  const monthlyRate = (rate / 100) / 12;
  const emi = monthlyRate > 0
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
    : principal / tenure;
  const totalPayable = emi * tenure;

  const handleExportStatement = () => {
    let csv = `KATTANKUDY MULTI-PURPOSE COOPERATIVE SOCIETY LTD\n`;
    csv += `MEMBER CONSOLIDATED STATEMENT\n`;
    csv += `Generated Date,${formatDateTime(new Date().toISOString())}\n`;
    csv += `Member Name,${currentMember.first_name} ${currentMember.last_name}\n`;
    csv += `Member Number,${currentMember.member_number}\n`;
    csv += `NIC Number,${currentMember.nic}\n\n`;

    csv += `--- SAVINGS ACCOUNTS ---\n`;
    csv += `Account No,Account Type,Balance (Rs.),Status\n`;
    mySavings.forEach(s => {
      csv += `${s.account_number},${s.account_type},${s.balance},${s.status}\n`;
    });
    csv += `Total Savings Balance,,${totalSavingsBalance},\n\n`;

    csv += `--- ACTIVE LOAN PORTFOLIOS ---\n`;
    csv += `Loan No,Loan Type,Total Amount,Outstanding (Rs.),Status\n`;
    myLoans.forEach(l => {
      csv += `${l.loan_number},${l.loan_type},${l.original_amount},${l.outstanding_amount},${l.status}\n`;
    });
    csv += `Total Loan Outstanding,,${totalLoanOutstanding},\n\n`;

    csv += `--- VAULTED GOLD PAWN TICKETS ---\n`;
    csv += `Pawn Ticket,Description,Valuation,Due Date,Status\n`;
    myPawns.forEach(p => {
      csv += `${p.pawn_number},"${p.item_description}",${p.valuation_amount},${formatDate(p.due_date)},${p.status}\n`;
    });

    if (myGuaranteedLoans.length > 0) {
      csv += `\n--- GUARANTOR CREDIT EXPOSURE ---\n`;
      csv += `Borrower Name,Loan No,Total Amount,Guaranteed Outstanding (Rs.)\n`;
      myGuaranteedLoans.forEach(g => {
        const borrower = members.find(m => m.id === g.member_id);
        csv += `"${borrower ? `${borrower.first_name} ${borrower.last_name}` : 'Unknown Borrower'}",${g.loan_number},${g.original_amount},${g.outstanding_amount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Statement_${currentMember.member_number}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Consolidated Member Statement downloaded as CSV!');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome & Member Selector Banner */}
      <div className="glass-panel" style={{ 
        padding: '1.75rem 2rem', 
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.1))',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-info" style={{ background: '#0e7490', color: '#fff' }}>Read-Only Transparency Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kattankudy Multi-Purpose Cooperative Society</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
            Welcome, <span style={{ color: '#38bdf8' }}>{currentMember.first_name} {currentMember.last_name}</span>
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span><strong>Member No:</strong> <code className="mono" style={{ color: '#fff' }}>{currentMember.member_number}</code></span>
            <span><strong>NIC:</strong> <code className="mono" style={{ color: '#fff' }}>{currentMember.nic}</code></span>
            <span><strong>Status:</strong> <span style={{ color: '#34d399', fontWeight: 600 }}>{currentMember.membership_status}</span></span>
          </div>
        </div>

        {/* Self-Service Switcher for Demo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#0f172a', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
            Switch Member View (Demo)
          </label>
          <select 
            value={selectedMemberId} 
            onChange={e => setSelectedMemberId(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.member_number})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Portfolio KPI Grid */}
      <div className="grid-cols-4">
        <div className="glass-card" style={{ borderLeft: '3px solid #38bdf8' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>My Savings Balance</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', color: '#fff' }}>{formatCurrency(totalSavingsBalance)}</div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.5rem' }}>Across {mySavings.length} deposit accounts</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid #fbbf24' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>My Loan Outstanding</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
              <HandCoins size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', color: '#fff' }}>{formatCurrency(totalLoanOutstanding)}</div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.5rem' }}>{myLoans.filter(l => l.status === 'ACTIVE').length} active borrow agreements</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid #c4b5fd' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Vaulted Gold Valuation</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(196, 181, 253, 0.1)', color: '#c4b5fd' }}>
              <Gem size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', color: '#fff' }}>{formatCurrency(totalPawnValuation)}</div>
          <div style={{ fontSize: '0.75rem', color: '#c4b5fd', marginTop: '0.5rem' }}>{myPawns.length} tickets safe-vaulted</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '3px solid #f43f5e' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Guarantor Risk Exposure</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', color: totalGuaranteedExposure > 0 ? '#f43f5e' : '#34d399' }}>
            {formatCurrency(totalGuaranteedExposure)}
          </div>
          <div style={{ fontSize: '0.75rem', color: totalGuaranteedExposure > 0 ? '#f43f5e' : '#34d399', marginTop: '0.5rem' }}>
            {myGuaranteedLoans.length} loans backed as Guarantor
          </div>
        </div>
      </div>

      {/* Main Content Grid: Accounts & Guarantor Transparency */}
      <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
        {/* Left Column: My Accounts & Loans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Savings List */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PiggyBank size={20} style={{ color: '#38bdf8' }} />
                <span>My Savings Accounts</span>
              </h3>
              <button onClick={() => onNavigate('savings')} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                View All
              </button>
            </div>

            {mySavings.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>No savings accounts found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mySavings.map(s => (
                  <div key={s.id} style={{ padding: '0.875rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{s.account_type.replace('_', ' ')}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{s.account_number}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>{formatCurrency(s.balance)}</div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loans List */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HandCoins size={20} style={{ color: '#fbbf24' }} />
                <span>My Active Loans</span>
              </h3>
              <button onClick={() => onNavigate('loans')} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                View All
              </button>
            </div>

            {myLoans.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>No active loan portfolios.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myLoans.map(l => (
                  <div key={l.id} style={{ padding: '0.875rem', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{l.loan_type.replace('_', ' ')}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{l.loan_number}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '1rem' }}>{formatCurrency(l.outstanding_amount)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>of {formatCurrency(l.original_amount)} total</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Guarantor Transparency & Financial Calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Guarantor Responsibility Transparency Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderTop: '3px solid #f43f5e' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} style={{ color: '#f43f5e' }} />
                <span>My Guarantor Responsibilities</span>
              </h3>
              <span className="badge badge-warning">{myGuaranteedLoans.length} Active Notice</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Full transparency on borrower loans where your cooperative membership credit is pledged as co-guarantor security.
            </p>

            {myGuaranteedLoans.length === 0 ? (
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                <CheckCircle2 size={24} style={{ color: '#34d399', margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.9rem' }}>Zero Guarantor Exposure</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>You have not pledged your NIC as guarantor for any active borrower loans.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myGuaranteedLoans.map(g => {
                  const borrower = members.find(m => m.id === g.member_id);
                  const isPrimary = g.guarantor_nic === currentMember.nic;
                  return (
                    <div key={g.id} style={{ padding: '0.875rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                      <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                          Borrower: {borrower ? `${borrower.first_name} ${borrower.last_name}` : 'Cooperative Borrower'}
                        </span>
                        <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>
                          {isPrimary ? 'Primary Guarantor 1' : 'Co-Guarantor 2'}
                        </span>
                      </div>
                      <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span className="mono">Loan: {g.loan_number}</span>
                        <span>Outstanding Liability: <strong style={{ color: '#f43f5e' }}>{formatCurrency(g.outstanding_amount)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Self-Service Financial Calculator */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderTop: '3px solid #34d399' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} style={{ color: '#34d399' }} />
              <span>Self-Service Loan Installment Calculator</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Estimate your monthly repayment installment (EMI) before submitting a credit application to your branch officer.
            </p>

            <div className="grid-cols-3" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Loan Amount (Rs.)</label>
                <input type="number" step="5000" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} className="mono" style={{ fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Tenure (Months)</label>
                <input type="number" step="1" min="1" max="60" value={calcMonths} onChange={e => setCalcMonths(e.target.value)} className="mono" style={{ fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Rate (% p.a.)</label>
                <input type="number" step="0.1" value={calcRate} onChange={e => setCalcRate(e.target.value)} className="mono" style={{ fontWeight: 600 }} />
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Monthly Repayment (EMI)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399', fontFamily: 'Outfit' }}>
                  {formatCurrency(emi)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Repayment</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: 'Outfit' }}>
                  {formatCurrency(totalPayable)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action: Download Consolidated Statement */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fff' }}>Download Consolidated Member Audit Statement</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Export an official CSV summary containing all your Savings balances, Loan outstanding liabilities, Pawning receipts, and Guarantor disclosures.
            </p>
          </div>
        </div>

        <button 
          onClick={handleExportStatement}
          className="btn btn-primary"
          style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 700, padding: '0.75rem 1.75rem' }}
        >
          <Download size={18} />
          <span>Export CSV Statement</span>
        </button>
      </div>
    </div>
  );
};
