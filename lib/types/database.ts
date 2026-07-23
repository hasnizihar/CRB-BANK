// ── CRB Management System — Database Types ──

export type UserRole =
  | 'administrator'
  | 'bank_manager'
  | 'cashier'
  | 'loan_officer'
  | 'accountant'
  | 'auditor';

export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type AccountStatus = 'active' | 'dormant' | 'closed' | 'frozen';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'interest';
export type LoanCategory =
  | 'livelihood'
  | 'production'
  | 'small_industrial'
  | 'consumption'
  | 'government_servant'
  | 'special';
export type LoanStatus =
  | 'pending'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'active'
  | 'completed'
  | 'defaulted';
export type NotificationType =
  | 'installment_due'
  | 'loan_overdue'
  | 'birthday'
  | 'inactive_account'
  | 'matured_deposit';

// ── Table Row Types ──

export interface Profile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Member {
  id: string;
  member_no: string;
  nic: string;
  full_name: string;
  address: string;
  phone: string;
  gender: 'male' | 'female';
  occupation: string;
  dob: string;
  join_date: string;
  nominee: string | null;
  photo_url: string | null;
  signature_url: string | null;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  member_id: string | null;
  is_minor: boolean;
  guardian_name: string | null;
  guardian_nic: string | null;
  birth_cert_no: string | null;
  relationship: string | null;
  created_at: string;
}

export interface SavingsAccount {
  id: string;
  member_id: string;
  account_no: string;
  passbook_no: string;
  account_type: string;
  opening_balance: number;
  current_balance: number;
  interest_rate: number;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  member?: Member;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  officer_id: string;
  receipt_no: string;
  description: string | null;
  created_at: string;
  // Joined fields
  account?: SavingsAccount;
  officer?: Profile;
}

export interface Loan {
  id: string;
  member_id: string;
  loan_category: LoanCategory;
  requested_amount: number;
  approved_amount: number | null;
  interest_rate: number;
  repayment_period: number; // months
  monthly_installment: number | null;
  guarantor: string;
  purpose: string;
  status: LoanStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  member?: Member;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  date: string;
  capital: number;
  interest: number;
  balance_remaining: number;
  receipt_no: string;
  created_at: string;
  // Joined fields
  loan?: Loan;
}

export interface CashBook {
  id: string;
  date: string;
  opening_balance: number;
  cash_in: number;
  cash_out: number;
  closing_balance: number;
  verified_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  user?: Profile;
}

export interface Notification {
  id: string;
  type: NotificationType;
  member_id: string;
  title: string;
  message: string;
  due_date: string | null;
  is_read: boolean;
  created_at: string;
  // Joined fields
  member?: Member;
}

// ── Dashboard Types ──

export interface DashboardStats {
  todayDeposits: number;
  todayWithdrawals: number;
  cashBalance: number;
  totalMembers: number;
  totalCustomers: number;
  activeLoans: number;
  overdueLoans: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

// ── Form State Types ──

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ── Navigation Types ──

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
}
