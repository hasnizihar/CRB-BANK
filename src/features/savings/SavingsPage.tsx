import React, { useState } from 'react';
import { 
  PiggyBank, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  TrendingUp,
  ArrowLeft,
  Building2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { localStore } from '../../lib/store';
import type { SavingsAccount, Member, Transaction } from '../../types';
import { formatCurrency, generateSequenceId } from '../../lib/formatters';
import { toast } from 'sonner';

export const SavingsPage: React.FC = () => {
  const [savings, setSavings] = useState<SavingsAccount[]>(localStore.getSavings());
  const [members] = useState<Member[]>(localStore.getMembers());
  const [search, setSearch] = useState('');

  // Page Navigation State (Full Page Views instead of Popup Modals)
  const [activeView, setActiveView] = useState<'list' | 'open' | 'deposit' | 'withdraw'>('list');
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);

  // Open Account form
  const regMembers = members.filter(m => m.member_type !== 'NON_MEMBER');
  const nonMembers = members.filter(m => m.member_type === 'NON_MEMBER');
  const [isMemberClient, setIsMemberClient] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState(regMembers[0]?.id || members[0]?.id || '');
  const [selectedNonMemberId, setSelectedNonMemberId] = useState(nonMembers[0]?.id || '');
  const [nonMemberSearch, setNonMemberSearch] = useState('');
  const [accountType, setAccountType] = useState<'REGULAR' | 'SENIOR' | 'CHILDREN' | 'FIXED' | 'JOINT'>('REGULAR');
  const [initialDeposit, setInitialDeposit] = useState('2500');
  const [interestRate, setInterestRate] = useState('6.5');

  // Transaction form
  const [txAmount, setTxAmount] = useState('');
  const [txReference, setTxReference] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');
  const [memberSearch, setMemberSearch] = useState('');

  // 1. FULL PAGE VIEW: Open New Savings Account
  if (activeView === 'open') {
    const handleOpenAccount = (e: React.FormEvent) => {
      e.preventDefault();
      const amountNum = parseFloat(initialDeposit);
      if (isNaN(amountNum) || amountNum < 500) {
        toast.error('Minimum initial opening deposit is Rs. 500.00');
        return;
      }

      let customerName = '';
      let customerNic = '';
      let memberId: string | undefined = undefined;

      if (isMemberClient) {
        const member = regMembers.find(m => m.id === selectedMemberId) || members.find(m => m.id === selectedMemberId);
        if (!member) {
          toast.error('Please select a valid member');
          return;
        }
        customerName = `${member.first_name} ${member.last_name}`;
        customerNic = member.nic;
        memberId = member.id;
      } else {
        const nonMem = nonMembers.find(m => m.id === selectedNonMemberId) || members.find(m => m.id === selectedNonMemberId);
        if (!nonMem) {
          toast.error('Please select a valid non-member customer from the list');
          return;
        }
        customerName = `${nonMem.first_name} ${nonMem.last_name}`;
        customerNic = nonMem.nic;
        memberId = nonMem.id;
      }

      const nextId = generateSequenceId('SAV', savings.length);
      const newAcc: SavingsAccount = {
        id: `sav-${Date.now()}`,
        organization_id: 'org-1',
        account_number: nextId,
        member_id: memberId,
        account_type: accountType,
        customer_name: customerName,
        customer_nic: customerNic,
        balance: amountNum,
        interest_rate: parseFloat(interestRate) || 6.5,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const updatedSavings = [newAcc, ...savings];
      localStore.saveSavings(updatedSavings);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        account_id: nextId,
        member_id: memberId,
        transaction_type: 'DEPOSIT',
        amount: amountNum,
        transaction_date: new Date().toISOString(),
        reference_number: `OPEN-${nextId}`,
        description: 'Initial account opening deposit',
        created_by: 'Staff Admin',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'OPEN_SAVINGS_ACCOUNT',
        target_id: nextId,
        target_type: 'SAVINGS',
        details: `Opened ${accountType} savings account ${nextId} for ${customerName} with initial deposit Rs. ${amountNum}`
      });

      setSavings(updatedSavings);
      setActiveView('list');
      toast.success(`Savings account ${nextId} opened for ${customerName}!`);
    };

    return (
      <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setActiveView('list')} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Savings Ledger</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Savings Accounts</span>
              <span>/</span>
              <span style={{ color: '#10b981', fontWeight: 500 }}>New Account Opening Portal</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Kattankudy MPCS Ltd • Branch KTK-01</span>
          </div>
        </div>

        {/* Title Banner */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <PiggyBank size={24} style={{ color: '#0284c7' }} />
            <span>Open New Savings & Deposit Account</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Establish a new interest-bearing savings scheme for registered members or general customers pursuant to Rule 1 bylaws.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleOpenAccount} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: '#0284c7' }} />
              <span>Account Ownership Classification *</span>
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: isMemberClient ? '#0284c7' : '#0f172a', fontWeight: isMemberClient ? 600 : 400 }}>
                <input type="radio" checked={isMemberClient} onChange={() => setIsMemberClient(true)} style={{ width: 'auto' }} />
                <span>Registered Cooperative Member</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: !isMemberClient ? '#0284c7' : '#0f172a', fontWeight: !isMemberClient ? 600 : 400 }}>
                <input type="radio" checked={!isMemberClient} onChange={() => setIsMemberClient(false)} style={{ width: 'auto' }} />
                <span>Non-Member General Customer (Rule 1)</span>
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
              <CheckCircle size={14} style={{ color: '#0284c7' }} />
              <span>
                {isMemberClient 
                  ? 'Links directly to an existing MEM- member share capital profile.' 
                  : 'Allows deposit account creation for general public without mandatory membership shares.'}
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              1. Customer Identity Selection
            </h3>
            {isMemberClient ? (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#0284c7' }} />
                  <span>Search & Select Registered Cooperative Member *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Member Name, ID (MEM-00...), or NIC..."
                    value={memberSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setMemberSearch(val);
                      const matches = regMembers.filter(m => 
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
                    <option key={m.id} value={m.id}>
                      {m.member_number} - {m.first_name} {m.last_name} ({m.nic})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#0284c7' }} />
                  <span>Search & Select Non-Member Customer (Rule 1) *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Customer Name, ID (CUS-00...), NIC, or Category..."
                    value={nonMemberSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setNonMemberSearch(val);
                      const matches = nonMembers.filter(m => 
                        m.member_number.toLowerCase().includes(val.toLowerCase()) ||
                        m.first_name.toLowerCase().includes(val.toLowerCase()) ||
                        m.last_name.toLowerCase().includes(val.toLowerCase()) ||
                        m.nic.toLowerCase().includes(val.toLowerCase()) ||
                        (m.non_member_type || '').toLowerCase().includes(val.toLowerCase())
                      );
                      if (matches.length > 0 && !matches.some(m => m.id === selectedNonMemberId)) {
                        setSelectedNonMemberId(matches[0].id);
                      }
                    }}
                    style={{ padding: '0.6rem 0.8rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
                  />
                </div>
                <select value={selectedNonMemberId} onChange={e => setSelectedNonMemberId(e.target.value)} style={{ padding: '0.75rem', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}>
                  {nonMembers.filter(m => 
                    m.member_number.toLowerCase().includes(nonMemberSearch.toLowerCase()) ||
                    m.first_name.toLowerCase().includes(nonMemberSearch.toLowerCase()) ||
                    m.last_name.toLowerCase().includes(nonMemberSearch.toLowerCase()) ||
                    m.nic.toLowerCase().includes(nonMemberSearch.toLowerCase()) ||
                    (m.non_member_type || '').toLowerCase().includes(nonMemberSearch.toLowerCase())
                  ).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.member_number} - {m.first_name} {m.last_name} ({m.nic}) [{m.non_member_type || 'General'}]
                    </option>
                  ))}
                </select>
                {nonMembers.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '0.5rem' }}>
                    No non-member customers found in registry. Please register a non-member first in the Member 360 / Members page.
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              2. Scheme Configuration & Initial Deposit
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Deposit Scheme Type *</label>
                <select value={accountType} onChange={e => {
                  const val = e.target.value as any;
                  setAccountType(val);
                  if (val === 'SENIOR') setInterestRate('7.5');
                  else if (val === 'CHILDREN') setInterestRate('8.0');
                  else if (val === 'FIXED') setInterestRate('10.0');
                  else setInterestRate('6.5');
                }} style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                  <option value="REGULAR">Regular Savings Scheme (6.5% p.a.)</option>
                  <option value="SENIOR">Senior Citizens Special (7.5% p.a.)</option>
                  <option value="CHILDREN">Minor / Children's Savings (8.0% p.a.)</option>
                  <option value="FIXED">Fixed Deposit Term Scheme (10.0% p.a.)</option>
                  <option value="JOINT">Joint Partnership Account (6.5% p.a.)</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Annual Interest Rate (% p.a.)</label>
                <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#34d399' }}>Initial Opening Deposit Amount (Rs.) * [Min required: Rs. 500.00]</label>
              <input type="number" step="0.01" value={initialDeposit} onChange={e => setInitialDeposit(e.target.value)} required style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              Cancel & Return
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600 }}>
              Issue Account & Record Deposit
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. FULL PAGE VIEW: Record Cash Deposit
  if (activeView === 'deposit') {
    const targetAcc = selectedAccount || savings[0];
    if (!targetAcc) return null;

    const handleDeposit = (e: React.FormEvent) => {
      e.preventDefault();
      const amountNum = parseFloat(txAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error('Please enter a valid deposit amount');
        return;
      }

      const newBalance = targetAcc.balance + amountNum;
      const updatedSavings = savings.map(s => s.id === targetAcc.id ? { ...s, balance: newBalance } : s);
      localStore.saveSavings(updatedSavings);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        account_id: targetAcc.account_number,
        member_id: targetAcc.member_id,
        transaction_type: 'DEPOSIT',
        amount: amountNum,
        transaction_date: new Date().toISOString(),
        reference_number: txReference || `DEP-${Date.now().toString().slice(-5)}`,
        description: txDescription || 'Counter cash deposit',
        created_by: 'Staff Admin',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'SAVINGS_DEPOSIT',
        target_id: targetAcc.account_number,
        target_type: 'TRANSACTION',
        details: `Deposited Rs. ${amountNum} into ${targetAcc.account_number}. New balance: Rs. ${newBalance}`
      });

      setSavings(updatedSavings);
      setActiveView('list');
      toast.success(`Deposited ${formatCurrency(amountNum)} into account ${targetAcc.account_number}`);
      setTxAmount('');
      setTxReference('');
      setTxDescription('');
    };

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
              <span>Back to Savings Ledger</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Savings Accounts</span>
              <span>/</span>
              <span style={{ color: '#10b981', fontWeight: 500 }}>Counter Cash Deposit Portal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <ArrowUpRight size={24} style={{ color: '#059669' }} />
            <span>Record Counter Cash Deposit</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Select any registered member or non-member customer savings account below to post deposit funds.
          </p>
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#059669', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={15} />
                  <span>Search & Filter Target Account *</span>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['ALL', 'REGULAR', 'SENIOR', 'CHILDREN', 'FIXED', 'JOINT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTxTypeFilter(type);
                        const matches = savings.filter(s => {
                          const mSearch = s.account_number.toLowerCase().includes(txSearch.toLowerCase()) ||
                            s.customer_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                            s.customer_nic.toLowerCase().includes(txSearch.toLowerCase());
                          const mType = type === 'ALL' || s.account_type === type;
                          return mSearch && mType;
                        });
                        if (matches.length > 0 && !matches.some(m => m.id === selectedAccount?.id)) {
                          setSelectedAccount(matches[0]);
                        }
                      }}
                      className={`btn ${txTypeFilter === type ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', background: txTypeFilter === type ? '#059669' : '#ffffff', borderColor: txTypeFilter === type ? '#059669' : 'var(--border-color)', color: txTypeFilter === type ? '#fff' : '#475569' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Search by Account Number (SAV-00...), Customer Name, or NIC..."
                value={txSearch}
                onChange={e => {
                  const val = e.target.value;
                  setTxSearch(val);
                  const matches = savings.filter(s => {
                    const mSearch = s.account_number.toLowerCase().includes(val.toLowerCase()) ||
                      s.customer_name.toLowerCase().includes(val.toLowerCase()) ||
                      s.customer_nic.toLowerCase().includes(val.toLowerCase());
                    const mType = txTypeFilter === 'ALL' || s.account_type === txTypeFilter;
                    return mSearch && mType;
                  });
                  if (matches.length > 0 && !matches.some(m => m.id === selectedAccount?.id)) {
                    setSelectedAccount(matches[0]);
                  }
                }}
                style={{ padding: '0.65rem 0.85rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
              />

              <select 
                value={targetAcc.id} 
                onChange={e => {
                  const found = savings.find(s => s.id === e.target.value);
                  if (found) setSelectedAccount(found);
                }}
                style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0.75rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              >
                {savings.filter(s => {
                  const mSearch = s.account_number.toLowerCase().includes(txSearch.toLowerCase()) ||
                    s.customer_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                    s.customer_nic.toLowerCase().includes(txSearch.toLowerCase());
                  const mType = txTypeFilter === 'ALL' || s.account_type === txTypeFilter;
                  return mSearch && mType;
                }).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.account_number} — {s.customer_name} ({s.account_type} Account) - Balance: {formatCurrency(s.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Holder Identity</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {targetAcc.customer_name} <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({targetAcc.customer_nic})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Verified Balance</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#059669', marginTop: '0.2rem' }}>
                  {formatCurrency(targetAcc.balance)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleDeposit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>Deposit Amount (Rs.) *</label>
            <input type="number" step="0.01" placeholder="e.g. 25000.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} required autoFocus style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', padding: '0.75rem', background: '#ffffff', border: '1px solid var(--border-color)' }} />
          </div>
          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Receipt / Reference Number</label>
              <input type="text" placeholder="e.g. DEP-99321" value={txReference} onChange={e => setTxReference(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Transaction Description / Notes</label>
              <input type="text" placeholder="e.g. Counter cash deposit by member" value={txDescription} onChange={e => setTxDescription(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', color: '#475569', background: '#ffffff' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#059669', color: '#ffffff', border: 'none' }}>
              Confirm & Post Deposit
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. FULL PAGE VIEW: Record Cash Withdrawal
  if (activeView === 'withdraw') {
    const targetAcc = selectedAccount || savings[0];
    if (!targetAcc) return null;

    const handleWithdrawal = (e: React.FormEvent) => {
      e.preventDefault();
      const amountNum = parseFloat(txAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error('Please enter a valid withdrawal amount');
        return;
      }
      if (amountNum > targetAcc.balance) {
        toast.error(`Insufficient funds! Maximum available balance is ${formatCurrency(targetAcc.balance)}`);
        return;
      }

      const newBalance = targetAcc.balance - amountNum;
      const updatedSavings = savings.map(s => s.id === targetAcc.id ? { ...s, balance: newBalance } : s);
      localStore.saveSavings(updatedSavings);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        account_id: targetAcc.account_number,
        member_id: targetAcc.member_id,
        transaction_type: 'WITHDRAWAL',
        amount: amountNum,
        transaction_date: new Date().toISOString(),
        reference_number: txReference || `WTH-${Date.now().toString().slice(-5)}`,
        description: txDescription || 'Counter cash withdrawal',
        created_by: 'Staff Admin',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'SAVINGS_WITHDRAWAL',
        target_id: targetAcc.account_number,
        target_type: 'TRANSACTION',
        details: `Withdrew Rs. ${amountNum} from ${targetAcc.account_number}. New balance: Rs. ${newBalance}`
      });

      setSavings(updatedSavings);
      setActiveView('list');
      toast.success(`Withdrew ${formatCurrency(amountNum)} from account ${targetAcc.account_number}`);
      setTxAmount('');
      setTxReference('');
      setTxDescription('');
    };

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
              <span>Back to Savings Ledger</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Savings Accounts</span>
              <span>/</span>
              <span style={{ color: '#dc2626', fontWeight: 500 }}>Counter Cash Withdrawal Portal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #dc2626' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <ArrowDownRight size={24} style={{ color: '#dc2626' }} />
            <span>Record Counter Cash Withdrawal</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Select any registered member or non-member customer savings account below to authorize withdrawal funds.
          </p>
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#dc2626', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={15} />
                  <span>Search & Filter Target Account *</span>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['ALL', 'REGULAR', 'SENIOR', 'CHILDREN', 'FIXED', 'JOINT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTxTypeFilter(type);
                        const matches = savings.filter(s => {
                          const mSearch = s.account_number.toLowerCase().includes(txSearch.toLowerCase()) ||
                            s.customer_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                            s.customer_nic.toLowerCase().includes(txSearch.toLowerCase());
                          const mType = type === 'ALL' || s.account_type === type;
                          return mSearch && mType;
                        });
                        if (matches.length > 0 && !matches.some(m => m.id === selectedAccount?.id)) {
                          setSelectedAccount(matches[0]);
                        }
                      }}
                      className={`btn ${txTypeFilter === type ? 'btn-danger' : 'btn-outline'}`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', background: txTypeFilter === type ? '#dc2626' : '#ffffff', borderColor: txTypeFilter === type ? '#dc2626' : 'var(--border-color)', color: txTypeFilter === type ? '#fff' : '#475569' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Search by Account Number (SAV-00...), Customer Name, or NIC..."
                value={txSearch}
                onChange={e => {
                  const val = e.target.value;
                  setTxSearch(val);
                  const matches = savings.filter(s => {
                    const mSearch = s.account_number.toLowerCase().includes(val.toLowerCase()) ||
                      s.customer_name.toLowerCase().includes(val.toLowerCase()) ||
                      s.customer_nic.toLowerCase().includes(val.toLowerCase());
                    const mType = txTypeFilter === 'ALL' || s.account_type === txTypeFilter;
                    return mSearch && mType;
                  });
                  if (matches.length > 0 && !matches.some(m => m.id === selectedAccount?.id)) {
                    setSelectedAccount(matches[0]);
                  }
                }}
                style={{ padding: '0.65rem 0.85rem', background: '#ffffff', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#0f172a' }}
              />

              <select 
                value={targetAcc.id} 
                onChange={e => {
                  const found = savings.find(s => s.id === e.target.value);
                  if (found) setSelectedAccount(found);
                }}
                style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0.75rem', background: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              >
                {savings.filter(s => {
                  const mSearch = s.account_number.toLowerCase().includes(txSearch.toLowerCase()) ||
                    s.customer_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                    s.customer_nic.toLowerCase().includes(txSearch.toLowerCase());
                  const mType = txTypeFilter === 'ALL' || s.account_type === txTypeFilter;
                  return mSearch && mType;
                }).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.account_number} — {s.customer_name} ({s.account_type} Account) - Avail Limit: {formatCurrency(s.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Holder Identity</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {targetAcc.customer_name} <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({targetAcc.customer_nic})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Withdrawal Limit</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#dc2626', marginTop: '0.2rem' }}>
                  {formatCurrency(targetAcc.balance)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleWithdrawal} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#dc2626', fontSize: '0.95rem' }}>Withdrawal Amount (Rs.) * [Max: {formatCurrency(targetAcc.balance)}]</label>
            <input type="number" step="0.01" placeholder="e.g. 15000.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} required autoFocus style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', padding: '0.75rem', background: '#ffffff', border: '1px solid var(--border-color)' }} />
          </div>
          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Voucher / Cheque Number</label>
              <input type="text" placeholder="e.g. WTH-44512" value={txReference} onChange={e => setTxReference(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description / Authorization Notes</label>
              <input type="text" placeholder="e.g. Counter cash withdrawal" value={txDescription} onChange={e => setTxDescription(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', color: '#475569', background: '#ffffff' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#dc2626', color: '#ffffff', border: 'none' }}>
              Confirm & Post Withdrawal
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 4. MAIN SAVINGS LEDGER TABLE VIEW
  const filteredSavings = savings.filter(s => 
    s.account_number.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_nic.toLowerCase().includes(search.toLowerCase()) ||
    s.account_type.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = savings.reduce((a, b) => a + b.balance, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PiggyBank size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>Deposit Ledger</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Savings Accounts Ledger</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Manage member and non-member savings accounts. Enforces strict double-entry balance checks.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setSelectedAccount(savings[0]); setActiveView('deposit'); }} 
            className="btn btn-secondary"
            style={{ fontWeight: 600 }}
          >
            <ArrowUpRight size={18} />
            <span>Record Deposit</span>
          </button>
          <button 
            onClick={() => { setSelectedAccount(savings[0]); setActiveView('withdraw'); }} 
            className="btn btn-danger"
            style={{ fontWeight: 600 }}
          >
            <ArrowDownRight size={18} />
            <span>Record Withdrawal</span>
          </button>
          <button onClick={() => setActiveView('open')} className="btn btn-primary" style={{ fontWeight: 600 }}>
            <Plus size={18} />
            <span>Open New Account</span>
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid-cols-3">
        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Savings Deposits</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#e0f2fe', color: '#0284c7' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {formatCurrency(totalBalance)}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #059669' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Accounts</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#dcfce7', color: '#059669' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {savings.filter(s => s.status === 'ACTIVE').length}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #d97706' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Average Interest Rate</span>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: '#fef3c7', color: '#d97706' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#0f172a' }}>
            {(savings.reduce((a, b) => a + b.interest_rate, 0) / (savings.length || 1)).toFixed(1)}% p.a.
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#ffffff', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by Account ID (SAV-000001), Customer Name, NIC, or Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', color: '#0f172a', fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Savings Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Account Holder</th>
              <th>NIC Number</th>
              <th>Account Type</th>
              <th>Interest Rate</th>
              <th style={{ textAlign: 'right' }}>Current Balance</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSavings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No savings accounts matching "{search}".
                </td>
              </tr>
            ) : (
              filteredSavings.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 600, color: '#10b981' }}>
                      {s.account_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.customer_name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.member_id ? 'Cooperative Member' : 'Non-Member Customer'}
                    </div>
                  </td>
                  <td><span className="mono">{s.customer_nic}</span></td>
                  <td><span className="badge badge-info">{s.account_type}</span></td>
                  <td className="mono">{s.interest_rate}% p.a.</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatCurrency(s.balance)}
                  </td>
                  <td><span className="badge badge-success">{s.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { setSelectedAccount(s); setActiveView('deposit'); }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: '#059669', color: '#059669', background: '#f0fdf4' }}
                        title="Deposit"
                      >
                        <ArrowUpRight size={14} />
                        <span>Deposit Page</span>
                      </button>
                      <button 
                        onClick={() => { setSelectedAccount(s); setActiveView('withdraw'); }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: '#dc2626', color: '#dc2626', background: '#fff1f2' }}
                        title="Withdraw"
                      >
                        <ArrowDownRight size={14} />
                        <span>Withdraw Page</span>
                      </button>
                    </div>
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
