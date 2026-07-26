import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Users, 
  PiggyBank, 
  HandCoins, 
  Gem
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
        `"${m.first_name}"`,
        `"${m.last_name}"`,
        m.nic,
        m.phone,
        `"${m.address}"`,
        `"${m.city}"`,
        m.member_type || 'MEMBER',
        m.non_member_type || '',
        m.membership_status,
        m.membership_date
      ]);
    } else if (activeReport === 'savings') {
      headers = ['Account Number', 'Customer Name', 'Customer NIC', 'Account Scheme', 'Balance', 'Interest Rate', 'Status', 'Created Date'];
      rows = filteredSavings.map(s => [
        s.account_number,
        `"${s.customer_name}"`,
        s.customer_nic,
        s.account_type,
        s.balance.toString(),
        s.interest_rate.toString(),
        s.status,
        s.created_at
      ]);
    } else if (activeReport === 'loans') {
      headers = ['Loan Number', 'Member ID', 'Category', 'Original Principal', 'Total Payable', 'Paid Amount', 'Outstanding Due', 'Duration Months', 'Guarantor 1 Name', 'Guarantor 1 NIC', 'Guarantor 2 Name', 'Guarantor 2 NIC', 'Status', 'Start Date', 'Due Date'];
      rows = loans.map(l => [
        l.loan_number,
        l.member_id,
        l.loan_type,
        l.original_amount.toString(),
        l.total_payable.toString(),
        l.paid_amount.toString(),
        l.outstanding_amount.toString(),
        l.duration_months.toString(),
        `"${l.guarantor_name || ''}"`,
        l.guarantor_nic || '',
        `"${l.guarantor2_name || ''}"`,
        l.guarantor2_nic || '',
        l.status,
        l.start_date,
        l.due_date
      ]);
    } else if (activeReport === 'pawning') {
      headers = ['Pawn Ticket ID', 'Member ID', 'Item Description', 'Category', 'Weight Grams', 'Valuation Amount', 'Loan Advanced', 'Interest Rate', 'Redeem Period Months', 'Start Date', 'Due Date', 'Storage Location', 'Status'];
      rows = pawns.map(p => [
        p.pawn_number,
        p.member_id,
        `"${p.item_description.replace(/"/g, '""')}"`,
        p.category,
        p.weight_grams.toString(),
        p.valuation_amount.toString(),
        p.loan_amount.toString(),
        p.interest_rate.toString(),
        (p.duration_months || 12).toString(),
        p.start_date,
        p.due_date,
        `"${p.storage_location}"`,
        p.status
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CRBMS_${activeReport.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
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
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} style={{ color: 'var(--accent-primary)' }} />
            <span>Cooperative Financial & Audit Reports</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Generate print-ready statements, daily cash ledgers, and portfolio summaries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-outline">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Official Statement</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveReport('transactions')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: activeReport === 'transactions' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeReport === 'transactions' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <FileText size={16} />
          <span>Daily Cash Ledger ({transactions.length})</span>
        </button>
        <button 
          onClick={() => setActiveReport('members')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: activeReport === 'members' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeReport === 'members' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Users size={16} />
          <span>Member Summary ({members.length})</span>
        </button>
        <button 
          onClick={() => setActiveReport('savings')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: activeReport === 'savings' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeReport === 'savings' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <PiggyBank size={16} />
          <span>Savings Ledger ({savings.length})</span>
        </button>
        <button 
          onClick={() => setActiveReport('loans')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: activeReport === 'loans' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeReport === 'loans' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <HandCoins size={16} />
          <span>Loan Portfolios ({loans.length})</span>
        </button>
        <button 
          onClick={() => setActiveReport('pawning')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: activeReport === 'pawning' ? 'var(--accent-primary)' : 'transparent',
            color: '#fff',
            fontWeight: activeReport === 'pawning' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Gem size={16} />
          <span>Gold Vault ({pawns.length})</span>
        </button>
      </div>

      {/* Official Print Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex-between" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#fff', fontFamily: 'Outfit' }}>KATTANKUDY MULTI-PURPOSE COOPERATIVE SOCIETY LTD</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cooperative Rural Bank (CRB) • Registration No: MPCS/KTK/042</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Main Branch: Divisi 04, Kattankudy, Eastern Province, Sri Lanka</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success">Official Audit Report</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Generated on: {formatDateTime(new Date().toISOString())}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Scope: Organization ID (org-1)</div>
          </div>
        </div>

        {/* Report Content */}
        {activeReport === 'transactions' && (
          <div>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Daily Cash & Transaction Ledger</h3>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
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
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id}>
                      <td><span className="mono" style={{ color: 'var(--accent-primary)' }}>{t.transaction_number}</span></td>
                      <td><span className="badge badge-info">{t.transaction_type}</span></td>
                      <td><span className="mono">{t.account_id || t.member_id || 'Counter'}</span></td>
                      <td>{t.description}</td>
                      <td>{t.created_by}</td>
                      <td>{formatDateTime(t.transaction_date)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: t.transaction_type.includes('DEPOSIT') || t.transaction_type.includes('REPAYMENT') ? '#34d399' : '#fb7185' }}>
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
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registered Members Register</h3>
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
                      <td><span className="mono" style={{ color: 'var(--accent-primary)' }}>{m.member_number}</span></td>
                      <td style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                      <td><span className="mono">{m.nic}</span></td>
                      <td>{m.phone}</td>
                      <td>{m.city}</td>
                      <td><span className="badge badge-success">{m.membership_status}</span></td>
                      <td>{formatDate(m.membership_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'savings' && (
          <div>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Savings Accounts Portfolio Summary</h3>
              <select value={savingsFilter} onChange={e => setSavingsFilter(e.target.value)} style={{ width: 'auto' }}>
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
                    <th style={{ textAlign: 'right' }}>Current Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSavings.map(s => (
                    <tr key={s.id}>
                      <td><span className="mono" style={{ color: 'var(--accent-secondary)' }}>{s.account_number}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.customer_name}</td>
                      <td><span className="mono">{s.customer_nic}</span></td>
                      <td><span className="badge badge-info">{s.account_type}</span></td>
                      <td>
                        <span className={`badge ${s.member_id ? 'badge-success' : 'badge-warning'}`}>
                          {s.member_id ? 'Coop Member' : 'Non-Member'}
                        </span>
                      </td>
                      <td>{s.interest_rate}% p.a.</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{formatCurrency(s.balance)}</td>
                      <td><span className="badge badge-success">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'loans' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Loan Portfolios Risk & Guarantor Audit Report</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Category</th>
                    <th>Original Principal</th>
                    <th>Paid Amount</th>
                    <th style={{ textAlign: 'right' }}>Outstanding Due</th>
                    <th>Guarantor 1 (Primary)</th>
                    <th>Guarantor 2 (Secondary)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td><span className="mono" style={{ color: '#fbbf24', fontWeight: 700 }}>{l.loan_number}</span></td>
                      <td><span className="badge badge-warning">{l.loan_type}</span></td>
                      <td>{formatCurrency(l.original_amount)}</td>
                      <td style={{ color: '#34d399' }}>{formatCurrency(l.paid_amount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>{formatCurrency(l.outstanding_amount)}</td>
                      <td>
                        {l.guarantor_name ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>{l.guarantor_name}</div>
                            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.guarantor_nic}</div>
                          </div>
                        ) : <span style={{ color: 'var(--text-dim)' }}>None</span>}
                      </td>
                      <td>
                        {l.guarantor2_name ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>{l.guarantor2_name}</div>
                            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.guarantor2_nic}</div>
                          </div>
                        ) : <span style={{ color: 'var(--text-dim)' }}>None</span>}
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
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Gold Safe Vault Valuation & Redemption Schedule</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Item Description</th>
                    <th>Gold Category</th>
                    <th>Weight</th>
                    <th>Valuation Amount</th>
                    <th style={{ textAlign: 'right' }}>Loan Advanced</th>
                    <th>Redeem Period</th>
                    <th>Due Date</th>
                    <th>Safe Storage Location</th>
                  </tr>
                </thead>
                <tbody>
                  {pawns.map(p => (
                    <tr key={p.id}>
                      <td><span className="mono" style={{ color: '#c4b5fd', fontWeight: 700 }}>{p.pawn_number}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.item_description}</td>
                      <td><span className="badge badge-purple">{p.category}</span></td>
                      <td>{p.weight_grams}g</td>
                      <td>{formatCurrency(p.valuation_amount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{formatCurrency(p.loan_amount)}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 600 }}>
                          {p.duration_months || 12} Months
                        </span>
                      </td>
                      <td className="mono" style={{ color: '#f43f5e', fontWeight: 600 }}>{p.due_date}</td>
                      <td><span className="mono">{p.storage_location}</span></td>
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
};
