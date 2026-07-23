import { type ClassValue, clsx } from 'clsx';

// ── Class name utility (Tailwind merge alternative) ──
export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ');
}

// ── Currency formatting (Sri Lankan Rupees) ──
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Short currency (e.g., 1.2M, 500K) ──
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rs. ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Rs. ${(amount / 1_000).toFixed(1)}K`;
  }
  return `Rs. ${amount.toFixed(2)}`;
}

// ── Date formatting ──
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ── Receipt number generator ──
export function generateReceiptNo(prefix: string = 'RCP'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
}

// ── Loan calculation helpers ──
export function calculateMonthlyInstallment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const installment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(installment * 100) / 100;
}

export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  months: number
): number {
  const installment = calculateMonthlyInstallment(principal, annualRate, months);
  return Math.round((installment * months - principal) * 100) / 100;
}

// ── Status color helpers ──
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    dormant: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    disbursed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    defaulted: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

// ── Loan category labels ──
export function getLoanCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    livelihood: 'Livelihood Loan',
    production: 'Production Loan',
    small_industrial: 'Small Industrial Loan',
    consumption: 'Consumption Loan',
    government_servant: 'Government Servant Loan',
    special: 'Special Loan',
  };
  return labels[category] || category;
}

// ── Role display labels ──
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    administrator: 'Administrator',
    bank_manager: 'Bank Manager',
    cashier: 'Cashier',
    loan_officer: 'Loan Officer',
    accountant: 'Accountant',
    auditor: 'Auditor',
  };
  return labels[role] || role;
}

// ── Truncate text ──
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// ── Generate member number ──
export function generateMemberNo(): string {
  const prefix = 'CRB';
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `${prefix}-${random}`;
}

// ── Generate account number ──
export function generateAccountNo(): string {
  const prefix = 'SAV';
  const random = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `${prefix}-${random}`;
}
