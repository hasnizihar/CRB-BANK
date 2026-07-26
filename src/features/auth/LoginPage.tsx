import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Building2 } from 'lucide-react';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@kattankudympcs.lk');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Authenticated successfully as ${selectedRole}`);
    onLoginSuccess(selectedRole);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      background: '#f8fafc'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '3.5rem', 
            height: '3.5rem', 
            borderRadius: '0.5rem', 
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.03em'
          }}>
            CRB
          </div>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>Kattankudy MPCS Ltd</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Cooperative Rural Bank Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} />
              <span>User Email or Member ID</span>
            </label>
            <input 
              type="text" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="e.g. admin@kattankudympcs.lk" 
              required 
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••••••" 
              required 
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} />
              <span>Select Access Role (Demo Switcher)</span>
            </label>
            <select 
              value={selectedRole} 
              onChange={e => setSelectedRole(e.target.value as UserRole)}
              style={{ fontWeight: 600, color: 'var(--text-main)' }}
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN (System Administrator)</option>
              <option value="BANK_ADMIN">BANK_ADMIN (Cooperative Bank Manager)</option>
              <option value="LOAN_OFFICER">LOAN_OFFICER (Credit & Micro-Finance)</option>
              <option value="PAWN_OFFICER">PAWN_OFFICER (Gold Appraiser & Vault)</option>
              <option value="ACCOUNTANT">ACCOUNTANT (Financial Ledgers)</option>
              <option value="MEMBER">MEMBER (Member Read-Only Portal)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
            <span>Sign In to Portal</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Building2 size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>RLS Multi-Tenant Protected • Org: org-1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
