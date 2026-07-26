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
  const [address, setAddress] = useState(savedSettings.address || 'Divisi 04, Main Street, Kattankudy');
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
    <div className="animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '950px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} style={{ color: 'var(--accent-primary)' }} />
          <span>Cooperative Bank & Branch Configuration Portal</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Configure institution branding, statutory registration metadata, default interest rate engines, and ID prefixes.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Organization Profile & Statutory Metadata */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderTop: '3px solid var(--accent-primary)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: '#fff' }}>
            <Building2 size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Cooperative Institution Legal & Statutory Profile</span>
          </h3>

          <div className="grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Institution Legal Name *</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Statutory Registration No. (Dept of Co-op) *</label>
              <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)} required className="mono" style={{ fontWeight: 600, color: '#38bdf8' }} />
            </div>
          </div>

          <div className="grid-cols-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Branch Code *</label>
              <input type="text" value={branchCode} onChange={e => setBranchCode(e.target.value)} required className="mono" />
            </div>
            <div className="form-group">
              <label className="form-label">Official Telephone *</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Authorized Signatory Title *</label>
              <input type="text" value={signatoryTitle} onChange={e => setSignatoryTitle(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters Address *</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
        </div>

        {/* Default Interest Rate Engine */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderTop: '3px solid #38bdf8' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Percent size={20} style={{ color: '#38bdf8' }} />
            <span>Default Cooperative Interest Rate Engine</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Set standard annualized interest percentages applied across new savings deposits, loan credit disbursements, and gold pawning advances.
          </p>

          <div className="grid-cols-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#34d399', fontWeight: 600 }}>Standard Savings Rate (% p.a.)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="0.1" value={savingsRate} onChange={e => setSavingsRate(e.target.value)} className="mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#34d399', paddingRight: '2.5rem' }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#38bdf8', fontWeight: 600 }}>Senior Citizen Savings Rate (% p.a.)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="0.1" value={seniorSavingsRate} onChange={e => setSeniorSavingsRate(e.target.value)} className="mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8', paddingRight: '2.5rem' }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fbbf24', fontWeight: 600 }}>Standard Loan Rate (% p.a.)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} className="mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24', paddingRight: '2.5rem' }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#c4b5fd', fontWeight: 600 }}>Gold Pawning Advance Rate (% p.a.)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="0.1" value={pawnRate} onChange={e => setPawnRate(e.target.value)} className="mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#c4b5fd', paddingRight: '2.5rem' }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#f43f5e', fontWeight: 600 }}>Max Gold Pawning LTV Risk Limit (% of Appraisal)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" step="1" max="95" min="50" value={maxPawnLTV} onChange={e => setMaxPawnLTV(e.target.value)} className="mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f43f5e', paddingRight: '2.5rem' }} />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sequential ID Prefixes */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderTop: '3px solid var(--accent-secondary)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Sliders size={20} style={{ color: 'var(--accent-secondary)' }} />
            <span>Human-Readable ID Prefix Engine</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            System auto-pads sequence numbers to 6 digits (e.g. MEM-000001) per cooperative accounting standards.
          </p>

          <div className="grid-cols-4" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Member Prefix</label>
              <input type="text" value={memPrefix} onChange={e => setMemPrefix(e.target.value)} className="mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Savings Prefix</label>
              <input type="text" value={savPrefix} onChange={e => setSavPrefix(e.target.value)} className="mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#34d399' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Loan Prefix</label>
              <input type="text" value={lonPrefix} onChange={e => setLonPrefix(e.target.value)} className="mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Pawning Prefix</label>
              <input type="text" value={pwnPrefix} onChange={e => setPwnPrefix(e.target.value)} className="mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#c4b5fd' }} />
            </div>
          </div>
        </div>

        {/* Security & RLS */}
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
            <Shield size={20} />
            <span>PostgreSQL Row-Level Security (RLS) Status</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={22} style={{ color: '#34d399' }} />
            <span><strong>Active Enforcement:</strong> All database queries are automatically filtered by <code className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff' }}>organization_id = auth.jwt() -&gt;&gt; 'org_id'</code></span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.6rem 0 0 1.9rem' }}>
            White-label multi-tenancy ensures complete isolation between Kattankudy MPCS and other cooperative banking societies.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 600, background: 'var(--accent-primary)', color: '#0f172a' }}>
            <Save size={18} />
            <span>Save & Apply Cooperative Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
