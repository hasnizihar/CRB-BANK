import type { UserRole, Member } from '../types';

// ─── Staff Credential Registry ──────────────────────────────────────
// Pre-defined cooperative bank staff accounts.
// In production these would live in a Supabase `user_profiles` table.
export interface StaffCredential {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  branch: string;
}

export const STAFF_CREDENTIALS: StaffCredential[] = [
  {
    email: 'admin@kattankudympcs.lk',
    password: 'Admin@2026',
    fullName: 'M. Nizar (System Admin)',
    role: 'SUPER_ADMIN',
    branch: 'KTK-01',
  },
  {
    email: 'manager@kattankudympcs.lk',
    password: 'Manager@2026',
    fullName: 'S. Rahman (Branch Manager)',
    role: 'BANK_ADMIN',
    branch: 'KTK-01',
  },
  {
    email: 'accountant@kattankudympcs.lk',
    password: 'Account@2026',
    fullName: 'A. Faizal (Chief Accountant)',
    role: 'ACCOUNTANT',
    branch: 'KTK-01',
  },
  {
    email: 'loans@kattankudympcs.lk',
    password: 'Loans@2026',
    fullName: 'N. Shifna (Loan Officer)',
    role: 'LOAN_OFFICER',
    branch: 'KTK-01',
  },
  {
    email: 'pawn@kattankudympcs.lk',
    password: 'Pawn@2026',
    fullName: 'K. Amjad (Gold Appraiser)',
    role: 'PAWN_OFFICER',
    branch: 'KTK-01',
  },
];

// ─── Session Types ──────────────────────────────────────────────────
export interface AuthSession {
  email: string;
  fullName: string;
  role: UserRole;
  branch: string;
  loginAt: string;       // ISO timestamp
  expiresAt: string;     // ISO timestamp
  memberId?: string;     // Set only for MEMBER role — locks data visibility
  memberNumber?: string; // e.g. MEM-000001
}

const SESSION_KEY = 'crbms_auth_session';
const STAFF_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;   // 8 hours for staff
const MEMBER_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;  // 2 hours for members

// ─── Staff Auth ─────────────────────────────────────────────────────

/** Attempt staff login with email+password. Returns session or null. */
export function attemptLogin(email: string, password: string): AuthSession | null {
  const trimEmail = email.trim().toLowerCase();
  const staff = STAFF_CREDENTIALS.find(
    (s) => s.email.toLowerCase() === trimEmail && s.password === password
  );
  if (!staff) return null;

  const now = new Date();
  const session: AuthSession = {
    email: staff.email,
    fullName: staff.fullName,
    role: staff.role,
    branch: staff.branch,
    loginAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + STAFF_SESSION_DURATION_MS).toISOString(),
  };

  persistSession(session);
  return session;
}

// ─── Member Auth ────────────────────────────────────────────────────
// Members log in with their NIC number + a password.
// Default password for all members = their NIC number (first-time).
// In production this would be hashed and stored per-member.

/**
 * Attempt member login. Validates NIC against the member registry.
 * Password default = NIC number (acts as first-time PIN).
 */
export function attemptMemberLogin(
  nic: string,
  password: string,
  memberRegistry: Member[]
): AuthSession | null {
  const trimNic = nic.trim().toUpperCase();

  // Find active member by NIC
  const member = memberRegistry.find(
    (m) =>
      m.nic.toUpperCase() === trimNic &&
      m.membership_status === 'ACTIVE' &&
      m.member_type !== 'NON_MEMBER'
  );
  if (!member) return null;

  // Validate password — default is NIC number itself
  // Members can also use the pattern: Member@2026
  const validPasswords = [member.nic, 'Member@2026'];
  if (!validPasswords.includes(password)) return null;

  const now = new Date();
  const session: AuthSession = {
    email: member.email || `${member.member_number.toLowerCase()}@members.kattankudympcs.lk`,
    fullName: `${member.first_name} ${member.last_name}`,
    role: 'MEMBER',
    branch: 'KTK-01',
    memberId: member.id,
    memberNumber: member.member_number,
    loginAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + MEMBER_SESSION_DURATION_MS).toISOString(),
  };

  persistSession(session);
  return session;
}

// ─── Session Persistence ────────────────────────────────────────────

/** Persist session to localStorage. */
export function persistSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // silent — storage may be full
  }
}

/** Retrieve and validate stored session. Returns null if expired/missing. */
export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);

    // Validate expiry
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

/** Destroy session (logout). */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Check how many minutes remain in the current session. */
export function sessionMinutesRemaining(session: AuthSession): number {
  const remaining = new Date(session.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60_000));
}
