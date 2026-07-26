export type UserRole = 
  | 'SUPER_ADMIN'
  | 'BANK_ADMIN'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'LOAN_OFFICER'
  | 'PAWN_OFFICER'
  | 'STAFF'
  | 'MEMBER';

export interface Organization {
  id: string;
  name: string;
  code: string;
  address?: string;
  telephone?: string;
  email?: string;
  registration_number?: string;
  member_prefix: string;
  savings_prefix: string;
  loan_prefix: string;
  pawn_prefix: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  member_id?: string;
  created_at: string;
}

export interface Member {
  id: string;
  organization_id: string;
  member_number: string; // e.g. MEM-000001
  first_name: string;
  last_name: string;
  nic: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  occupation?: string;
  employer?: string;
  nominee?: string;
  member_type?: 'MEMBER' | 'NON_MEMBER';
  non_member_type?: string; // 'MINOR' | 'INSTITUTION' | custom string for OTHER
  membership_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  membership_date: string;
  created_at: string;
}

export interface SavingsAccount {
  id: string;
  organization_id: string;
  account_number: string; // e.g. SAV-000001
  member_id?: string; // Optional per Rule 1: non-members can have savings
  account_type: 'REGULAR' | 'SENIOR' | 'CHILDREN' | 'FIXED' | 'JOINT';
  customer_name: string;
  customer_nic: string;
  balance: number;
  interest_rate: number;
  status: 'ACTIVE' | 'DORMANT' | 'CLOSED';
  created_at: string;
}

export type TransactionType = 
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'LOAN_INTEREST'
  | 'PAWN_PAYMENT'
  | 'PAWN_REDEMPTION'
  | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  organization_id: string;
  transaction_number: string; // e.g. TXN-000001
  account_id?: string;
  member_id?: string;
  transaction_type: TransactionType;
  amount: number;
  transaction_date: string;
  reference_number: string;
  description: string;
  created_by: string;
  created_at: string;
}

export type LoanStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Loan {
  id: string;
  organization_id: string;
  loan_number: string; // e.g. LON-000001
  member_id: string;
  loan_type: 'AGRICULTURAL' | 'HOUSING' | 'BUSINESS' | 'EMERGENCY' | 'CONSUMER';
  original_amount: number;
  interest_rate: number;
  total_payable: number;
  paid_amount: number;
  outstanding_amount: number;
  duration_months: number;
  installment_frequency: 'MONTHLY' | 'WEEKLY';
  start_date: string;
  due_date: string;
  guarantor_name?: string;
  guarantor_nic?: string;
  guarantor2_name?: string;
  guarantor2_nic?: string;
  purpose?: string;
  status: LoanStatus;
  created_at: string;
}

export type PawnStatus = 
  | 'ACTIVE'
  | 'OVERDUE'
  | 'REDEEMED'
  | 'RELEASED'
  | 'FORFEITED'
  | 'CANCELLED';

export interface PawnRecord {
  id: string;
  organization_id: string;
  pawn_number: string; // e.g. PWN-000001
  member_id: string;
  item_description: string;
  category: 'GOLD_22K' | 'GOLD_24K' | 'JEWELRY' | 'OTHER';
  weight_grams: number;
  condition: string;
  valuation_amount: number;
  loan_amount: number;
  interest_rate: number;
  duration_months?: number; // Redeem period in months
  start_date: string;
  due_date: string;
  status: PawnStatus;
  storage_location: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_email: string;
  action: string;
  target_id?: string;
  target_type: 'MEMBER' | 'SAVINGS' | 'LOAN' | 'PAWN' | 'TRANSACTION' | 'USER';
  details: string;
  created_at: string;
}
