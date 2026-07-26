import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Users, 
  PiggyBank, 
  HandCoins, 
  Gem,
  Building2
} from 'lucide-react';
import { localStore } from '../../lib/store';
import { formatCurrency, formatDateTime, formatDate } from '../../lib/formatters';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'transactions' | 'members' | 'savings' | 'loans' | 'pawning'>('transactions');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [savingsFilter, setSavingsFilter] = useState<string>('ALL');

  const transactions = localStore.getTransactions();
  const members = localStore.getMembers();
  const savings = localStore.getSavings();
  const loans = localStore.getLoans();
  const pawns = localStore.getPawns();

  const handlePrint = () => {
    toast.info('Preparing printable official statement for Kattankudy MPCS Ltd...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReport === 'transactions') {
      headers = ['Transaction ID', 'Type', 'Account/Member', 'Amount', 'Date', 'Reference', 'Description', 'Processed By'];
      rows = filteredTransactions.map(t => [
        t.transaction_number,
        t.transaction_type,
        t.account_id || t.member_id || 'Counter',
        t.amount.toString(),
        t.transaction_date,
        t.reference_number,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.created_by}"`
      ]);
    } else if (activeReport === 'members') {
      headers = ['Member Number', 'First Name', 'Last Name', 'NIC', 'Phone', 'Address', 'City', 'Type', 'Non-Member Type', 'Status', 'Joined Date'];
      rows = members.map(m => [
        m.member_number,
        m.first_name,
        m.last_name,
        m.nic,
        m.phone,
        `"${m.address}"`,
        m.city,
        m.member_type || 'MEMBER',
        m.non_member_type || '',
        m.membership_status,
        m.membership_date
      ]);
    } else if (activeReport === 'savings') {
      headers = ['Account Number', 'Customer Name', 'NIC', 'Type', 'Owner Category', 'Interest Rate', 'Balance', 'Status'];
      rows = filteredSavings.map(s => [
        s.account_number,
        `"${s.customer_name}"`,
        s.customer_nic,
        s.account_type,
        s.member_id ? 'Coop Member' : 'Non-Member',
        s.interest_rate.toString(),
        s.balance.toString(),
        s.status
      ]);
    } else if (activeReport === 'loans') {
      headers = ['Loan Number', 'Type', 'Original Amount', 'Paid Amount', 'Outstanding Amount', 'Guarantor 1 Name', 'Guarantor 1 NIC', 'Guarantor 2 Name', 'Guarantor 2 NIC', 'Status', 'Due Date'];
      rows = loans.map(l => [
        l.loan_number,
        l.loan_type,
        l.original_amount.toString(),
        l.paid_amount.toString(),
        l.outstanding_amount.toString(),
        `"${l.guarantor_name || ''}"`,
        l.guarantor_nic || '',
        `"${l.guarantor2_name || ''}"`,
        l.guarantor2_nic || '',
        l.status,
        l.due_date
      ]);
    } else if (activeReport === 'pawning') {
      headers = ['Ticket Number', 'Description', 'Category', 'Weight (g)', 'Valuation', 'Loan Amount', 'Duration (m)', 'Due Date', 'Storage Location', 'Status'];
      rows = pawns.map(p => [
        p.pawn_number,
        `"${p.item_description}"`,
        p.category,
        p.weight_grams.toString(),
        p.valuation_amount.toString(),
        p.loan_amount.toString(),
        (p.duration_months || 12).toString(),
        p.due_date,
        `"${p.storage_location}"`,
        p.status
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kattankudy_mpcs_${activeReport}_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${activeReport.toUpperCase()} audit register to CSV download!`);
  };

  const filteredTransactions = transactions.filter(t => filterType === 'ALL' || t.transaction_type === filterType);
  const filteredSavings = savings.filter(s => {
    if (savingsFilter === 'ALL') return true;
    if (savingsFilter === 'MEMBER') return !!s.member_id;
    if (savingsFilter === 'NON_MEMBER') return !s.member_id;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>Audit & Print Portal</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Cooperative Financial & Audit Reports</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Generate print-ready statements, daily cash ledgers, and portfolio summaries.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary" style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}>
            <Printer size={16} />
            <span>Print Official Statement</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
        {[
          { id: 'transactions', label: 'Daily Cash Ledger', icon: FileText, count: transactions.length },
          { id: 'members', label: 'Member Summary', icon: Users, count: members.length },
          { id: 'savings', label: 'Savings Ledger', icon: PiggyBank, count: savings.length },
          { id: 'loans', label: 'Loan Portfolios', icon: HandCoins, count: loans.length },
          { id: 'pawning', label: 'Gold Vault', icon: Gem, count: pawns.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive ? 'bg-[#0284c7] text-white shadow-sm' : 'text-[#64748b] hover:bg-[#f1f5f9]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Official Print Header Banner */}
      <div className="glass-panel p-6 bg-[#f8fafc] border border-[#e2e8f0]">
        <div className="flex-between pb-4 border-b border-dashed border-[#cbd5e1] mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284c7] text-white rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a] uppercase tracking-wide">KATTANKUDY MULTI-PURPOSE COOPERATIVE SOCIETY LTD</h2>
              <div className="text-xs text-[#64748b]">Cooperative Rural Bank (CRB) • Registration No: MPCS/KTK/042</div>
              <div className="text-[11px] text-[#94a3b8]">Main Branch: Division 04, Kattankudy, Eastern Province, Sri Lanka</div>
            </div>
          </div>
          <div className="text-right">
            <span className="badge badge-success">Official Audit Report</span>
            <div className="text-xs text-[#64748b] mt-1 font-mono">Generated: {formatDateTime(new Date().toISOString())}</div>
            <div className="text-[11px] text-[#94a3b8] font-mono">Scope: Organization ID (org-1)</div>
          </div>
        </div>

        {/* Report Content */}
        {activeReport === 'transactions' && (
          <div className="space-y-4">
            <div className="flex-between">
              <h3 className="text-sm font-semibold text-[#0f172a]">Daily Cash & Transaction Ledger</h3>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-white text-xs w-auto min-w-[200px]">
                <option value="ALL">All Transactions ({transactions.length})</option>
                <option value="DEPOSIT">Deposits Only</option>
                <option value="WITHDRAWAL">Withdrawals Only</option>
                <option value="LOAN_DISBURSEMENT">Loan Disbursements</option>
                <option value="LOAN_REPAYMENT">Loan Repayments</option>
              </select>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Type</th>
                    <th>Account / Member</th>
                    <th>Description</th>
                    <th>Processed By</th>
                    <th>Date & Time</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{t.transaction_number}</span></td>
                      <td><span className="badge badge-info">{t.transaction_type}</span></td>
                      <td><span className="font-mono text-xs text-[#0f172a]">{t.account_id || t.member_id || 'Counter'}</span></td>
                      <td className="text-xs text-[#0f172a]">{t.description}</td>
                      <td className="text-xs text-[#64748b]">{t.created_by}</td>
                      <td className="font-mono text-xs text-[#64748b] whitespace-nowrap">{formatDateTime(t.transaction_date)}</td>
                      <td className={`text-right font-mono text-xs font-bold ${t.transaction_type.includes('DEPOSIT') || t.transaction_type.includes('REPAYMENT') ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'members' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">Registered Members Register</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Full Name</th>
                    <th>NIC Number</th>
                    <th>Phone Contact</th>
                    <th>City / Division</th>
                    <th>Membership Status</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{m.member_number}</span></td>
                      <td className="font-semibold text-xs text-[#0f172a]">{m.first_name} {m.last_name}</td>
                      <td><span className="font-mono text-xs text-[#0f172a]">{m.nic}</span></td>
                      <td className="font-mono text-xs text-[#64748b]">{m.phone}</td>
                      <td className="text-xs text-[#0f172a]">{m.city}</td>
                      <td><span className="badge badge-success">{m.membership_status}</span></td>
                      <td className="font-mono text-xs text-[#64748b]">{formatDate(m.membership_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'savings' && (
          <div className="space-y-4">
            <div className="flex-between">
              <h3 className="text-sm font-semibold text-[#0f172a]">Savings Accounts Portfolio Summary</h3>
              <select value={savingsFilter} onChange={e => setSavingsFilter(e.target.value)} className="bg-white text-xs w-auto min-w-[200px]">
                <option value="ALL">All Accounts ({savings.length})</option>
                <option value="MEMBER">Coop Member Accounts</option>
                <option value="NON_MEMBER">Non-Member Accounts</option>
              </select>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Account Number</th>
                    <th>Customer Name</th>
                    <th>NIC / ID</th>
                    <th>Account Scheme</th>
                    <th>Owner Category</th>
                    <th>Interest Rate</th>
                    <th className="text-right">Current Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSavings.map(s => (
                    <tr key={s.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{s.account_number}</span></td>
                      <td className="font-semibold text-xs text-[#0f172a]">{s.customer_name}</td>
                      <td><span className="font-mono text-xs text-[#0f172a]">{s.customer_nic}</span></td>
                      <td><span className="badge badge-info">{s.account_type}</span></td>
                      <td>
                        <span className={`badge ${s.member_id ? 'badge-success' : 'badge-warning'}`}>
                          {s.member_id ? 'Coop Member' : 'Non-Member'}
                        </span>
                      </td>
                      <td className="font-mono text-xs">{s.interest_rate}% p.a.</td>
                      <td className="text-right font-mono text-xs font-bold text-[#059669]">{formatCurrency(s.balance)}</td>
                      <td><span className="badge badge-success">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'loans' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">Loan Portfolios Risk & Guarantor Audit Report</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Category</th>
                    <th>Original Principal</th>
                    <th>Paid Amount</th>
                    <th className="text-right">Outstanding Due</th>
                    <th>Guarantor 1 (Primary)</th>
                    <th>Guarantor 2 (Secondary)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{l.loan_number}</span></td>
                      <td><span className="badge badge-warning">{l.loan_type}</span></td>
                      <td className="font-mono text-xs">{formatCurrency(l.original_amount)}</td>
                      <td className="font-mono text-xs text-[#059669]">{formatCurrency(l.paid_amount)}</td>
                      <td className="text-right font-mono text-xs font-bold text-[#d97706]">{formatCurrency(l.outstanding_amount)}</td>
                      <td>
                        {l.guarantor_name ? (
                          <div className="text-xs">
                            <div className="font-semibold text-[#0f172a]">{l.guarantor_name}</div>
                            <div className="font-mono text-[11px] text-[#64748b]">{l.guarantor_nic}</div>
                          </div>
                        ) : <span className="text-xs text-[#94a3b8]">None</span>}
                      </td>
                      <td>
                        {l.guarantor2_name ? (
                          <div className="text-xs">
                            <div className="font-semibold text-[#0f172a]">{l.guarantor2_name}</div>
                            <div className="font-mono text-[11px] text-[#64748b]">{l.guarantor2_nic}</div>
                          </div>
                        ) : <span className="text-xs text-[#94a3b8]">None</span>}
                      </td>
                      <td><span className="badge badge-info">{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'pawning' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">Gold Safe Vault Valuation & Redemption Schedule</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Item Description</th>
                    <th>Gold Category</th>
                    <th>Weight</th>
                    <th>Valuation Amount</th>
                    <th className="text-right">Loan Advanced</th>
                    <th>Redeem Period</th>
                    <th>Due Date</th>
                    <th>Safe Storage Location</th>
                  </tr>
                </thead>
                <tbody>
                  {pawns.map(p => (
                    <tr key={p.id}>
                      <td><span className="font-mono text-xs font-semibold text-[#0f172a]">{p.pawn_number}</span></td>
                      <td className="font-semibold text-xs text-[#0f172a]">{p.item_description}</td>
                      <td><span className="badge badge-purple">{p.category}</span></td>
                      <td className="font-mono text-xs">{p.weight_grams}g</td>
                      <td className="font-mono text-xs">{formatCurrency(p.valuation_amount)}</td>
                      <td className="text-right font-mono text-xs font-bold text-[#059669]">{formatCurrency(p.loan_amount)}</td>
                      <td>
                        <span className="badge badge-info font-medium">
                          {p.duration_months || 12} Months
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#dc2626] font-semibold">{p.due_date}</td>
                      <td><span className="font-mono text-xs text-[#0f172a]">{p.storage_location}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

