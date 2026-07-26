import React, { useState } from 'react';
import { 
  Gem, 
  Search, 
  Plus, 
  Lock, 
  Unlock, 
  Scale, 
  DollarSign,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { localStore } from '../../lib/store';
import type { PawnRecord, Member, Transaction } from '../../types';
import { formatCurrency, formatDate, generateSequenceId } from '../../lib/formatters';
import { toast } from 'sonner';

export const PawningPage: React.FC = () => {
  const [pawns, setPawns] = useState<PawnRecord[]>(localStore.getPawns());
  const [members] = useState<Member[]>(localStore.getMembers());
  const [search, setSearch] = useState('');

  // Page Navigation State (Full Page Views instead of Popup Modals)
  const [activeView, setActiveView] = useState<'list' | 'create' | 'redeem'>('list');
  const [selectedPawn, setSelectedPawn] = useState<PawnRecord | null>(null);

  // New Pawn Form
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [memberSearch, setMemberSearch] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'GOLD_22K' | 'GOLD_24K' | 'JEWELRY' | 'OTHER'>('GOLD_22K');
  const [weightGrams, setWeightGrams] = useState('16.5');
  const [condition] = useState('Good condition, hallmarked');
  const [valuation, setValuation] = useState('350000');
  const [loanAmount, setLoanAmount] = useState('245000');
  const [interestRate, setInterestRate] = useState('14.0');
  const [durationMonths, setDurationMonths] = useState('12');
  const [storageLocation, setStorageLocation] = useState('Safe 01 - Drawer A');
  const [notes, setNotes] = useState('');

  // Redeem form
  const [redeemRef, setRedeemRef] = useState('');
  const [elapsedMonths, setElapsedMonths] = useState<number>(1);

  const getMemberName = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? `${m.first_name} ${m.last_name}` : 'Unknown Member';
  };

  // 1. FULL PAGE VIEW: New Pawning Valuation & Advance
  if (activeView === 'create') {
    const handleCreatePawn = (e: React.FormEvent) => {
      e.preventDefault();
      const valNum = parseFloat(valuation) || 0;
      const loanNum = parseFloat(loanAmount) || 0;
      const weightNum = parseFloat(weightGrams) || 0;

      if (weightNum <= 0) {
        toast.error('Please enter a valid item weight in grams');
        return;
      }
      if (loanNum > valNum * 0.8) {
        toast.error('Maximum loan granted cannot exceed 80% of total gold appraisal valuation per bank risk limits');
        return;
      }
      if (!description) {
        toast.error('Please provide exact item description');
        return;
      }

      const nextId = generateSequenceId('PWN', pawns.length);
      const monthsNum = parseInt(durationMonths) || 12;
      const startDate = new Date();
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + monthsNum);

      const newPawn: PawnRecord = {
        id: `pwn-${Date.now()}`,
        organization_id: 'org-1',
        pawn_number: nextId,
        member_id: selectedMemberId,
        item_description: description,
        category: category,
        weight_grams: weightNum,
        condition: condition,
        valuation_amount: valNum,
        loan_amount: loanNum,
        interest_rate: parseFloat(interestRate) || 14.0,
        duration_months: monthsNum,
        start_date: startDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'ACTIVE',
        storage_location: storageLocation,
        notes: notes || 'Appraised by certified bank officer',
        created_at: new Date().toISOString()
      };

      const updatedPawns = [newPawn, ...pawns];
      localStore.savePawns(updatedPawns);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        member_id: selectedMemberId,
        transaction_type: 'LOAN_DISBURSEMENT',
        amount: loanNum,
        transaction_date: new Date().toISOString(),
        reference_number: `PWN-DISB-${nextId}`,
        description: `Disbursed pawning advance against ${description} (${weightNum}g)`,
        created_by: 'Pawn Officer',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'PAWN_ITEM_VAULTED',
        target_id: nextId,
        target_type: 'PAWN',
        details: `Vaulted gold item ${nextId} (${description}, ${weightNum}g) in ${storageLocation}. Loan advanced: Rs. ${loanNum}`
      });

      setPawns(updatedPawns);
      setActiveView('list');
      toast.success(`Pawning ticket ${nextId} issued and item vaulted securely!`);
      
      setDescription('');
      setNotes('');
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
              <span>Back to Pawning Tickets</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Pawning</span>
              <span>/</span>
              <span style={{ color: '#c4b5fd', fontWeight: 500 }}>New Gold Appraisal & Vaulting Portal</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Kattankudy MPCS Ltd • Branch KTK-01</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderLeft: '4px solid #c4b5fd' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#c4b5fd' }}>
            <Gem size={24} />
            <span>Appraise & Vault Gold Ornaments</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
            Complete gold karat valuation and secure safe vault assignment. Advances cannot exceed 80% of total appraised market value.
          </p>
        </div>

        <form onSubmit={handleCreatePawn} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              1. Ownership & Karat Purity
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Search size={15} style={{ color: '#c4b5fd' }} />
                  <span>Search & Select Member Owner *</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Filter by Name, ID, or NIC..."
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
                    style={{ padding: '0.6rem 0.8rem', background: '#0f172a', fontSize: '0.85rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>
                <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                  {members.filter(m => 
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
                <label className="form-label">Gold Purity / Classification *</label>
                <select value={category} onChange={e => setCategory(e.target.value as any)} style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                  <option value="GOLD_22K">22 Karat Gold Ornaments (Hallmarked)</option>
                  <option value="GOLD_24K">24 Karat Pure Gold Coins/Bars</option>
                  <option value="JEWELRY">Traditional Gemstone Jewelry</option>
                  <option value="OTHER">Other Valuable Approved Items</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem', margin: 0 }}>
              <label className="form-label">Exact Item Description & Hallmark Identification *</label>
              <input type="text" placeholder="e.g. 22K Gold Bangle Set (2 pairs with engraved serials)" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              2. Weight, Valuation & Cash Advance Limit
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gross Weight (Grams) *</label>
                <input type="number" step="0.1" value={weightGrams} onChange={e => setWeightGrams(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Total Appraised Value (Rs.) *</label>
                <input type="number" step="1000" value={valuation} onChange={e => setValuation(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Advance Granted (Rs.) * [Max 80%]</label>
                <input type="number" step="1000" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Redeem Period / Duration (Months) *</label>
                <input type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} required style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              3. Vault Assignment & Officer Verification
            </h3>
            <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Safe Storage Vault Assignment *</label>
                <input type="text" placeholder="e.g. Safe 01 - Drawer A (High-Security Vault)" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Annual Interest Rate (% p.a.)</label>
                <input type="number" step="0.5" value={interestRate} onChange={e => setInterestRate(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem', margin: 0 }}>
              <label className="form-label">Condition & Appraiser Verification Notes</label>
              <input type="text" placeholder="e.g. Acid-tested and hallmarked by Appraiser S. Rahman" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              Cancel Valuation
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#c4b5fd', color: '#0f172a' }}>
              Issue Pawn Ticket & Disburse Cash
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. FULL PAGE VIEW: Redeem & Release Gold Item with Automated Interest Calculator
  if (activeView === 'redeem' && selectedPawn) {
    const monthlyInterestRate = selectedPawn.interest_rate / 12 / 100;
    const totalAccruedInterest = Math.round(selectedPawn.loan_amount * monthlyInterestRate * Math.max(1, elapsedMonths));
    const totalRedemptionDue = selectedPawn.loan_amount + totalAccruedInterest;

    const handleRedeem = (e: React.FormEvent) => {
      e.preventDefault();

      const updatedPawns = pawns.map(p => p.id === selectedPawn.id ? { ...p, status: 'REDEEMED' as any } : p);
      localStore.savePawns(updatedPawns);

      const nextTxId = generateSequenceId('TXN', localStore.getTransactions().length);
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        organization_id: 'org-1',
        transaction_number: nextTxId,
        member_id: selectedPawn.member_id,
        transaction_type: 'PAWN_REDEMPTION',
        amount: totalRedemptionDue,
        transaction_date: new Date().toISOString(),
        reference_number: redeemRef || `RDM-${Date.now().toString().slice(-5)}`,
        description: `Full redemption and safe release of gold item ${selectedPawn.pawn_number} (${elapsedMonths} months interest Rs. ${totalAccruedInterest})`,
        created_by: 'Pawn Officer',
        created_at: new Date().toISOString()
      };
      localStore.saveTransactions([newTx, ...localStore.getTransactions()]);

      localStore.addAudit({
        organization_id: 'org-1',
        user_email: 'admin@kattankudympcs.lk',
        action: 'PAWN_ITEM_RELEASED',
        target_id: selectedPawn.pawn_number,
        target_type: 'PAWN',
        details: `Recorded full redemption payment Rs. ${totalRedemptionDue} (Principal: Rs. ${selectedPawn.loan_amount} + Interest: Rs. ${totalAccruedInterest} for ${elapsedMonths}m) and released gold item ${selectedPawn.pawn_number} from ${selectedPawn.storage_location}`
      });

      setPawns(updatedPawns);
      setActiveView('list');
      toast.success(`Pawning item ${selectedPawn.pawn_number} redeemed and released from vault!`);
      setRedeemRef('');
    };

    return (
      <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setActiveView('list')} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Pawning Tickets</span>
            </button>
            <div style={{ height: '1.25rem', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Pawning</span>
              <span>/</span>
              <span style={{ color: '#c4b5fd', fontWeight: 500 }}>Automated Interest & Redemption Calculator</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: '#1e293b', borderLeft: '4px solid #c4b5fd' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#c4b5fd' }}>
            <Unlock size={24} />
            <span>Redeem & Release Gold Ornament</span>
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pawn Ticket & Owner</div>
              <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem', marginTop: '0.2rem' }}>
                {selectedPawn.pawn_number} — {getMemberName(selectedPawn.member_id)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#c4b5fd', marginTop: '0.2rem' }}>
                <strong>{selectedPawn.item_description}</strong> ({selectedPawn.weight_grams}g)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Vault Location: <strong>{selectedPawn.storage_location}</strong> | Pawned Date: <strong>{formatDate(selectedPawn.start_date)}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agreed Redeem Period</div>
              <span className="badge badge-purple" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {selectedPawn.duration_months || 12} Months (Due: {formatDate(selectedPawn.due_date)})
              </span>
            </div>
          </div>
        </div>

        {/* Automated Pawning Interest & Redemption Calculator Card */}
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'rgba(52, 211, 153, 0.03)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
          <h3 style={{ fontSize: '1.15rem', margin: '0 0 1.25rem 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={20} />
            <span>Automated Redemption & Accrued Interest Breakdown</span>
          </h3>

          <div className="grid-cols-3" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Principal Cash Advance</div>
              <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                {formatCurrency(selectedPawn.loan_amount)}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interest Rate</div>
              <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
                {selectedPawn.interest_rate}% p.a.
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                {(selectedPawn.interest_rate / 12).toFixed(2)}% monthly
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Elapsed Tenure (Months)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={elapsedMonths} 
                  onChange={e => setElapsedMonths(parseInt(e.target.value) || 1)} 
                  style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', background: '#1e293b' }} 
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>months</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accrued Interest Due ({elapsedMonths} months × {(selectedPawn.interest_rate / 12).toFixed(2)}% per month):</div>
              <div className="mono" style={{ fontSize: '1.15rem', color: '#fbbf24', fontWeight: 600, marginTop: '0.2rem' }}>
                + {formatCurrency(totalAccruedInterest)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Settlement Payable</div>
              <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', textShadow: '0 0 20px rgba(52, 211, 153, 0.3)' }}>
                {formatCurrency(totalRedemptionDue)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRedeem} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.95rem' }}>Official Receipt / Voucher Reference Number *</label>
            <input type="text" placeholder="e.g. RDM-55412" value={redeemRef} onChange={e => setRedeemRef(e.target.value)} required autoFocus style={{ fontSize: '1.1rem', padding: '0.75rem' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600, background: '#34d399', color: '#0f172a' }}>
              Confirm Settlement ({formatCurrency(totalRedemptionDue)}) & Authorize Safe Release
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. MAIN PAWNING LEDGER TABLE VIEW
  const filteredPawns = pawns.filter(p => 
    p.pawn_number.toLowerCase().includes(search.toLowerCase()) ||
    p.item_description.toLowerCase().includes(search.toLowerCase()) ||
    p.storage_location.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const activePawns = pawns.filter(p => p.status === 'ACTIVE');
  const totalValuation = activePawns.reduce((a, b) => a + b.valuation_amount, 0);
  const totalAdvanced = activePawns.reduce((a, b) => a + b.loan_amount, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Actions */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gem size={28} style={{ color: '#c4b5fd' }} />
            <span>Cooperative Gold & Jewelry Pawning</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Vault-backed micro-advances against 22K/24K gold ornaments with appraisal verification.
          </p>
        </div>

        <button onClick={() => setActiveView('create')} className="btn btn-primary" style={{ background: '#c4b5fd', color: '#0f172a', fontWeight: 600 }}>
          <Plus size={18} />
          <span>New Pawning Valuation Page</span>
        </button>
      </div>

      {/* Stats Banner */}
      <div className="grid-cols-3">
        <div className="glass-card" style={{ background: '#1e293b', border: '1px solid var(--border-color)' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Safe Vault Valuation</span>
            <Scale size={18} style={{ color: '#c4b5fd' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#c4b5fd' }}>
            {formatCurrency(totalValuation)}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#1e293b', border: '1px solid var(--border-color)' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Cash Advanced</span>
            <DollarSign size={18} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#34d399' }}>
            {formatCurrency(totalAdvanced)}
          </div>
        </div>

        <div className="glass-card" style={{ background: '#1e293b', border: '1px solid var(--border-color)' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vaulted Active Items</span>
            <Lock size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit', marginTop: '0.5rem', color: '#38bdf8' }}>
            {activePawns.length} tickets
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#1e293b' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by Pawn Ticket ID (PWN-000001), Description, Category, or Safe Safe Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', background: '#0f172a' }}
          />
        </div>
      </div>

      {/* Pawning Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Member Name</th>
              <th>Item Description & Weight</th>
              <th>Gold Category</th>
              <th>Valuation</th>
              <th style={{ textAlign: 'right' }}>Loan Advanced</th>
              <th>Storage Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPawns.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No pawning records matching "{search}".
                </td>
              </tr>
            ) : (
              filteredPawns.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 600, color: '#c4b5fd' }}>
                      {p.pawn_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{getMemberName(p.member_id)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due: {formatDate(p.due_date)} ({p.duration_months || 12}m)</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.item_description}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weight: {p.weight_grams}g ({p.condition})</div>
                  </td>
                  <td><span className="badge badge-purple">{p.category}</span></td>
                  <td className="mono">{formatCurrency(p.valuation_amount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatCurrency(p.loan_amount)}
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: '0.75rem', background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {p.storage_location}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {p.status === 'ACTIVE' && (
                      <button 
                        onClick={() => { 
                          setSelectedPawn(p); 
                          const startObj = new Date(p.start_date);
                          const nowObj = new Date();
                          const diffYears = nowObj.getFullYear() - startObj.getFullYear();
                          const diffMonths = (diffYears * 12) + (nowObj.getMonth() - startObj.getMonth());
                          setElapsedMonths(Math.max(1, diffMonths || 1));
                          setActiveView('redeem'); 
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd', background: '#0f172a' }}
                      >
                        <Unlock size={14} />
                        <span>Redeem Page</span>
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
