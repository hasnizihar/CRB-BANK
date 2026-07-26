import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Sliders, 
  Save, 
  CheckCircle2,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { localStore } from '../../lib/store';

export const SettingsPage: React.FC = () => {
  // Load saved settings or use defaults
  const savedSettings = JSON.parse(localStorage.getItem('crbms_settings') || '{}');

  const [orgName, setOrgName] = useState(savedSettings.orgName || 'Kattankudy Multi-Purpose Cooperative Society Ltd');
  const [branchCode, setBranchCode] = useState(savedSettings.branchCode || 'KTK-01');
  const [address, setAddress] = useState(savedSettings.address || 'Division 04, Main Street, Kattankudy');
  const [phone, setPhone] = useState(savedSettings.phone || '065-2245678');
  const [regNo, setRegNo] = useState(savedSettings.regNo || 'MPCS/EP/KTK/1954/04');
  const [signatoryTitle, setSignatoryTitle] = useState(savedSettings.signatoryTitle || 'Chief Executive Officer / MPCS Secretary');

  // ID Prefixes
  const [memPrefix, setMemPrefix] = useState(savedSettings.memPrefix || 'MEM');
  const [savPrefix, setSavPrefix] = useState(savedSettings.savPrefix || 'SAV');
  const [lonPrefix, setLonPrefix] = useState(savedSettings.lonPrefix || 'LON');
  const [pwnPrefix, setPwnPrefix] = useState(savedSettings.pwnPrefix || 'PWN');

  // Default Interest Rate Engine
  const [savingsRate, setSavingsRate] = useState(savedSettings.savingsRate || '8.5');
  const [seniorSavingsRate, setSeniorSavingsRate] = useState(savedSettings.seniorSavingsRate || '10.0');
  const [loanRate, setLoanRate] = useState(savedSettings.loanRate || '12.5');
  const [pawnRate, setPawnRate] = useState(savedSettings.pawnRate || '14.0');
  const [maxPawnLTV, setMaxPawnLTV] = useState(savedSettings.maxPawnLTV || '80');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const configToSave = {
      orgName, branchCode, address, phone, regNo, signatoryTitle,
      memPrefix, savPrefix, lonPrefix, pwnPrefix,
      savingsRate, seniorSavingsRate, loanRate, pawnRate, maxPawnLTV
    };
    localStorage.setItem('crbms_settings', JSON.stringify(configToSave));

    localStore.addAudit({
      organization_id: 'org-1',
      user_email: 'admin@kattankudympcs.lk',
      action: 'UPDATE_WHITE_LABEL_CONFIG',
      target_id: 'org-1',
      target_type: 'USER',
      details: `Updated cooperative configuration for ${orgName} (${branchCode}). Default rates: Savings ${savingsRate}%, Loan ${loanRate}%, Pawn ${pawnRate}%`
    });
    toast.success('Cooperative society settings, statutory metadata, and interest rates saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl" style={{ padding: '0.5rem 0' }}>
      {/* Top Header Banner Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', borderLeft: '4px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-info" style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem' }}>System Config</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Kattankudy MPCS Ltd • Branch KTK-01</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Cooperative Bank & Branch Configuration Portal</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Configure institution branding, statutory registration metadata, default interest rate engines, and ID prefixes.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Organization Profile & Statutory Metadata */}
        <div className="glass-panel p-6 bg-[#f8fafc] border-t-4 border-t-[#0284c7] space-y-4">
          <h3 className="text-sm font-semibold text-[#0f172a] pb-3 border-b border-[#e2e8f0] flex items-center gap-2">
            <Building2 size={18} className="text-[#0284c7]" />
            <span>Cooperative Institution Legal & Statutory Profile</span>
          </h3>

          <div className="grid-cols-2">
            <div className="form-group mb-0">
              <label className="form-label">Institution Legal Name *</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required className="bg-white" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Statutory Registration No. (Dept of Co-op) *</label>
              <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)} required className="bg-white font-mono font-semibold text-[#0284c7]" />
            </div>
          </div>

          <div className="grid-cols-3">
            <div className="form-group mb-0">
              <label className="form-label">Branch Code *</label>
              <input type="text" value={branchCode} onChange={e => setBranchCode(e.target.value)} required className="bg-white font-mono font-semibold" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Official Telephone *</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="bg-white font-mono" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Authorized Signatory Title *</label>
              <input type="text" value={signatoryTitle} onChange={e => setSignatoryTitle(e.target.value)} required className="bg-white" />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Headquarters Address *</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} required className="bg-white" />
          </div>
        </div>

        {/* Default Interest Rate Engine */}
        <div className="glass-panel p-6 bg-[#f8fafc] border-t-4 border-t-[#059669] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <Percent size={18} className="text-[#059669]" />
              <span>Default Cooperative Interest Rate Engine</span>
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Set standard annualized interest percentages applied across new savings deposits, loan credit disbursements, and gold pawning advances.
            </p>
          </div>

          <div className="grid-cols-3 pt-2 border-t border-[#e2e8f0]">
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#059669]">Standard Savings Rate (% p.a.)</label>
              <div className="relative">
                <input type="number" step="0.1" value={savingsRate} onChange={e => setSavingsRate(e.target.value)} className="bg-white font-mono font-bold text-base text-[#059669] pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">%</span>
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#0284c7]">Senior Citizen Savings Rate (% p.a.)</label>
              <div className="relative">
                <input type="number" step="0.1" value={seniorSavingsRate} onChange={e => setSeniorSavingsRate(e.target.value)} className="bg-white font-mono font-bold text-base text-[#0284c7] pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">%</span>
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#d97706]">Standard Loan Rate (% p.a.)</label>
              <div className="relative">
                <input type="number" step="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} className="bg-white font-mono font-bold text-base text-[#d97706] pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">%</span>
              </div>
            </div>
          </div>

          <div className="grid-cols-2 pt-2 border-t border-[#e2e8f0]">
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#4f46e5]">Gold Pawning Advance Rate (% p.a.)</label>
              <div className="relative">
                <input type="number" step="0.1" value={pawnRate} onChange={e => setPawnRate(e.target.value)} className="bg-white font-mono font-bold text-base text-[#4f46e5] pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">%</span>
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label font-semibold text-[#dc2626]">Max Gold Pawning LTV Risk Limit (% of Appraisal)</label>
              <div className="relative">
                <input type="number" step="1" max="95" min="50" value={maxPawnLTV} onChange={e => setMaxPawnLTV(e.target.value)} className="bg-white font-mono font-bold text-base text-[#dc2626] pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sequential ID Prefixes */}
        <div className="glass-panel p-6 bg-[#f8fafc] border-t-4 border-t-[#4f46e5] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
              <Sliders size={18} className="text-[#4f46e5]" />
              <span>Human-Readable ID Prefix Engine</span>
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              System auto-pads sequence numbers to 6 digits (e.g. MEM-000001) per cooperative accounting standards.
            </p>
          </div>

          <div className="grid-cols-4 pt-2 border-t border-[#e2e8f0]">
            <div className="form-group mb-0">
              <label className="form-label">Member Prefix</label>
              <input type="text" value={memPrefix} onChange={e => setMemPrefix(e.target.value)} className="bg-white font-mono text-center font-bold text-base text-[#0284c7]" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Savings Prefix</label>
              <input type="text" value={savPrefix} onChange={e => setSavPrefix(e.target.value)} className="bg-white font-mono text-center font-bold text-base text-[#059669]" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Loan Prefix</label>
              <input type="text" value={lonPrefix} onChange={e => setLonPrefix(e.target.value)} className="bg-white font-mono text-center font-bold text-base text-[#d97706]" />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Pawning Prefix</label>
              <input type="text" value={pwnPrefix} onChange={e => setPwnPrefix(e.target.value)} className="bg-white font-mono text-center font-bold text-base text-[#4f46e5]" />
            </div>
          </div>
        </div>

        {/* Security & RLS */}
        <div className="glass-panel p-6 bg-[#f0fdf4] border border-[#bbf7d0] space-y-2">
          <h3 className="text-sm font-semibold text-[#059669] flex items-center gap-2">
            <Shield size={18} />
            <span>PostgreSQL Row-Level Security (RLS) Status</span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#0f172a]">
            <CheckCircle2 size={18} className="text-[#059669] shrink-0" />
            <span><strong>Active Enforcement:</strong> All database queries are automatically filtered by <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#bbf7d0]">organization_id = auth.jwt() -&gt;&gt; 'org_id'</code></span>
          </div>
          <p className="text-xs text-[#64748b] pl-6">
            White-label multi-tenancy ensures complete isolation between Kattankudy MPCS and other cooperative banking societies.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn btn-primary text-xs font-semibold px-6 py-2.5">
            <Save size={16} />
            <span>Save & Apply Cooperative Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
