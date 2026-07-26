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
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex-between pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="btn btn-secondary text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Members Registry</span>
          </button>
          
          <div className="h-4 w-px bg-[#e2e8f0]" />
          
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <span>Members</span>
            <span>/</span>
            <span className="font-mono text-[#0f172a] font-semibold">{member.member_number}</span>
            <span>/</span>
            <span className="text-[#0284c7] font-medium">360° Profile View</span>
          </div>
        </div>

        <div>
          <button 
            onClick={() => onStatusToggle(member)}
            className={`btn text-xs ${member.membership_status === 'ACTIVE' ? 'btn-secondary text-[#dc2626]' : 'btn-primary'}`}
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
      <div className="glass-panel p-6 bg-[#f8fafc]">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-2xl font-bold text-[#0284c7] shadow-sm">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-[#0f172a]">{member.first_name} {member.last_name}</h1>
                <span className={`badge ${
                  member.membership_status === 'ACTIVE' ? 'badge-success' : 
                  member.membership_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {member.membership_status}
                </span>
                <span className="badge bg-white text-[#64748b] border-[#e2e8f0]">
                  KYC Verified
                </span>
                {member.member_type === 'NON_MEMBER' && (
                  <span className="badge badge-info">
                    Non-Member Type: {member.non_member_type || 'General'}
                  </span>
                )}
              </div>
              
              <div className="text-xs text-[#64748b] flex flex-wrap gap-5 mt-2">
                <div>ID: <strong className="font-mono text-[#0f172a]">{member.member_number}</strong></div>
                <div>NIC: <strong className="font-mono text-[#0f172a]">{member.nic}</strong></div>
                <div>Joined: <strong className="text-[#0f172a]">{formatDate(member.membership_date)}</strong></div>
                <div>Branch: <strong className="text-[#0f172a]">KTK-01 (Kattankudy)</strong></div>
              </div>
            </div>
          </div>

          {/* Key Financial KPIs on Profile Header */}
          <div className="flex gap-3 flex-wrap">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] min-w-[140px] shadow-sm">
              <div className="text-[11px] text-[#64748b] uppercase font-semibold">Total Savings</div>
              <div className="font-mono text-base font-bold text-[#059669] mt-0.5">
                {formatCurrency(totalSavingsBalance)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] min-w-[140px] shadow-sm">
              <div className="text-[11px] text-[#64748b] uppercase font-semibold">Loan Outstanding</div>
              <div className={`font-mono text-base font-bold mt-0.5 ${totalLoanOutstanding > 0 ? 'text-[#d97706]' : 'text-[#64748b]'}`}>
                {formatCurrency(totalLoanOutstanding)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] min-w-[140px] shadow-sm">
              <div className="text-[11px] text-[#64748b] uppercase font-semibold">Gold Vaulted Value</div>
              <div className="font-mono text-base font-bold text-[#0f172a] mt-0.5">
                {formatCurrency(totalPawnValuation)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] min-w-[140px] shadow-sm">
              <div className="text-[11px] text-[#64748b] uppercase font-semibold">Guarantor Exposure</div>
              <div className={`font-mono text-base font-bold mt-0.5 ${totalGuaranteedExposure > 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                {formatCurrency(totalGuaranteedExposure)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 360 Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: '360° Overview', icon: FileText, count: undefined },
          { id: 'savings', label: 'Savings Accounts', icon: PiggyBank, count: savings.length },
          { id: 'loans', label: 'Loans & Credit', icon: HandCoins, count: loans.length },
          { id: 'pawning', label: 'Gold Pawning', icon: Gem, count: pawns.length },
          { id: 'audit', label: 'Audit & Ledger Trail', icon: History, count: audits.length },
          { id: 'guarantor', label: 'Guarantor Exposure', icon: ShieldAlert, count: guaranteedLoans.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive ? 'bg-[#0284c7] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#f1f5f9]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-cols-2">
          {/* Left Column: KYC & Contact Info */}
          <div className="glass-panel p-6">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider pb-3 border-b border-[#e2e8f0] flex items-center gap-2 mb-4">
              <UserCheck size={16} className="text-[#0284c7]" />
              <span>KYC & Contact Verification</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <Phone size={14} className="text-[#94a3b8]" /> Contact Telephone:
                </span>
                <strong className="text-[#0f172a] font-mono">{member.phone}</strong>
              </div>

              <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <Mail size={14} className="text-[#94a3b8]" /> Electronic Mail:
                </span>
                <strong className="text-[#0f172a] font-mono">{member.email || 'N/A'}</strong>
              </div>

              <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <MapPin size={14} className="text-[#94a3b8]" /> Residential Address:
                </span>
                <strong className="text-[#0f172a] text-right max-w-[240px]">{member.address}, {member.city}</strong>
              </div>

              <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <Briefcase size={14} className="text-[#94a3b8]" /> Occupation / Business:
                </span>
                <strong className="text-[#0f172a]">{member.occupation || 'Merchant / Self-employed'}</strong>
              </div>

              <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <Calendar size={14} className="text-[#94a3b8]" /> Membership Date:
                </span>
                <strong className="text-[#0f172a]">{formatDate(member.membership_date)}</strong>
              </div>

              {member.member_type === 'NON_MEMBER' && (
                <div className="flex-between pb-2 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b] flex items-center gap-2">
                    <UserCheck size={14} className="text-[#0284c7]" /> Customer Classification:
                  </span>
                  <strong className="text-[#0284c7]">{member.non_member_type || 'General Customer'}</strong>
                </div>
              )}

              <div className="flex-between">
                <span className="text-[#64748b] flex items-center gap-2">
                  <Building2 size={14} className="text-[#94a3b8]" /> Assigned Branch:
                </span>
                <strong className="text-[#059669]">Kattankudy MPCS Main Branch</strong>
              </div>
            </div>
          </div>

          {/* Right Column: 360 Activity Breakdown */}
          <div className="glass-panel p-6">
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider pb-3 border-b border-[#e2e8f0] flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-[#0284c7]" />
              <span>Cooperative Portfolio Overview</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                <div className="flex-between font-semibold text-[#0f172a]">
                  <span className="flex items-center gap-2">
                    <PiggyBank size={16} className="text-[#059669]" /> Active Savings Accounts:
                  </span>
                  <span>{savings.length} Account(s)</span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">
                  Combined deposit pool of {formatCurrency(totalSavingsBalance)} earning cooperative interest.
                </div>
              </div>

              <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                <div className="flex-between font-semibold text-[#0f172a]">
                  <span className="flex items-center gap-2">
                    <HandCoins size={16} className="text-[#d97706]" /> Micro-Loan Portfolios:
                  </span>
                  <span>{loans.length} Loan(s)</span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">
                  Total credit outstanding: {formatCurrency(totalLoanOutstanding)}.
                </div>
              </div>

              <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                <div className="flex-between font-semibold text-[#0f172a]">
                  <span className="flex items-center gap-2">
                    <Gem size={16} className="text-[#4f46e5]" /> Vaulted Gold Tickets:
                  </span>
                  <span>{pawns.length} Ticket(s)</span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">
                  Total gold appraisal value: {formatCurrency(totalPawnValuation)} (Advanced: {formatCurrency(totalPawnAdvanced)}).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Savings Accounts Table */}
      {activeTab === 'savings' && (
        <div className="glass-panel p-6">
          <div className="flex-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <PiggyBank size={18} className="text-[#059669]" />
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
                  <th className="text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {savings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#64748b]">
                      No deposit or savings accounts linked to member {member.member_number}.
                    </td>
                  </tr>
                ) : (
                  savings.map(s => (
                    <tr key={s.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold text-[#0f172a]">{s.account_number}</span>
                      </td>
                      <td><span className="badge badge-info">{s.account_type}</span></td>
                      <td className="font-mono text-xs">{s.interest_rate}% p.a.</td>
                      <td><span className="badge badge-success">{s.status}</span></td>
                      <td className="font-mono text-xs text-[#64748b]">{formatDate(s.created_at)}</td>
                      <td className="text-right font-mono text-sm font-bold text-[#059669]">
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
        <div className="glass-panel p-6">
          <div className="flex-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <HandCoins size={18} className="text-[#d97706]" />
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
                  <th className="text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-[#64748b]">
                      No agricultural, business, or housing loans recorded for this member.
                    </td>
                  </tr>
                ) : (
                  loans.map(l => (
                    <tr key={l.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{l.loan_number}</span></td>
                      <td><span className="badge badge-warning">{l.loan_type}</span></td>
                      <td className="font-mono text-xs">{formatCurrency(l.original_amount)}</td>
                      <td className="font-mono text-xs">{l.interest_rate}% p.a.</td>
                      <td className="font-mono text-xs">{formatCurrency(l.total_payable)}</td>
                      <td className="font-mono text-xs text-[#059669]">{formatCurrency(l.paid_amount)}</td>
                      <td>
                        <span className={`badge ${l.status === 'ACTIVE' ? 'badge-info' : 'badge-success'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#64748b]">{formatDate(l.due_date)}</td>
                      <td className={`text-right font-mono text-sm font-bold ${l.outstanding_amount > 0 ? 'text-[#d97706]' : 'text-[#059669]'}`}>
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
        <div className="glass-panel p-6">
          <div className="flex-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <Gem size={18} className="text-[#4f46e5]" />
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
                  <th className="text-right">Cash Advanced</th>
                </tr>
              </thead>
              <tbody>
                {pawns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-[#64748b]">
                      No gold pawning records or jewelry advances linked to this member.
                    </td>
                  </tr>
                ) : (
                  pawns.map(p => (
                    <tr key={p.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{p.pawn_number}</span></td>
                      <td className="font-semibold text-xs text-[#0f172a]">{p.item_description}</td>
                      <td><span className="badge badge-purple">{p.category}</span></td>
                      <td className="font-mono text-xs">{p.weight_grams}g</td>
                      <td><span className="font-mono text-xs bg-[#f8fafc] border border-[#e2e8f0] px-1.5 py-0.5 rounded text-[#0f172a]">{p.storage_location}</span></td>
                      <td className="font-mono text-xs">{formatCurrency(p.valuation_amount)}</td>
                      <td>
                        <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#64748b]">{formatDate(p.due_date)}</td>
                      <td className="text-right font-mono text-sm font-bold text-[#0f172a]">
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
        <div className="glass-panel p-6">
          <div className="flex-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <History size={18} className="text-[#0284c7]" />
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
                    <td colSpan={4} className="py-8 text-center text-xs text-[#64748b]">
                      No audit logs or historical transactions recorded for this member profile yet.
                    </td>
                  </tr>
                ) : (
                  audits.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-xs text-[#64748b] whitespace-nowrap">
                        {formatDate(a.created_at)}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {a.action}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#0f172a]">{a.user_email}</td>
                      <td className="text-xs text-[#0f172a]">{a.details}</td>
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
        <div className="glass-panel p-6">
          <div className="flex-between mb-4 flex-wrap gap-3">
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <ShieldAlert size={18} className="text-[#dc2626]" />
              <span>Guarantor Underwriting & Risk Exposure Trail</span>
            </h3>
            <span className={`badge ${guaranteedLoans.length > 0 ? 'badge-danger' : 'badge-success'}`}>
              {guaranteedLoans.length} Active Guaranteed Loan(s) | Total Exposure: {formatCurrency(totalGuaranteedExposure)}
            </span>
          </div>

          {guaranteedLoans.length > 0 && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-[#dc2626] mb-6 flex items-center gap-3 text-xs">
              <ShieldAlert size={20} className="shrink-0" />
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
                    <td colSpan={7} className="py-8 text-center text-xs text-[#64748b]">
                      <UserCheck size={28} className="text-[#059669] mx-auto mb-2 opacity-80" />
                      This member is not currently acting as a guarantor on any active loans. No third-party credit exposure recorded.
                    </td>
                  </tr>
                ) : (
                  guaranteedLoans.map(l => {
                    const isG1 = l.guarantor_nic === member.nic || l.guarantor_name === `${member.first_name} ${member.last_name}`;
                    return (
                      <tr key={l.id}>
                        <td className="font-mono text-xs font-semibold text-[#0f172a]">{l.loan_number}</td>
                        <td className="font-mono text-xs text-[#0284c7]">{l.member_id}</td>
                        <td>
                          <span className="badge badge-info">
                            {l.loan_type}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{formatCurrency(l.original_amount)}</td>
                        <td className="font-mono text-xs font-bold text-[#d97706]">{formatCurrency(l.outstanding_amount)}</td>
                        <td>
                          <span className={`badge ${isG1 ? 'badge-warning' : 'badge-info'}`}>
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
