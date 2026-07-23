-- ══════════════════════════════════════════════════════════════
-- CRB Management System — Initial Database Schema
-- Kattankudy MPCS Limited — Cooperative Rural Bank
-- ══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (linked to Supabase Auth) ──
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'bank_manager', 'cashier', 'loan_officer', 'accountant', 'auditor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Members ──
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_no TEXT UNIQUE NOT NULL,
  nic TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  occupation TEXT,
  dob DATE NOT NULL,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  nominee TEXT,
  photo_url TEXT,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Customers (non-member / minor accounts) ──
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  is_minor BOOLEAN NOT NULL DEFAULT FALSE,
  guardian_name TEXT,
  guardian_nic TEXT,
  birth_cert_no TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Savings Accounts ──
CREATE TABLE savings_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  account_no TEXT UNIQUE NOT NULL,
  passbook_no TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'savings',
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'closed', 'frozen')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Transactions ──
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES savings_accounts(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'interest')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(15,2) NOT NULL,
  officer_id UUID REFERENCES profiles(id),
  receipt_no TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Loans ──
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  loan_category TEXT NOT NULL CHECK (loan_category IN ('livelihood', 'production', 'small_industrial', 'consumption', 'government_servant', 'special')),
  requested_amount NUMERIC(15,2) NOT NULL CHECK (requested_amount > 0),
  approved_amount NUMERIC(15,2),
  interest_rate NUMERIC(5,2) NOT NULL,
  repayment_period INTEGER NOT NULL, -- months
  monthly_installment NUMERIC(15,2),
  guarantor TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Loan Payments ──
CREATE TABLE loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  capital NUMERIC(15,2) NOT NULL,
  interest NUMERIC(15,2) NOT NULL,
  balance_remaining NUMERIC(15,2) NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Cash Book ──
CREATE TABLE cash_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  cash_in NUMERIC(15,2) NOT NULL DEFAULT 0,
  cash_out NUMERIC(15,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Audit Log ──
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notifications ──
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('installment_due', 'loan_overdue', 'birthday', 'inactive_account', 'matured_deposit')),
  member_id UUID REFERENCES members(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  due_date DATE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- Indexes
-- ══════════════════════════════════════════════════════════════

CREATE INDEX idx_members_nic ON members(nic);
CREATE INDEX idx_members_member_no ON members(member_no);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_savings_member_id ON savings_accounts(member_id);
CREATE INDEX idx_savings_account_no ON savings_accounts(account_no);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ══════════════════════════════════════════════════════════════
-- Triggers
-- ══════════════════════════════════════════════════════════════

-- Auto-update `updated_at` columns
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_savings_accounts_updated_at BEFORE UPDATE ON savings_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ── Profiles: Users can read all profiles, only admin can modify ──
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (get_user_role() = 'administrator');
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (get_user_role() = 'administrator' OR id = auth.uid());
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (get_user_role() = 'administrator');

-- ── Members: All staff can view, specific roles can modify ──
CREATE POLICY "members_select" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'bank_manager', 'cashier'));
CREATE POLICY "members_update" ON members FOR UPDATE USING (get_user_role() IN ('administrator', 'bank_manager', 'cashier'));
CREATE POLICY "members_delete" ON members FOR DELETE USING (get_user_role() = 'administrator');

-- ── Savings Accounts: All staff can view, cashier/admin can modify ──
CREATE POLICY "savings_select" ON savings_accounts FOR SELECT USING (true);
CREATE POLICY "savings_insert" ON savings_accounts FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'cashier'));
CREATE POLICY "savings_update" ON savings_accounts FOR UPDATE USING (get_user_role() IN ('administrator', 'cashier'));

-- ── Transactions: All can view, cashier can insert ──
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (true);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'cashier'));

-- ── Loans: All can view, specific roles for specific actions ──
CREATE POLICY "loans_select" ON loans FOR SELECT USING (true);
CREATE POLICY "loans_insert" ON loans FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'loan_officer', 'bank_manager'));
CREATE POLICY "loans_update" ON loans FOR UPDATE USING (get_user_role() IN ('administrator', 'loan_officer', 'bank_manager', 'cashier'));

-- ── Loan Payments: All can view, cashier can insert ──
CREATE POLICY "loan_payments_select" ON loan_payments FOR SELECT USING (true);
CREATE POLICY "loan_payments_insert" ON loan_payments FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'cashier'));

-- ── Cash Book: All can view, cashier/accountant can modify ──
CREATE POLICY "cash_book_select" ON cash_book FOR SELECT USING (true);
CREATE POLICY "cash_book_insert" ON cash_book FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'cashier', 'accountant'));
CREATE POLICY "cash_book_update" ON cash_book FOR UPDATE USING (get_user_role() IN ('administrator', 'cashier', 'accountant'));

-- ── Audit Log: All can view, system inserts ──
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (true);
CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- ── Notifications: All can view, system inserts, users can update (mark as read) ──
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (true);

-- ── Customers: All staff can view, specific roles can modify ──
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (get_user_role() IN ('administrator', 'bank_manager', 'cashier'));
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (get_user_role() IN ('administrator', 'bank_manager', 'cashier'));
