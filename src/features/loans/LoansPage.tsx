import React, { useState } from 'react';
import { 
  HandCoins, 
  Search, 
  Plus, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  CheckCircle2,
  ArrowLeft,
  Building2,
  FileText
} from 'lucide-react';
import { localStore } from '../../lib/store';
import type { Loan, Member, Transaction } from '../../types';
import { formatCurrency, generateSequenceId } from '../../lib/formatters';
import { toast } from 'sonner';

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(localStore.getLoans());
  const [members] = useState<Member[]>(localStore.getMembers());
  const [search, setSearch] = useState('');
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const totalOutstanding = activeLoans.reduce((a, b) => a + b.outstanding_amount, 0);
  const regMembers = members.filter(m => m.member_type !== 'NON_MEMBER');

  // Page Navigation State (Full Page Views instead of Popup Modals)
  const [activeView, setActiveView] = useState<'list' | 'create' | 'repay'>('list');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // New Loan Form
  const [selectedMemberId, setSelectedMemberId] = useState(regMembers[0]?.id || members[0]?.id || '');
  const [loanType, setLoanType] = useState<'AGRICULTURAL' | 'HOUSING' | 'BUSINESS' | 'EMERGENCY' | 'CONSUMER'>('BUSINESS');
  const [amount, setAmount] = useState('300000');
  const [interestRate, setInterestRate] = useState('12.0');
  const [durationMonths, setDurationMonths] = useState('24');
  const [selectedGuarantorId, setSelectedGuarantorId] = useState(regMembers[1]?.id || regMembers[0]?.id || members[0]?.id || '');
  const [guarantorSearch, setGuarantorSearch] = useState('');
  const [selectedGuarantor2Id, setSelectedGuarantor2Id] = useState(regMembers[2]?.id || regMembers[1]?.id || regMembers[0]?.id || members[0]?.id || '');
  const [guarantor2Search, setGuarantor2Search] = useState('');
  const [purpose, setPurpose] = useState('');

  // Repayment form
  const [repayAmount, setRepayAmount] = useState('');
  const [repayRef, setRepayRef] = useState('');
  const [repaySearch, setRepaySearch] = useState('');
  const [repayTypeFilter, setRepayTypeFilter] = useState('ALL');
  const [memberSearch, setMemberSearch] = useState('');

  const getMemberName = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? `${m.first_name} ${m.last_name}` : 'Unknown Member';
  };

  const getMemberNic = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? m.nic : 'N/A';
  };

  // Calculated preview for new loan
  const origNum = parseFloat(amount) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const monthsNum = parseInt(durationMonths) || 12;
  const totalPayableCalc = origNum + (origNum * (rateNum / 100) * (monthsNum / 12));
  const monthlyInstallmentCalc = monthsNum > 0 ? totalPayableCalc / monthsNum : 0;

  // 1. FULL PAGE VIEW: New Loan Application
  if (activeView === 'create') {
    const handleCreateLoan = (e: React.FormEvent) => {
      e.preventDefault();
      if (origNum < 10000) {
        toast.error('Minimum loan application amount is Rs. 10,000');
        return;
      }
      const guarantor = regMembers.find(m => m.id === selectedGuarantorId) || members.find(m => m.id === selectedGuarantorId);
      const guarantor2 = regMembers.find(m => m.id === selectedGuarantor2Id) || members.find(m => m.id === selectedGuarantor2Id);
      if (!guarantor || !guarantor2) {
        toast.error('Please select valid registered cooperative members for both Guarantor 1 and Guarantor 2');
        return;
      }
      if (guarantor.id === selectedMemberId || guarantor2.id === selectedMemberId) {
        toast.error('The borrowing member cannot act as their own Guarantor!');
        return;
      }
      if (guarantor.id === guarantor2.id) {
        toast.error('Guarantor 1 and Guarantor 2 must be two different members!');
        return;
      }

      const nextId = generateSequenceId('LON', loans.length);
      const startDate = new Date();
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + monthsNum);

      const newLoan: Loan = {
        id: `lon-${Date.now()}`,
        organization_id: 'org-1',
        loan_number: nextId,
        member_id: selectedMemberId,
        loan_type: loanType,
        original_amount: origNum,
        interest_rate: rateNum,
        total_payable: totalPayableCalc,
        paid_amount: 0,
        outstanding_amount: totalPayableCalc,
        duration_months: monthsNum,
        installment_frequency: 'MONTHLY',
        start_date: startDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        guarantor_name: `${guarantor.first_name} ${guarantor.last_name}`,
        guarantor_nic: guarantor.nic,
        guarantor2_name: `${guarantor2.first_name} ${guarantor2.last_name}`,
        guarantor2_nic: guarantor2.nic,
        purpose: purpose || 'Cooperative member assistance',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const updatedLoans = [newLoan, ...loans];
      localStore.saveLoans(updatedLoans);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        member_id: selectedMemberId,
        transaction_type: 'LOAN_DISBURSEMENT',
        amount: origNum,
        transaction_date: new Date().toISOString(),
        reference_number: `DISB-${nextId}`,
        description: `Disbursed ${loanType} loan ${nextId} to member`,
        created_by: 'Loan Officer',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'LOAN_DISBURSEMENT',
        target_id: nextId,
        target_type: 'LOAN',
        details: `Approved and disbursed ${loanType} loan ${nextId} of Rs. ${origNum} (Total payable: Rs. ${totalPayableCalc})`
      });

      setLoans(updatedLoans);
      setActiveView('list');
      toast.success(`Loan portfolio ${nextId} created and disbursed successfully!`);
      
      setGuarantorSearch('');
      setGuarantor2Search('');
      setPurpose('');
    };

    return (
      <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setActiveView('list')} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Loan Portfolios</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Loans</span>
              <span>/</span>
              <span style={{ color: '#fbbf24', fontWeight: 500 }}>New Micro-Lending Application</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Kattankudy MPCS Ltd • Branch KTK-01</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #d97706' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <HandCoins size={24} style={{ color: '#d97706' }} />
            <span>Cooperative Loan Application & Disbursal</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Submit formal lending intake for agricultural, business, or housing development. Requires mandatory guarantor underwriting.
          </p>
        </div>

        <form onSubmit={handleCreateLoan} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              1. Borrower & Portfolio Scheme
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#fbbf24' }} />
                  <span>Search & Select Borrowing Member *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Member Name, ID (MEM-...), or NIC..."
                    value={memberSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setMemberSearch(val);
                      const matches = members.filter(m => 
                        m.member_number.toLowerCase().includes(val.toLowerCase()) ||
                        m.first_name.toLowerCase().includes(val.toLowerCase()) ||
                        m.last_name.toLowerCase().includes(val.toLowerCase()) ||
                        m.nic.toLowerCase().includes(val.toLowerCase())
                      );
                      if (matches.length > 0 && !matches.some(m => m.id === selectedMemberId)) {
                        setSelectedMemberId(matches[0].id);
                      }
                    }}
                    style={{ padding: '0.6rem 0.8rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
                  />
                </div>
                <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} style={{ padding: '0.75rem', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}>
                  {regMembers.filter(m => 
                    m.member_number.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.first_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.last_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    m.nic.toLowerCase().includes(memberSearch.toLowerCase())
                  ).map(m => (
                    <option key={m.id} value={m.id}>{m.member_number} - {m.first_name} {m.last_name} ({m.nic})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Lending Scheme Category *</label>
                <select value={loanType} onChange={e => {
                  const val = e.target.value as any;
                  setLoanType(val);
                  if (val === 'AGRICULTURAL') setInterestRate('10.0');
                  else if (val === 'HOUSING') setInterestRate('11.0');
                  else if (val === 'EMERGENCY') setInterestRate('9.0');
                  else if (val === 'CONSUMER') setInterestRate('14.0');
                  else setInterestRate('12.5');
                }} style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                  <option value="AGRICULTURAL">Agricultural Loan Scheme (10.0% p.a.)</option>
                  <option value="BUSINESS">Business Expansion Scheme (12.5% p.a.)</option>
                  <option value="HOUSING">Housing / Construction Scheme (11.0% p.a.)</option>
                  <option value="EMERGENCY">Emergency Medical Assistance (9.0% p.a.)</option>
                  <option value="CONSUMER">Consumer Goods Advance (14.0% p.a.)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              2. Financial Terms & Amortization Schedule Preview
            </h3>
            <div className="grid-cols-3" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Principal Amount (Rs.) * [Min: 10,000]</label>
                <input type="number" step="1000" value={amount} onChange={e => setAmount(e.target.value)} required style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Interest Rate (% p.a.)</label>
                <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Repayment Duration (Months)</label>
                <input type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} required />
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', borderLeft: '4px solid #d97706', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={15} style={{ color: '#d97706' }} />
                <span>Calculated Amortization Preview</span>
              </div>
              <div className="grid-cols-2" style={{ marginTop: '0.75rem', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#78350f' }}>Total Payable (Principal + Interest)</div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#b45309', marginTop: '0.2rem' }}>{formatCurrency(totalPayableCalc)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#78350f' }}>Required Monthly Installment</div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{formatCurrency(monthlyInstallmentCalc)} / month</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              3. Guarantors Verification & Risk Management (2 Registered Members Required)
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#d97706' }} />
                  <span>Search & Select Guarantor 1 (Primary) *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Member Name, ID, or NIC..."
                    value={guarantorSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setGuarantorSearch(val);
                      const matches = regMembers.filter(m => 
                        m.id !== selectedMemberId && m.id !== selectedGuarantor2Id && (
                          m.member_number.toLowerCase().includes(val.toLowerCase()) ||
                          m.first_name.toLowerCase().includes(val.toLowerCase()) ||
                          m.last_name.toLowerCase().includes(val.toLowerCase()) ||
                          m.nic.toLowerCase().includes(val.toLowerCase())
                        )
                      );
                      if (matches.length > 0 && !matches.some(m => m.id === selectedGuarantorId)) {
                        setSelectedGuarantorId(matches[0].id);
                      }
                    }}
                    style={{ padding: '0.6rem 0.8rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
                  />
                </div>
                <select value={selectedGuarantorId} onChange={e => setSelectedGuarantorId(e.target.value)} style={{ padding: '0.75rem', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}>
                  {regMembers.filter(m => 
                    m.id !== selectedMemberId && m.id !== selectedGuarantor2Id && (
                      m.member_number.toLowerCase().includes(guarantorSearch.toLowerCase()) ||
                      m.first_name.toLowerCase().includes(guarantorSearch.toLowerCase()) ||
                      m.last_name.toLowerCase().includes(guarantorSearch.toLowerCase()) ||
                      m.nic.toLowerCase().includes(guarantorSearch.toLowerCase())
                    )
                  ).map(m => (
                    <option key={m.id} value={m.id}>{m.member_number} - {m.first_name} {m.last_name} ({m.nic})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#d97706' }} />
                  <span>Search & Select Guarantor 2 (Secondary) *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Member Name, ID, or NIC..."
                    value={guarantor2Search}
                    onChange={e => {
                      const val = e.target.value;
                      setGuarantor2Search(val);
                      const matches = regMembers.filter(m => 
                        m.id !== selectedMemberId && m.id !== selectedGuarantorId && (
                          m.member_number.toLowerCase().includes(val.toLowerCase()) ||
                          m.first_name.toLowerCase().includes(val.toLowerCase()) ||
                          m.last_name.toLowerCase().includes(val.toLowerCase()) ||
                          m.nic.toLowerCase().includes(val.toLowerCase())
                        )
                      );
                      if (matches.length > 0 && !matches.some(m => m.id === selectedGuarantor2Id)) {
                        setSelectedGuarantor2Id(matches[0].id);
                      }
                    }}
                    style={{ padding: '0.6rem 0.8rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
                  />
                </div>
                <select value={selectedGuarantor2Id} onChange={e => setSelectedGuarantor2Id(e.target.value)} style={{ padding: '0.75rem', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}>
                  {regMembers.filter(m => 
                    m.id !== selectedMemberId && m.id !== selectedGuarantorId && (
                      m.member_number.toLowerCase().includes(guarantor2Search.toLowerCase()) ||
                      m.first_name.toLowerCase().includes(guarantor2Search.toLowerCase()) ||
                      m.last_name.toLowerCase().includes(guarantor2Search.toLowerCase()) ||
                      m.nic.toLowerCase().includes(guarantor2Search.toLowerCase())
                    )
                  ).map(m => (
                    <option key={m.id} value={m.id}>{m.member_number} - {m.first_name} {m.last_name} ({m.nic})</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Note: Two distinct active registered cooperative members (excluding the borrower) are required to act as loan guarantors.
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem', margin: 0 }}>
              <label className="form-label">Loan Purpose & Credit Committee Remarks</label>
              <input type="text" placeholder="e.g. Purchase of boat engine and fishing net inventory for seasonal trade" value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', color: '#475569', background: '#ffffff' }}>
              Cancel Application
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#d97706', color: '#ffffff', border: 'none' }}>
              Approve & Disburse Funds
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. FULL PAGE VIEW: Record Loan Repayment
  if (activeView === 'repay') {
    const targetLoan = selectedLoan || activeLoans[0] || loans[0];
    if (!targetLoan) return null;

    const handleRepay = (e: React.FormEvent) => {
      e.preventDefault();
      const payNum = parseFloat(repayAmount);
      if (isNaN(payNum) || payNum <= 0) {
        toast.error('Please enter a valid repayment amount');
        return;
      }

      const newPaid = targetLoan.paid_amount + payNum;
      const newOutstanding = Math.max(0, targetLoan.outstanding_amount - payNum);
      const newStatus = newOutstanding === 0 ? 'COMPLETED' : 'ACTIVE';

      const updatedLoans = loans.map(l => l.id === targetLoan.id ? { 
        ...l, 
        paid_amount: newPaid, 
        outstanding_amount: newOutstanding,
        status: newStatus as any
      } : l);
      localStore.saveLoans(updatedLoans);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        member_id: targetLoan.member_id,
        transaction_type: 'LOAN_REPAYMENT',
        amount: payNum,
        transaction_date: new Date().toISOString(),
        reference_number: repayRef || `LRP-${Date.now().toString().slice(-5)}`,
        description: `Installment repayment for loan ${targetLoan.loan_number}`,
        created_by: 'Staff Admin',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'LOAN_REPAYMENT',
        target_id: targetLoan.loan_number,
        target_type: 'LOAN',
        details: `Recorded repayment of Rs. ${payNum} for ${targetLoan.loan_number}. Outstanding: Rs. ${newOutstanding}`
      });

      setLoans(updatedLoans);
      setActiveView('list');
      toast.success(`Recorded repayment of ${formatCurrency(payNum)} for loan ${targetLoan.loan_number}`);
      setRepayAmount('');
      setRepayRef('');
    };

    const suggestedInstallment = targetLoan.total_payable / targetLoan.duration_months;

    return (
      <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setActiveView('list')} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Loan Portfolios</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Loans</span>
              <span>/</span>
              <span style={{ color: '#34d399', fontWeight: 500 }}>Installment Repayment Portal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <TrendingDown size={24} style={{ color: '#059669' }} />
            <span>Record Loan Installment Repayment</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Search and select any active borrower loan portfolio below to post installment repayment funds.
          </p>
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#059669', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={15} />
                  <span>Search & Filter Target Loan Portfolio *</span>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['ALL', 'AGRICULTURAL', 'BUSINESS', 'HOUSING', 'EMERGENCY', 'CONSUMER'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setRepayTypeFilter(type);
                        const matches = loans.filter(l => {
                          const mSearch = l.loan_number.toLowerCase().includes(repaySearch.toLowerCase()) ||
                            getMemberName(l.member_id).toLowerCase().includes(repaySearch.toLowerCase()) ||
                            getMemberNic(l.member_id).toLowerCase().includes(repaySearch.toLowerCase());
                          const mType = type === 'ALL' || l.loan_type === type;
                          return mSearch && mType && l.status === 'ACTIVE';
                        });
                        if (matches.length > 0 && !matches.some(m => m.id === selectedLoan?.id)) {
                          setSelectedLoan(matches[0]);
                        }
                      }}
                      className={`btn ${repayTypeFilter === type ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', background: repayTypeFilter === type ? '#059669' : '#ffffff', borderColor: repayTypeFilter === type ? '#059669' : 'var(--border-color)', color: repayTypeFilter === type ? '#fff' : '#475569' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Search by Loan Number (LOAN-00...), Borrower Name, or NIC..."
                value={repaySearch}
                onChange={e => {
                  const val = e.target.value;
                  setRepaySearch(val);
                  const matches = loans.filter(l => {
                    const mSearch = l.loan_number.toLowerCase().includes(val.toLowerCase()) ||
                      getMemberName(l.member_id).toLowerCase().includes(val.toLowerCase()) ||
                      getMemberNic(l.member_id).toLowerCase().includes(val.toLowerCase());
                    const mType = repayTypeFilter === 'ALL' || l.loan_type === repayTypeFilter;
                    return mSearch && mType && l.status === 'ACTIVE';
                  });
                  if (matches.length > 0 && !matches.some(m => m.id === selectedLoan?.id)) {
                    setSelectedLoan(matches[0]);
                  }
                }}
                style={{ padding: '0.65rem 0.85rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
              />

              <select 
                value={targetLoan.id} 
                onChange={e => {
                  const found = loans.find(l => l.id === e.target.value);
                  if (found) setSelectedLoan(found);
                }}
                style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0.75rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              >
                {loans.filter(l => {
                  const mSearch = l.loan_number.toLowerCase().includes(repaySearch.toLowerCase()) ||
                    getMemberName(l.member_id).toLowerCase().includes(repaySearch.toLowerCase()) ||
                    getMemberNic(l.member_id).toLowerCase().includes(repaySearch.toLowerCase());
                  const mType = repayTypeFilter === 'ALL' || l.loan_type === repayTypeFilter;
                  return mSearch && mType && l.status === 'ACTIVE';
                }).map(l => (
                  <option key={l.id} value={l.id}>
                    {l.loan_number} — {getMemberName(l.member_id)} ({l.loan_type} Scheme) - Outstanding: {formatCurrency(l.outstanding_amount)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Loan Portfolio & Borrower</div>
                <div className="mono" style={{ fontWeight: 600, color: '#0f172a', fontSize: '1.1rem', marginTop: '0.2rem' }}>
                  {targetLoan.loan_number} — {targetLoan.loan_type} Scheme
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Borrower Identity: <strong style={{ color: '#0f172a' }}>{getMemberName(targetLoan.member_id)}</strong> <span className="mono" style={{ fontSize: '0.8rem' }}>({getMemberNic(targetLoan.member_id)})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Outstanding Principal</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#059669', marginTop: '0.2rem' }}>
                  {formatCurrency(targetLoan.outstanding_amount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRepay} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem' }}>
              Repayment Amount (Rs.) * [Suggested Monthly Installment: {formatCurrency(suggestedInstallment)}]
            </label>
            <input type="number" step="0.01" placeholder="e.g. 23437.50" value={repayAmount} onChange={e => setRepayAmount(e.target.value)} required autoFocus style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', padding: '0.75rem' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Official Receipt / Voucher Number</label>
            <input type="text" placeholder="e.g. LRP-99214" value={repayRef} onChange={e => setRepayRef(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', color: '#475569', background: '#ffffff' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#059669', color: '#ffffff', border: 'none' }}>
              Confirm & Post Repayment
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. MAIN LOAN PORTFOLIOS TABLE VIEW
  const filteredLoans = loans.filter(l => 
    l.loan_number.toLowerCase().includes(search.toLowerCase()) ||
    l.loan_type.toLowerCase().includes(search.toLowerCase()) ||
    l.purpose?.toLowerCase().includes(search.toLowerCase()) ||
    l.guarantor_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.guarantor2_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HandCoins size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-warning" style={{ background: '#d97706', color: '#fff', fontSize: '0.65rem' }}>Lending Ledger</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Cooperative Loan Portfolios</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Manage agricultural, business, and housing micro-loans with guarantor verification.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              if (activeLoans.length > 0 && !selectedLoan) setSelectedLoan(activeLoans[0]);
              setActiveView('repay');
            }} 
            className="btn btn-secondary" 
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <TrendingDown size={18} />
            <span>Record Repayment Portal</span>
          </button>
          <button onClick={() => setActiveView('create')} className="btn btn-primary" style={{ fontWeight: 600 }}>
            <Plus size={18} />
            <span>New Loan Application Page</span>
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid-cols-3">
        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #d97706' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Outstanding Balance</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#fef3c7', color: '#d97706' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {formatCurrency(totalOutstanding)}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Loan Portfolios</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#e0f2fe', color: '#0284c7' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {activeLoans.length}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Completed Portfolios</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#dcfce7', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {loans.filter(l => l.status === 'COMPLETED').length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#ffffff', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by Loan ID (LON-000001), Type, Guarantor, or Purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', color: '#0f172a', fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Loan Number</th>
              <th>Member Borrower</th>
              <th>Loan Category</th>
              <th>Original Amount</th>
              <th>Total Payable</th>
              <th>Paid Amount</th>
              <th style={{ textAlign: 'right' }}>Outstanding</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No loan records matching "{search}".
                </td>
              </tr>
            ) : (
              filteredLoans.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 600, color: '#fbbf24' }}>
                      {l.loan_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{getMemberName(l.member_id)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      G1: {l.guarantor_name || 'N/A'} | G2: {l.guarantor2_name || 'N/A'}
                    </div>
                  </td>
                  <td><span className="badge badge-warning">{l.loan_type}</span></td>
                  <td className="mono">{formatCurrency(l.original_amount)}</td>
                  <td className="mono">{formatCurrency(l.total_payable)}</td>
                  <td className="mono" style={{ color: '#34d399' }}>{formatCurrency(l.paid_amount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: l.outstanding_amount > 0 ? '#fbbf24' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatCurrency(l.outstanding_amount)}
                  </td>
                  <td>
                    <span className={`badge ${l.status === 'ACTIVE' ? 'badge-info' : l.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {l.status === 'ACTIVE' && (
                      <button 
                        onClick={() => { setSelectedLoan(l); setActiveView('repay'); }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24', background: '#0f172a' }}
                      >
                        <TrendingDown size={14} />
                        <span>Repay Page</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
