import React, { useState } from 'react';
import { 
  Gem, 
  Search, 
  Plus, 
  Lock, 
  Unlock, 
  Scale, 
  DollarSign,
  ArrowLeft
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
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex-between pb-4 border-b border-[#e2e8f0]">
          <button 
            onClick={() => setActiveView('list')} 
            className="btn btn-secondary text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Pawning Tickets</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <span>Pawning</span>
            <span>/</span>
            <span className="text-[#0284c7] font-medium">New Gold Appraisal & Vaulting Portal</span>
          </div>
        </div>

        <div className="glass-panel p-6 bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284c7] text-white rounded-lg">
              <Gem size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0f172a]">New Gold Pawning Valuation & Cash Advance</h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                Issue a new safe-backed pawning ticket with automated risk-based 80% LTV valuation ceilings.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreatePawn} className="glass-panel p-8 space-y-6">
          <div className="grid-cols-2">
            <div className="form-group mb-0">
              <label className="form-label">Select Member / Customer *</label>
              <select 
                value={selectedMemberId} 
                onChange={e => setSelectedMemberId(e.target.value)}
                className="bg-white"
                required
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.member_number} - {m.first_name} {m.last_name} ({m.nic})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Gold Purity Category *</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as any)}
                className="bg-white font-medium"
              >
                <option value="GOLD_22K">22 Karat Gold Ornaments</option>
                <option value="GOLD_24K">24 Karat Pure Gold Bullion / Coin</option>
                <option value="JEWELRY">Mixed Diamond / Gemstone Jewelry</option>
                <option value="OTHER">Other Valuable Metal / Silver</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-3 pt-2 border-t border-[#e2e8f0]">
            <div className="form-group mb-0">
              <label className="form-label">Item Description *</label>
              <input 
                type="text" 
                placeholder="e.g. Gold Necklace with 2 Bangles" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Net Weight (Grams) *</label>
              <input 
                type="number" 
                step="0.01" 
                value={weightGrams} 
                onChange={e => setWeightGrams(e.target.value)} 
                required 
                className="font-mono font-semibold"
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Agreed Redeem Tenure (Months) *</label>
              <select 
                value={durationMonths} 
                onChange={e => setDurationMonths(e.target.value)}
                className="bg-white font-medium text-[#0284c7]"
              >
                <option value="3">3 Months (Short Term)</option>
                <option value="6">6 Months (Standard)</option>
                <option value="12">12 Months (Full Annual Cycle)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] grid-cols-3">
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#0f172a]">Total Gold Appraisal Valuation (Rs.) *</label>
              <input 
                type="number" 
                value={valuation} 
                onChange={e => setValuation(e.target.value)} 
                required 
                className="font-mono text-base font-bold text-[#0f172a]"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#059669]">Principal Cash Advance (≤ 80% LTV) *</label>
              <input 
                type="number" 
                value={loanAmount} 
                onChange={e => setLoanAmount(e.target.value)} 
                required 
                className="font-mono text-base font-bold text-[#059669]"
              />
              <div className="text-[11px] text-[#64748b] mt-1">
                Max allowable: Rs. {((parseFloat(valuation) || 0) * 0.8).toLocaleString()}
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#0f172a]">Interest Rate (% p.a.) *</label>
              <input 
                type="number" 
                step="0.1" 
                value={interestRate} 
                onChange={e => setInterestRate(e.target.value)} 
                required 
                className="font-mono text-base font-bold text-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid-cols-2 pt-2 border-t border-[#e2e8f0]">
            <div className="form-group mb-0">
              <label className="form-label">Safe Storage Location (Vault Drawer / Safe No.) *</label>
              <input 
                type="text" 
                value={storageLocation} 
                onChange={e => setStorageLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Appraiser Notes / Hallmarking Verification</label>
              <input 
                type="text" 
                placeholder="e.g. Acid tested 22k, hallmark stamped on clasp" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#e2e8f0]">
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs font-semibold">
              Issue Pawn Ticket & Authorize Cash Advance
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. FULL PAGE VIEW: Automated Pawning Interest & Redemption Calculator
  if (activeView === 'redeem' && selectedPawn) {
    const monthlyRate = (selectedPawn.interest_rate / 100) / 12;
    const totalAccruedInterest = selectedPawn.loan_amount * monthlyRate * elapsedMonths;
    const totalRedemptionDue = selectedPawn.loan_amount + totalAccruedInterest;

    const handleRedeem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!redeemRef) {
        toast.error('Please enter the official redemption receipt reference number');
        return;
      }

      const updatedPawns = pawns.map(p => 
        p.id === selectedPawn.id ? { ...p, status: 'REDEEMED' as const } : p
      );
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
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex-between pb-4 border-b border-[#e2e8f0]">
          <button 
            onClick={() => setActiveView('list')} 
            className="btn btn-secondary text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Pawning Tickets</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <span>Pawning</span>
            <span>/</span>
            <span className="text-[#0284c7] font-medium">Automated Interest & Redemption Calculator</span>
          </div>
        </div>

        <div className="glass-panel p-6 bg-[#f8fafc] border-l-4 border-l-[#0284c7]">
          <div className="flex items-center gap-3">
            <Unlock size={22} className="text-[#0284c7]" />
            <h1 className="text-lg font-semibold text-[#0f172a]">Redeem & Release Gold Ornament</h1>
          </div>

          <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg border border-[#e2e8f0] flex-wrap gap-4 shadow-sm">
            <div>
              <div className="text-xs text-[#64748b]">Pawn Ticket & Owner</div>
              <div className="font-mono font-semibold text-[#0f172a] text-base mt-0.5">
                {selectedPawn.pawn_number} — {getMemberName(selectedPawn.member_id)}
              </div>
              <div className="text-xs font-medium text-[#0284c7] mt-1">
                {selectedPawn.item_description} ({selectedPawn.weight_grams}g)
              </div>
              <div className="text-[11px] text-[#64748b] mt-1">
                Vault Location: <strong className="text-[#0f172a]">{selectedPawn.storage_location}</strong> | Pawned Date: <strong className="text-[#0f172a]">{formatDate(selectedPawn.start_date)}</strong>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#64748b]">Agreed Redeem Period</div>
              <span className="badge badge-info mt-1 text-xs">
                {selectedPawn.duration_months || 12} Months (Due: {formatDate(selectedPawn.due_date)})
              </span>
            </div>
          </div>
        </div>

        {/* Automated Pawning Interest & Redemption Calculator Card */}
        <div className="glass-panel p-6 bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#0f172a] mb-4 flex items-center gap-2">
            <Scale size={18} className="text-[#0284c7]" />
            <span>Automated Redemption & Accrued Interest Breakdown</span>
          </h3>

          <div className="grid-cols-3 mb-6">
            <div className="p-4 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
              <div className="text-xs text-[#64748b] uppercase font-semibold">Principal Cash Advance</div>
              <div className="font-mono text-lg font-bold text-[#0f172a] mt-1">
                {formatCurrency(selectedPawn.loan_amount)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
              <div className="text-xs text-[#64748b] uppercase font-semibold">Interest Rate</div>
              <div className="font-mono text-lg font-bold text-[#0284c7] mt-1">
                {selectedPawn.interest_rate}% p.a.
              </div>
              <div className="text-[11px] text-[#64748b] mt-0.5">
                {(selectedPawn.interest_rate / 12).toFixed(2)}% monthly
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
              <div className="text-xs text-[#64748b] uppercase font-semibold">Elapsed Tenure (Months)</div>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={elapsedMonths} 
                  onChange={e => setElapsedMonths(parseInt(e.target.value) || 1)} 
                  className="w-20 p-1.5 text-base font-bold text-center bg-[#f8fafc] border border-[#cbd5e1] rounded font-mono" 
                />
                <span className="text-xs text-[#64748b]">months</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#e2e8f0] flex justify-between items-center flex-wrap gap-4 shadow-sm">
            <div>
              <div className="text-xs text-[#64748b]">Accrued Interest Due ({elapsedMonths} months × {(selectedPawn.interest_rate / 12).toFixed(2)}% per month):</div>
              <div className="font-mono text-base text-[#d97706] font-semibold mt-1">
                + {formatCurrency(totalAccruedInterest)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#64748b] uppercase font-semibold tracking-wider">Total Settlement Payable</div>
              <div className="font-mono text-2xl font-bold text-[#059669] mt-0.5">
                {formatCurrency(totalRedemptionDue)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRedeem} className="glass-panel p-8 space-y-6">
          <div className="form-group mb-0">
            <label className="form-label font-semibold text-[#0f172a] text-xs">Official Receipt / Voucher Reference Number *</label>
            <input 
              type="text" 
              placeholder="e.g. RDM-55412" 
              value={redeemRef} 
              onChange={e => setRedeemRef(e.target.value)} 
              required 
              autoFocus 
              className="font-mono font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#e2e8f0]">
            <button type="button" onClick={() => setActiveView('list')} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs font-semibold bg-[#059669] hover:bg-[#047857]">
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
    <div className="space-y-6 animate-fade-in" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gem size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>Gold Vault Ledger</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Cooperative Gold & Jewelry Pawning</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Vault-backed micro-advances against 22K/24K gold ornaments with appraisal verification.</p>
          </div>
        </div>
        <button onClick={() => setActiveView('create')} className="btn btn-primary" style={{ padding: '0.65rem 1.15rem', fontWeight: 600 }}>
          <Plus size={16} />
          <span>New Pawning Valuation Page</span>
        </button>
      </div>

      {/* Stats Banner */}
      <div className="grid-cols-3">
        <div className="glass-panel p-4">
          <div className="flex-between text-xs text-[#64748b] font-medium">
            <span>Total Safe Vault Valuation</span>
            <Scale size={16} className="text-[#0284c7]" />
          </div>
          <div className="text-xl font-semibold font-mono mt-2 text-[#0f172a]">
            {formatCurrency(totalValuation)}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex-between text-xs text-[#64748b] font-medium">
            <span>Total Cash Advanced</span>
            <DollarSign size={16} className="text-[#059669]" />
          </div>
          <div className="text-xl font-semibold font-mono mt-2 text-[#0f172a]">
            {formatCurrency(totalAdvanced)}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex-between text-xs text-[#64748b] font-medium">
            <span>Vaulted Active Items</span>
            <Lock size={16} className="text-[#d97706]" />
          </div>
          <div className="text-xl font-semibold font-mono mt-2 text-[#0f172a]">
            {activePawns.length} tickets
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 bg-[#f8fafc] flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input 
            type="text"
            placeholder="Search by Pawn Ticket ID (PWN-000001), Description, Category, or Safe Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white text-xs"
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
              <th className="text-right">Loan Advanced</th>
              <th>Storage Location</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPawns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-[#64748b]">
                  No pawning records matching "{search}".
                </td>
              </tr>
            ) : (
              filteredPawns.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-xs font-semibold text-[#0f172a]">
                      {p.pawn_number}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[#0f172a]">{getMemberName(p.member_id)}</div>
                    <div className="text-[11px] text-[#64748b]">Due: {formatDate(p.due_date)} ({p.duration_months || 12}m)</div>
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[#0f172a]">{p.item_description}</div>
                    <div className="text-[11px] text-[#64748b]">Weight: {p.weight_grams}g ({p.condition})</div>
                  </td>
                  <td><span className="badge badge-purple">{p.category}</span></td>
                  <td className="font-mono text-xs">{formatCurrency(p.valuation_amount)}</td>
                  <td className="text-right font-mono text-sm font-bold text-[#059669]">
                    {formatCurrency(p.loan_amount)}
                  </td>
                  <td>
                    <span className="font-mono text-xs bg-[#f8fafc] border border-[#e2e8f0] px-1.5 py-0.5 rounded text-[#0f172a]">
                      {p.storage_location}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-right">
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
                        className="btn btn-secondary text-[11px] py-1 px-2.5 text-[#0284c7]"
                      >
                        <Unlock size={13} />
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
