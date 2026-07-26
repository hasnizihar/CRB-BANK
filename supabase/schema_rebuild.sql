-- ══════════════════════════════════════════════════════════════
-- Kattankudy MPCS Limited — Cooperative Rural Bank (CRBMS)
-- ONE-CLICK MASTER DATABASE SCHEMA REBUILD & SEED SCRIPT
-- Run this in your Supabase Dashboard -> SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. DROP ALL PREVIOUS TABLES, VIEWS, TRIGGERS & FUNCTIONS SAFELY
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'pawns' AND schemaname = 'public') THEN
    DROP VIEW public.pawns CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'audit_log' AND schemaname = 'public') THEN
    DROP VIEW public.audit_log CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.cash_book CASCADE;
DROP TABLE IF EXISTS public.loan_payments CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.savings_accounts CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.pawn_records CASCADE;
DROP TABLE IF EXISTS public.pawns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: organizations
CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT 'org-1',
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  telephone TEXT,
  email TEXT,
  registration_number TEXT,
  member_prefix TEXT NOT NULL DEFAULT 'MEM-',
  savings_prefix TEXT NOT NULL DEFAULT 'SAV-',
  loan_prefix TEXT NOT NULL DEFAULT 'LON-',
  pawn_prefix TEXT NOT NULL DEFAULT 'PWN-',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREATE TABLE: profiles
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'BANK_ADMIN', 'MANAGER', 'ACCOUNTANT', 'LOAN_OFFICER', 'PAWN_OFFICER', 'STAFF', 'MEMBER')),
  member_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE TABLE: members (Supports Regular Cooperative Members and Non-Member Customers/Minors/Institutions)
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  member_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nic TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  occupation TEXT,
  employer TEXT,
  nominee TEXT,
  member_type TEXT NOT NULL DEFAULT 'MEMBER' CHECK (member_type IN ('MEMBER', 'NON_MEMBER')),
  non_member_type TEXT, -- e.g., 'MINOR', 'INSTITUTION', or custom
  membership_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (membership_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  membership_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE TABLE: savings_accounts
CREATE TABLE savings_accounts (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  account_number TEXT UNIQUE NOT NULL,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('REGULAR', 'SENIOR', 'CHILDREN', 'FIXED', 'JOINT')),
  customer_name TEXT NOT NULL,
  customer_nic TEXT NOT NULL,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DORMANT', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CREATE TABLE: loans (With Dual Guarantor Verification Architecture)
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  loan_number TEXT UNIQUE NOT NULL,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('AGRICULTURAL', 'HOUSING', 'BUSINESS', 'EMERGENCY', 'CONSUMER')),
  original_amount NUMERIC(15,2) NOT NULL CHECK (original_amount > 0),
  interest_rate NUMERIC(5,2) NOT NULL,
  total_payable NUMERIC(15,2) NOT NULL,
  paid_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  outstanding_amount NUMERIC(15,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  installment_frequency TEXT NOT NULL CHECK (installment_frequency IN ('MONTHLY', 'WEEKLY')),
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  guarantor_name TEXT,
  guarantor_nic TEXT,
  guarantor2_name TEXT,
  guarantor2_nic TEXT,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'PARTIALLY_PAID', 'OVERDUE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CREATE TABLE: pawn_records (With Duration & Redemption Scheduling)
CREATE TABLE pawn_records (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  pawn_number TEXT UNIQUE NOT NULL,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  item_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GOLD_22K', 'GOLD_24K', 'JEWELRY', 'OTHER')),
  weight_grams NUMERIC(10,2) NOT NULL CHECK (weight_grams > 0),
  condition TEXT NOT NULL,
  valuation_amount NUMERIC(15,2) NOT NULL,
  loan_amount NUMERIC(15,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  duration_months INTEGER DEFAULT 12,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OVERDUE', 'REDEEMED', 'RELEASED', 'FORFEITED', 'CANCELLED')),
  storage_location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward compatibility view for any legacy query expecting 'pawns' table name
CREATE OR REPLACE VIEW pawns AS SELECT * FROM pawn_records;

-- 8. CREATE TABLE: transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  transaction_number TEXT UNIQUE NOT NULL,
  account_id TEXT REFERENCES savings_accounts(id) ON DELETE SET NULL,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'LOAN_INTEREST', 'PAWN_PAYMENT', 'PAWN_REDEMPTION', 'ADJUSTMENT')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  transaction_date TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CREATE TABLE: audit_logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE DEFAULT 'org-1',
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('MEMBER', 'SAVINGS', 'LOAN', 'PAWN', 'TRANSACTION', 'USER')),
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward compatibility view for any query expecting 'audit_log' table name
CREATE OR REPLACE VIEW audit_log AS SELECT * FROM audit_logs;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pawn_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_savings_accounts" ON savings_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_loans" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_pawn_records" ON pawn_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 11. SEED DATA (Matching React Store Defaults)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.organizations (id, name, code, address, telephone, email, registration_number)
VALUES ('org-1', 'Kattankudy MPCS Limited', 'KMPCS', 'Main Street, Kattankudy', '065-2245678', 'info@kattankudympcs.lk', 'COOP/EE/1972/04')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.profiles (id, organization_id, email, full_name, role)
VALUES 
('prof-1', 'org-1', 'admin@kattankudympcs.lk', 'Master Admin', 'SUPER_ADMIN'),
('prof-2', 'org-1', 'manager@kattankudympcs.lk', 'Bank Manager', 'MANAGER'),
('prof-3', 'org-1', 'cashier@kattankudympcs.lk', 'Senior Cashier', 'STAFF')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.members (id, organization_id, member_number, first_name, last_name, nic, phone, email, address, city, occupation, employer, nominee, member_type, non_member_type, membership_status, membership_date, created_at)
VALUES 
('mem-1', 'org-1', 'MEM-000001', 'Ahamed', 'Rifke', '883451234V', '077-2345678', 'rifke@kattankudympcs.lk', '124 Main Street, Divisi 04', 'Kattankudy', 'Merchant', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2023-01-15', '2023-01-15T08:30:00Z'),
('mem-2', 'org-1', 'MEM-000002', 'Fathima', 'Zahra', '925671234V', '071-8765432', 'zahra.f@gmail.com', '45 Mosque Road, Divisi 02', 'Kattankudy', 'Teacher', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2023-03-20', '2023-03-20T10:15:00Z'),
('mem-3', 'org-1', 'MEM-000003', 'Mohamed', 'Faiz', '791234567V', '076-5432109', NULL, '89 Beach Road, Divisi 06', 'Kattankudy', 'Fisheries Contractor', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2022-11-10', '2022-11-10T14:20:00Z'),
('mem-4', 'org-1', 'CUS-000004', 'Abdul', 'Kalam', '852345678V', '075-1122334', NULL, '12 Market Lane, Divisi 01', 'Kattankudy', 'Hardware Store Owner', NULL, NULL, 'NON_MEMBER', 'INSTITUTION', 'ACTIVE', '2021-08-05', '2021-08-05T09:00:00Z'),
('mem-5', 'org-1', 'MEM-000005', 'Noor', 'Jahan', '956781234V', '077-9988776', NULL, '34 School Lane, Divisi 03', 'Kattankudy', 'Nurse', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2024-02-12', '2024-02-12T11:45:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.savings_accounts (id, organization_id, account_number, member_id, account_type, customer_name, customer_nic, balance, interest_rate, status, created_at)
VALUES 
('sav-1', 'org-1', 'SAV-000001', 'mem-1', 'REGULAR', 'Ahamed Rifke', '883451234V', 145000.50, 6.5, 'ACTIVE', '2023-01-15T08:35:00Z'),
('sav-2', 'org-1', 'SAV-000002', 'mem-2', 'SENIOR', 'Fathima Zahra', '925671234V', 320500.00, 7.5, 'ACTIVE', '2023-03-20T10:20:00Z'),
('sav-3', 'org-1', 'SAV-000003', 'mem-3', 'REGULAR', 'Mohamed Faiz', '791234567V', 89000.00, 6.5, 'ACTIVE', '2022-11-10T14:25:00Z'),
('sav-4', 'org-1', 'SAV-000004', NULL, 'CHILDREN', 'Zeyd Ahamed (Minor)', '883451234V-C', 55000.00, 8.0, 'ACTIVE', '2024-01-05T09:15:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.loans (id, organization_id, loan_number, member_id, loan_type, original_amount, interest_rate, total_payable, paid_amount, outstanding_amount, duration_months, installment_frequency, start_date, due_date, guarantor_name, guarantor_nic, guarantor2_name, guarantor2_nic, purpose, status, created_at)
VALUES 
('lon-1', 'org-1', 'LON-000001', 'mem-1', 'BUSINESS', 500000, 12.5, 562500, 250000, 312500, 24, 'MONTHLY', '2023-06-01', '2025-06-01', 'Mohamed Faiz', '791234567V', 'Zeyd Ahamed', '991234567V', 'Shop inventory expansion', 'ACTIVE', '2023-06-01T10:00:00Z'),
('lon-2', 'org-1', 'LON-000002', 'mem-3', 'AGRICULTURAL', 300000, 10.0, 330000, 330000, 0, 12, 'MONTHLY', '2022-12-01', '2023-12-01', 'Fathima Zahra', '925671234V', 'Noor Jahan', '956781234V', 'Boat engine repair', 'COMPLETED', '2022-12-01T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pawn_records (id, organization_id, pawn_number, member_id, item_description, category, weight_grams, condition, valuation_amount, loan_amount, interest_rate, duration_months, start_date, due_date, status, storage_location, notes, created_at)
VALUES 
('pwn-1', 'org-1', 'PWN-000001', 'mem-2', '22K Gold Bangle Set (2 pairs)', 'GOLD_22K', 32.5, 'Excellent, hallmarked', 650000, 450000, 14.0, 12, '2024-03-01', '2025-03-01', 'ACTIVE', 'Safe 02 - Drawer B', 'Verified by Appraiser S. Rahman', '2024-03-01T15:30:00Z'),
('pwn-2', 'org-1', 'PWN-000002', 'mem-5', '24K Gold Chain with Pendant', 'GOLD_24K', 18.2, 'Mint condition', 400000, 280000, 13.5, 12, '2024-04-10', '2025-04-10', 'ACTIVE', 'Safe 01 - Drawer A', NULL, '2024-04-10T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, organization_id, transaction_number, account_id, member_id, transaction_type, amount, transaction_date, reference_number, description, created_by, created_at)
VALUES 
('txn-1', 'org-1', 'TXN-000001', 'sav-1', 'mem-1', 'DEPOSIT', 25000, '2026-07-26T09:15:00Z', 'DEP-10029', 'Cash deposit at counter', 'Staff Admin (M. Nizar)', '2026-07-26T09:15:00Z'),
('txn-2', 'org-1', 'TXN-000002', 'sav-2', 'mem-2', 'WITHDRAWAL', 15000, '2026-07-26T10:30:00Z', 'WTH-8832', 'Counter cash withdrawal', 'Staff Admin (M. Nizar)', '2026-07-26T10:30:00Z'),
('txn-3', 'org-1', 'TXN-000003', 'sav-1', 'mem-1', 'LOAN_REPAYMENT', 25000, '2026-07-26T11:00:00Z', 'LRP-4451', 'Monthly installment for LON-000001', 'Staff Admin (M. Nizar)', '2026-07-26T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, organization_id, user_email, action, target_id, target_type, details, created_at)
VALUES 
('aud-1', 'org-1', 'admin@kattankudympcs.lk', 'RECORD_DEPOSIT', 'SAV-000001', 'TRANSACTION', 'Recorded cash deposit of Rs. 25,000.00 for account SAV-000001', '2026-07-26T09:15:00Z'),
('aud-2', 'org-1', 'admin@kattankudympcs.lk', 'RECORD_WITHDRAWAL', 'SAV-000002', 'TRANSACTION', 'Recorded withdrawal of Rs. 15,000.00 for account SAV-000002', '2026-07-26T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
