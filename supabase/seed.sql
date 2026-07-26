-- ══════════════════════════════════════════════════════════════
-- Seed Data for Development (Matching React Store Defaults)
-- ══════════════════════════════════════════════════════════════

-- 1. Organizations
INSERT INTO public.organizations (id, name, code, address, telephone, email, registration_number)
VALUES ('org-1', 'Kattankudy MPCS Limited', 'KMPCS', 'Main Street, Kattankudy', '065-2245678', 'info@kattankudympcs.lk', 'COOP/EE/1972/04')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Profiles
INSERT INTO public.profiles (id, organization_id, email, full_name, role)
VALUES 
('prof-1', 'org-1', 'admin@kattankudympcs.lk', 'Master Admin', 'SUPER_ADMIN'),
('prof-2', 'org-1', 'manager@kattankudympcs.lk', 'Bank Manager', 'MANAGER'),
('prof-3', 'org-1', 'cashier@kattankudympcs.lk', 'Senior Cashier', 'STAFF')
ON CONFLICT (id) DO NOTHING;

-- 3. Members (Including Regular Cooperative Members and Non-Member Customers)
INSERT INTO public.members (id, organization_id, member_number, first_name, last_name, nic, phone, email, address, city, occupation, employer, nominee, member_type, non_member_type, membership_status, membership_date, created_at)
VALUES 
('mem-1', 'org-1', 'MEM-000001', 'Ahamed', 'Rifke', '883451234V', '077-2345678', 'rifke@kattankudympcs.lk', '124 Main Street, Divisi 04', 'Kattankudy', 'Merchant', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2023-01-15', '2023-01-15T08:30:00Z'),
('mem-2', 'org-1', 'MEM-000002', 'Fathima', 'Zahra', '925671234V', '071-8765432', 'zahra.f@gmail.com', '45 Mosque Road, Divisi 02', 'Kattankudy', 'Teacher', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2023-03-20', '2023-03-20T10:15:00Z'),
('mem-3', 'org-1', 'MEM-000003', 'Mohamed', 'Faiz', '791234567V', '076-5432109', NULL, '89 Beach Road, Divisi 06', 'Kattankudy', 'Fisheries Contractor', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2022-11-10', '2022-11-10T14:20:00Z'),
('mem-4', 'org-1', 'CUS-000004', 'Abdul', 'Kalam', '852345678V', '075-1122334', NULL, '12 Market Lane, Divisi 01', 'Kattankudy', 'Hardware Store Owner', NULL, NULL, 'NON_MEMBER', 'INSTITUTION', 'ACTIVE', '2021-08-05', '2021-08-05T09:00:00Z'),
('mem-5', 'org-1', 'MEM-000005', 'Noor', 'Jahan', '956781234V', '077-9988776', NULL, '34 School Lane, Divisi 03', 'Kattankudy', 'Nurse', NULL, NULL, 'MEMBER', NULL, 'ACTIVE', '2024-02-12', '2024-02-12T11:45:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. Savings Accounts
INSERT INTO public.savings_accounts (id, organization_id, account_number, member_id, account_type, customer_name, customer_nic, balance, interest_rate, status, created_at)
VALUES 
('sav-1', 'org-1', 'SAV-000001', 'mem-1', 'REGULAR', 'Ahamed Rifke', '883451234V', 145000.50, 6.5, 'ACTIVE', '2023-01-15T08:35:00Z'),
('sav-2', 'org-1', 'SAV-000002', 'mem-2', 'SENIOR', 'Fathima Zahra', '925671234V', 320500.00, 7.5, 'ACTIVE', '2023-03-20T10:20:00Z'),
('sav-3', 'org-1', 'SAV-000003', 'mem-3', 'REGULAR', 'Mohamed Faiz', '791234567V', 89000.00, 6.5, 'ACTIVE', '2022-11-10T14:25:00Z'),
('sav-4', 'org-1', 'SAV-000004', NULL, 'CHILDREN', 'Zeyd Ahamed (Minor)', '883451234V-C', 55000.00, 8.0, 'ACTIVE', '2024-01-05T09:15:00Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Loans (With Dual Guarantors)
INSERT INTO public.loans (id, organization_id, loan_number, member_id, loan_type, original_amount, interest_rate, total_payable, paid_amount, outstanding_amount, duration_months, installment_frequency, start_date, due_date, guarantor_name, guarantor_nic, guarantor2_name, guarantor2_nic, purpose, status, created_at)
VALUES 
('lon-1', 'org-1', 'LON-000001', 'mem-1', 'BUSINESS', 500000, 12.5, 562500, 250000, 312500, 24, 'MONTHLY', '2023-06-01', '2025-06-01', 'Mohamed Faiz', '791234567V', 'Zeyd Ahamed', '991234567V', 'Shop inventory expansion', 'ACTIVE', '2023-06-01T10:00:00Z'),
('lon-2', 'org-1', 'LON-000002', 'mem-3', 'AGRICULTURAL', 300000, 10.0, 330000, 330000, 0, 12, 'MONTHLY', '2022-12-01', '2023-12-01', 'Fathima Zahra', '925671234V', 'Noor Jahan', '956781234V', 'Boat engine repair', 'COMPLETED', '2022-12-01T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 6. Pawn Records
INSERT INTO public.pawn_records (id, organization_id, pawn_number, member_id, item_description, category, weight_grams, condition, valuation_amount, loan_amount, interest_rate, duration_months, start_date, due_date, status, storage_location, notes, created_at)
VALUES 
('pwn-1', 'org-1', 'PWN-000001', 'mem-2', '22K Gold Bangle Set (2 pairs)', 'GOLD_22K', 32.5, 'Excellent, hallmarked', 650000, 450000, 14.0, 12, '2024-03-01', '2025-03-01', 'ACTIVE', 'Safe 02 - Drawer B', 'Verified by Appraiser S. Rahman', '2024-03-01T15:30:00Z'),
('pwn-2', 'org-1', 'PWN-000002', 'mem-5', '24K Gold Chain with Pendant', 'GOLD_24K', 18.2, 'Mint condition', 400000, 280000, 13.5, 12, '2024-04-10', '2025-04-10', 'ACTIVE', 'Safe 01 - Drawer A', NULL, '2024-04-10T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 7. Transactions
INSERT INTO public.transactions (id, organization_id, transaction_number, account_id, member_id, transaction_type, amount, transaction_date, reference_number, description, created_by, created_at)
VALUES 
('txn-1', 'org-1', 'TXN-000001', 'sav-1', 'mem-1', 'DEPOSIT', 25000, '2026-07-26T09:15:00Z', 'DEP-10029', 'Cash deposit at counter', 'Staff Admin (M. Nizar)', '2026-07-26T09:15:00Z'),
('txn-2', 'org-1', 'TXN-000002', 'sav-2', 'mem-2', 'WITHDRAWAL', 15000, '2026-07-26T10:30:00Z', 'WTH-8832', 'Counter cash withdrawal', 'Staff Admin (M. Nizar)', '2026-07-26T10:30:00Z'),
('txn-3', 'org-1', 'TXN-000003', 'sav-1', 'mem-1', 'LOAN_REPAYMENT', 25000, '2026-07-26T11:00:00Z', 'LRP-4451', 'Monthly installment for LON-000001', 'Staff Admin (M. Nizar)', '2026-07-26T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 8. Audit Logs
INSERT INTO public.audit_logs (id, organization_id, user_email, action, target_id, target_type, details, created_at)
VALUES 
('aud-1', 'org-1', 'admin@kattankudympcs.lk', 'RECORD_DEPOSIT', 'SAV-000001', 'TRANSACTION', 'Recorded cash deposit of Rs. 25,000.00 for account SAV-000001', '2026-07-26T09:15:00Z'),
('aud-2', 'org-1', 'admin@kattankudympcs.lk', 'RECORD_WITHDRAWAL', 'SAV-000002', 'TRANSACTION', 'Recorded withdrawal of Rs. 15,000.00 for account SAV-000002', '2026-07-26T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
