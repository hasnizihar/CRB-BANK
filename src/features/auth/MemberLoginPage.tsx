import React, { useState } from 'react';
import { Shield, Lock, CreditCard, ArrowRight, Building2, AlertCircle, Eye, EyeOff, Users, ArrowLeft } from 'lucide-react';
import { attemptMemberLogin } from '../../lib/auth';
import { localStore } from '../../lib/store';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

interface MemberLoginPageProps {
  onLoginSuccess: (role: UserRole, email: string, fullName: string) => void;
  onSwitchToStaff: () => void;
}

export const MemberLoginPage: React.FC<MemberLoginPageProps> = ({ onLoginSuccess, onSwitchToStaff }) => {
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<number>(0);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 60_000;

  const members = localStore.getMembers().filter(
    (m) => m.member_type !== 'NON_MEMBER' && m.membership_status === 'ACTIVE'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check lockout
    if (isLocked && Date.now() < lockUntil) {
      const secsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
      setError(`Account temporarily locked. Try again in ${secsLeft}s.`);
      return;
    }
    if (isLocked && Date.now() >= lockUntil) {
      setIsLocked(false);
      setFailedAttempts(0);
    }

    if (!nic.trim() || !password.trim()) {
      setError('Please enter both NIC number and password.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const allMembers = localStore.getMembers();
    const session = attemptMemberLogin(nic, password, allMembers);

    if (!session) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setLockUntil(Date.now() + LOCKOUT_MS);
        setError(`Too many failed attempts. Account locked for 60 seconds.`);
        toast.error('Login locked due to repeated failed attempts');
      } else {
        setError(`Invalid NIC or password. Ensure you are a registered active cooperative member. (${MAX_ATTEMPTS - newAttempts} attempts remaining)`);
      }

      setIsLoading(false);
      return;
    }

    toast.success(`Welcome, ${session.fullName}! Your member portal is ready.`);
    setIsLoading(false);
    onLoginSuccess(session.role, session.email, session.fullName);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f1f5f9 50%, #fefce8 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}>
        {/* Back to Staff Login */}
        <button
          onClick={onSwitchToStaff}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            marginBottom: '1rem',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            transition: 'all 0.15s',
          }}
        >
          <ArrowLeft size={14} />
          <span>Staff Login Portal</span>
        </button>

        {/* Login Card */}
        <div style={{
          padding: '2.5rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
            }}>
              <Users size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Member Self-Service Portal
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
              Kattankudy Multi-Purpose Cooperative Society
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              fontSize: '0.7rem',
              color: '#059669',
              fontWeight: 600,
            }}>
              <Shield size={11} />
              <span>Read-Only Transparency Portal</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: '0.5rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              fontSize: '0.82rem',
              color: '#991b1b',
              lineHeight: 1.5,
            }}>
              <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0, color: '#dc2626' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.82rem', fontWeight: 600, color: '#334155',
              }}>
                <CreditCard size={13} style={{ color: '#64748b' }} />
                <span>NIC Number (National Identity Card)</span>
              </label>
              <input
                type="text"
                value={nic}
                onChange={(e) => { setNic(e.target.value); setError(''); }}
                placeholder="e.g. 883451234V"
                required
                autoFocus
                disabled={isLoading}
                style={{
                  padding: '0.7rem 0.85rem',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  color: '#0f172a',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.03em',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.82rem', fontWeight: 600, color: '#334155',
              }}>
                <Lock size={13} style={{ color: '#64748b' }} />
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Default: Your NIC number"
                  required
                  disabled={isLoading}
                  style={{
                    padding: '0.7rem 2.75rem 0.7rem 0.85rem',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    color: '#0f172a',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                First-time login? Use your NIC number as the default password.
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              style={{
                padding: '0.8rem',
                marginTop: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: isLocked ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isLoading || isLocked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1rem', height: '1rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  <span>Verifying Member Identity...</span>
                </>
              ) : isLocked ? (
                <>
                  <Lock size={17} />
                  <span>Account Locked</span>
                </>
              ) : (
                <>
                  <span>Access My Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Quick-Fill */}
        <div style={{
          marginTop: '1rem',
          padding: '1.25rem 1.5rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.72rem', fontWeight: 600, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}>
            <Users size={12} />
            <span>Registered Members (Quick Login)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setNic(m.nic);
                  setPassword(m.nic); // default password = NIC
                  setError('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: nic === m.nic ? '#f0fdf4' : '#f8fafc',
                  border: nic === m.nic ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: nic === m.nic ? '#059669' : '#cbd5e1',
                  }} />
                  <span style={{ color: '#334155', fontWeight: 500 }}>{m.first_name} {m.last_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: '#64748b',
                    padding: '0.15rem 0.45rem',
                    background: '#f1f5f9',
                    borderRadius: '0.25rem',
                    border: '1px solid #e2e8f0',
                  }}>
                    {m.member_number}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: '#059669',
                    padding: '0.15rem 0.45rem',
                    background: '#f0fdf4',
                    borderRadius: '0.25rem',
                    border: '1px solid #bbf7d0',
                  }}>
                    NIC: {m.nic}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#94a3b8' }}>
            <Building2 size={12} style={{ color: '#059669' }} />
            <span>Data Isolated by Member NIC • Session: 2hr TTL • Read-Only</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
            © 2026 Kattankudy MPCS Ltd. All rights reserved.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
