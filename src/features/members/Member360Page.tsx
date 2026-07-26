import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  PiggyBank, 
  HandCoins, 
  Gem, 
  History, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Building2, 
  Calendar
} from 'lucide-react';
import { localStore } from '../../lib/store';
import type { Member, SavingsAccount, Loan, PawnRecord, AuditLog } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';

interface Member360PageProps {
  member: Member;
  onBack: () => void;
  onStatusToggle: (member: Member) => void;
}

export const Member360Page: React.FC<Member360PageProps> = ({ member, onBack, onStatusToggle }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'loans' | 'pawning' | 'audit' | 'guarantor'>('overview');

  // Fetch linked 360 records from store
  const savings: SavingsAccount[] = localStore.getSavings().filter(s => s.member_id === member.id);
  const loans: Loan[] = localStore.getLoans().filter(l => l.member_id === member.id);
  const pawns: PawnRecord[] = localStore.getPawns().filter(p => p.member_id === member.id);
  const audits: AuditLog[] = localStore.getAudits().filter(a => 
    a.target_id === member.member_number || 
    a.details.includes(member.first_name) ||
    a.details.includes(member.last_name)
  );

  const guaranteedLoans: Loan[] = localStore.getLoans().filter(l => 
    (l.status === 'ACTIVE' || l.status === 'APPROVED' || l.status === 'DRAFT' || l.status === 'PENDING') &&
    (l.guarantor_nic === member.nic || l.guarantor2_nic === member.nic || l.guarantor_name === `${member.first_name} ${member.last_name}` || l.guarantor2_name === `${member.first_name} ${member.last_name}`)
  );
  const totalGuaranteedExposure = guaranteedLoans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);

  const totalSavingsBalance = savings.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLoanOutstanding = loans.reduce((acc, curr) => acc + curr.outstanding_amount, 0);
  const totalPawnValuation = pawns.reduce((acc, curr) => acc + curr.valuation_amount, 0);
  const totalPawnAdvanced = pawns.reduce((acc, curr) => acc + curr.loan_amount, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Navigation */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack} 
            className="btn btn-outline" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Members Registry</span>
          </button>
          
          <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Members</span>
            <span>/</span>
            <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 600 }}>{member.member_number}</span>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 500 }}>360° Profile View</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => onStatusToggle(member)}
            className={`btn ${member.membership_status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'}`}
            style={{ 
              padding: '0.45rem 0.85rem', 
              fontSize: '0.8rem',
              borderColor: member.membership_status === 'ACTIVE' ? 'rgba(225, 29, 72, 0.4)' : undefined,
              color: member.membership_status === 'ACTIVE' ? '#fb7185' : '#ffffff'
            }}
          >
            {member.membership_status === 'ACTIVE' ? (
              <>
                <UserX size={15} />
                <span>Suspend Membership</span>
              </>
            ) : (
              <>
                <UserCheck size={15} />
                <span>Reactivate Membership</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Member Profile Summary Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              borderRadius: '0.75rem', 
              background: '#0f172a', 
              border: '1px solid var(--border-color)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#10b981'
            }}>
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>{member.first_name} {member.last_name}</h1>
                <span className={`badge ${
                  member.membership_status === 'ACTIVE' ? 'badge-success' : 
                  member.membership_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {member.membership_status}
                </span>
                <span className="badge badge-info" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  KYC Verified
                </span>
                {member.member_type === 'NON_MEMBER' && (
                  <span className="badge badge-info" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    Non-Member Type: {member.non_member_type || 'General'}
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.4rem' }}>
                <div>ID: <strong className="mono" style={{ color: '#fff' }}>{member.member_number}</strong></div>
                <div>NIC: <strong className="mono" style={{ color: '#fff' }}>{member.nic}</strong></div>
                <div>Joined: <strong style={{ color: '#fff' }}>{formatDate(member.membership_date)}</strong></div>
                <div>Branch: <strong style={{ color: '#fff' }}>KTK-01 (Kattankudy)</strong></div>
              </div>
            </div>
          </div>

          {/* Key Financial KPIs on Profile Header */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '150px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Savings</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                {formatCurrency(totalSavingsBalance)}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '150px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Loan Outstanding</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: totalLoanOutstanding > 0 ? '#fbbf24' : '#94a3b8', marginTop: '0.2rem' }}>
                {formatCurrency(totalLoanOutstanding)}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '150px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gold Vaulted Value</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#c4b5fd', marginTop: '0.2rem' }}>
                {formatCurrency(totalPawnValuation)}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '150px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Guarantor Exposure</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: totalGuaranteedExposure > 0 ? '#f43f5e' : '#34d399', marginTop: '0.2rem' }}>
                {formatCurrency(totalGuaranteedExposure)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 360 Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'overview' ? '#1e293b' : 'transparent',
            border: activeTab === 'overview' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'overview' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'overview' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <FileText size={16} style={{ color: activeTab === 'overview' ? '#10b981' : 'inherit' }} />
          <span>360° Overview</span>
        </button>

        <button 
          onClick={() => setActiveTab('savings')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'savings' ? '#1e293b' : 'transparent',
            border: activeTab === 'savings' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'savings' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'savings' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <PiggyBank size={16} style={{ color: activeTab === 'savings' ? '#10b981' : 'inherit' }} />
          <span>Savings Accounts ({savings.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('loans')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'loans' ? '#1e293b' : 'transparent',
            border: activeTab === 'loans' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'loans' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'loans' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <HandCoins size={16} style={{ color: activeTab === 'loans' ? '#10b981' : 'inherit' }} />
          <span>Loans & Credit ({loans.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('pawning')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'pawning' ? '#1e293b' : 'transparent',
            border: activeTab === 'pawning' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'pawning' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'pawning' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Gem size={16} style={{ color: activeTab === 'pawning' ? '#10b981' : 'inherit' }} />
          <span>Gold Pawning ({pawns.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'audit' ? '#1e293b' : 'transparent',
            border: activeTab === 'audit' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'audit' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <History size={16} style={{ color: activeTab === 'audit' ? '#10b981' : 'inherit' }} />
          <span>Audit & Ledger Trail ({audits.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('guarantor')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'guarantor' ? '#1e293b' : 'transparent',
            border: activeTab === 'guarantor' ? '1px solid var(--border-color)' : '1px solid transparent',
            color: activeTab === 'guarantor' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeTab === 'guarantor' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <ShieldAlert size={16} style={{ color: activeTab === 'guarantor' ? '#f43f5e' : 'inherit' }} />
          <span>Guarantor Exposure ({guaranteedLoans.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {/* Left Column: KYC & Contact Info */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: '#10b981' }} />
              <span>KYC & Contact Verification</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={15} style={{ color: 'var(--text-dim)' }} /> Contact Telephone:
                </span>
                <strong style={{ color: '#fff' }}>{member.phone}</strong>
              </div>

              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={15} style={{ color: 'var(--text-dim)' }} /> Electronic Mail:
                </span>
                <strong className="mono" style={{ color: '#fff' }}>{member.email || 'N/A'}</strong>
              </div>

              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ color: 'var(--text-dim)' }} /> Residential Address:
                </span>
                <strong style={{ color: '#fff', textAlign: 'right', maxWidth: '240px' }}>{member.address}, {member.city}</strong>
              </div>

              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={15} style={{ color: 'var(--text-dim)' }} /> Occupation / Business:
                </span>
                <strong style={{ color: '#fff' }}>{member.occupation || 'Merchant / Self-employed'}</strong>
              </div>

              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} style={{ color: 'var(--text-dim)' }} /> Membership Date:
                </span>
                <strong style={{ color: '#fff' }}>{formatDate(member.membership_date)}</strong>
              </div>

              {member.member_type === 'NON_MEMBER' && (
                <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={15} style={{ color: '#38bdf8' }} /> Customer Classification:
                  </span>
                  <strong style={{ color: '#38bdf8' }}>{member.non_member_type || 'General Customer'}</strong>
                </div>
              )}

              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={15} style={{ color: 'var(--text-dim)' }} /> Assigned Branch:
                </span>
                <strong style={{ color: '#10b981' }}>Kattankudy MPCS Main Branch</strong>
              </div>
            </div>
          </div>

          {/* Right Column: 360 Activity Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: '#0284c7' }} />
              <span>Cooperative Portfolio Overview</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PiggyBank size={16} style={{ color: '#10b981' }} /> Active Savings Accounts:
                  </span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{savings.length} Account(s)</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Combined deposit pool of {formatCurrency(totalSavingsBalance)} earning cooperative interest.
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HandCoins size={16} style={{ color: '#fbbf24' }} /> Micro-Loan Portfolios:
                  </span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{loans.length} Loan(s)</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Total credit outstanding: {formatCurrency(totalLoanOutstanding)}.
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gem size={16} style={{ color: '#c4b5fd' }} /> Vaulted Gold Tickets:
                  </span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{pawns.length} Ticket(s)</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Total gold appraisal value: {formatCurrency(totalPawnValuation)} (Advanced: {formatCurrency(totalPawnAdvanced)}).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Savings Accounts Table */}
      {activeTab === 'savings' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank size={20} style={{ color: '#10b981' }} />
              <span>Registered Savings & Share Accounts</span>
            </h3>
            <span className="badge badge-success">{savings.length} Account(s) Found</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Type</th>
                  <th>Interest Rate</th>
                  <th>Status</th>
                  <th>Opening Date</th>
                  <th style={{ textAlign: 'right' }}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {savings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No deposit or savings accounts linked to member {member.member_number}.
                    </td>
                  </tr>
                ) : (
                  savings.map(s => (
                    <tr key={s.id}>
                      <td>
                        <span className="mono" style={{ fontWeight: 600, color: '#10b981' }}>{s.account_number}</span>
                      </td>
                      <td><span className="badge badge-info">{s.account_type}</span></td>
                      <td className="mono">{s.interest_rate}% p.a.</td>
                      <td><span className="badge badge-success">{s.status}</span></td>
                      <td>{formatDate(s.created_at)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(s.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Loans Table */}
      {activeTab === 'loans' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HandCoins size={20} style={{ color: '#fbbf24' }} />
              <span>Cooperative Lending Portfolios</span>
            </h3>
            <span className="badge badge-warning">{loans.length} Loan(s) Found</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Loan Number</th>
                  <th>Category</th>
                  <th>Principal Amount</th>
                  <th>Interest Rate</th>
                  <th>Total Payable</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No agricultural, business, or housing loans recorded for this member.
                    </td>
                  </tr>
                ) : (
                  loans.map(l => (
                    <tr key={l.id}>
                      <td><span className="mono" style={{ fontWeight: 600, color: '#fbbf24' }}>{l.loan_number}</span></td>
                      <td><span className="badge badge-warning">{l.loan_type}</span></td>
                      <td className="mono">{formatCurrency(l.original_amount)}</td>
                      <td className="mono">{l.interest_rate}% p.a.</td>
                      <td className="mono">{formatCurrency(l.total_payable)}</td>
                      <td className="mono" style={{ color: '#34d399' }}>{formatCurrency(l.paid_amount)}</td>
                      <td>
                        <span className={`badge ${l.status === 'ACTIVE' ? 'badge-info' : 'badge-success'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>{formatDate(l.due_date)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: l.outstanding_amount > 0 ? '#fbbf24' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(l.outstanding_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Pawning Table */}
      {activeTab === 'pawning' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gem size={20} style={{ color: '#c4b5fd' }} />
              <span>Vaulted Gold & Jewelry Tickets</span>
            </h3>
            <span className="badge badge-purple">{pawns.length} Ticket(s) Found</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Item Description</th>
                  <th>Gold Purity</th>
                  <th>Weight (g)</th>
                  <th>Safe Location</th>
                  <th>Valuation Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Cash Advanced</th>
                </tr>
              </thead>
              <tbody>
                {pawns.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No gold pawning records or jewelry advances linked to this member.
                    </td>
                  </tr>
                ) : (
                  pawns.map(p => (
                    <tr key={p.id}>
                      <td><span className="mono" style={{ fontWeight: 600, color: '#c4b5fd' }}>{p.pawn_number}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.item_description}</td>
                      <td><span className="badge badge-purple">{p.category}</span></td>
                      <td className="mono">{p.weight_grams}g</td>
                      <td><span className="mono" style={{ fontSize: '0.8rem', background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.storage_location}</span></td>
                      <td className="mono">{formatCurrency(p.valuation_amount)}</td>
                      <td>
                        <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{formatDate(p.due_date)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(p.loan_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit History Table */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} style={{ color: '#10b981' }} />
              <span>Member Audit Trail & Ledger Events</span>
            </h3>
            <span className="badge badge-info">{audits.length} Event(s) Recorded</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Performed By (Email)</th>
                  <th>Detailed Log Description</th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No audit logs or historical transactions recorded for this member profile yet.
                    </td>
                  </tr>
                ) : (
                  audits.map(a => (
                    <tr key={a.id}>
                      <td className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(a.created_at)}
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          {a.action}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '0.85rem' }}>{a.user_email}</td>
                      <td style={{ fontSize: '0.9rem' }}>{a.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Guarantor Exposure & Risk Tracking */}
      {activeTab === 'guarantor' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} style={{ color: '#f43f5e' }} />
              <span>Guarantor Underwriting & Risk Exposure Trail</span>
            </h3>
            <span className={`badge ${guaranteedLoans.length > 0 ? 'badge-danger' : 'badge-success'}`}>
              {guaranteedLoans.length} Active Guaranteed Loan(s) | Total Exposure: {formatCurrency(totalGuaranteedExposure)}
            </span>
          </div>

          {guaranteedLoans.length > 0 && (
            <div style={{ 
              padding: '1rem 1.25rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              color: '#f43f5e',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem'
            }}>
              <ShieldAlert size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>⚠️ Credit Exposure Warning:</strong> This member is currently guaranteeing <strong>{guaranteedLoans.length} active loan(s)</strong> with an outstanding liability of <strong>{formatCurrency(totalGuaranteedExposure)}</strong>. Per bank risk policy, verify exposure limits before authorizing additional loans or releasing pledged savings.
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Loan Number</th>
                  <th>Borrower ID</th>
                  <th>Loan Type</th>
                  <th>Original Amount</th>
                  <th>Outstanding Liability</th>
                  <th>Guarantor Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {guaranteedLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <UserCheck size={32} style={{ color: '#10b981', margin: '0 auto 0.75rem', display: 'block', opacity: 0.8 }} />
                      This member is not currently acting as a guarantor on any active loans. No third-party credit exposure recorded.
                    </td>
                  </tr>
                ) : (
                  guaranteedLoans.map(l => {
                    const isG1 = l.guarantor_nic === member.nic || l.guarantor_name === `${member.first_name} ${member.last_name}`;
                    return (
                      <tr key={l.id}>
                        <td className="mono" style={{ fontWeight: 600, color: '#fff' }}>{l.loan_number}</td>
                        <td className="mono" style={{ color: '#38bdf8' }}>{l.member_id}</td>
                        <td>
                          <span className="badge badge-info" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                            {l.loan_type}
                          </span>
                        </td>
                        <td className="mono">{formatCurrency(l.original_amount)}</td>
                        <td className="mono" style={{ fontWeight: 700, color: '#fbbf24' }}>{formatCurrency(l.outstanding_amount)}</td>
                        <td>
                          <span className={`badge ${isG1 ? 'badge-warning' : 'badge-info'}`} style={{ fontWeight: 600 }}>
                            {isG1 ? 'Guarantor 1 (Primary)' : 'Guarantor 2 (Secondary)'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
