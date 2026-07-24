-- ══════════════════════════════════════════════════════════════
-- Seed Data for Development
-- ══════════════════════════════════════════════════════════════

-- NOTE: Ensure this is only run in development environments.

-- 1. Create Mock Users (Authentication)
-- Passwords are set to 'password123'
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@crb.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"System Admin"}', now(), now(), 'authenticated', false),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'manager@crb.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Bank Manager"}', now(), now(), 'authenticated', false),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'cashier@crb.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Senior Cashier"}', now(), now(), 'authenticated', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
INSERT INTO public.profiles (id, name, username, role, status)
VALUES
('10000000-0000-0000-0000-000000000001', 'System Admin', 'admin', 'administrator', 'active'),
('10000000-0000-0000-0000-000000000002', 'Bank Manager', 'manager', 'bank_manager', 'active'),
('10000000-0000-0000-0000-000000000003', 'Senior Cashier', 'cashier', 'cashier', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Members
INSERT INTO public.members (id, member_no, nic, full_name, address, phone, gender, occupation, dob, join_date, status)
VALUES
('20000000-0000-0000-0000-000000000001', 'SEED-M001', '999123456V', 'Mohamed Rizwan', '123 Main St, Kattankudy', '0771234567', 'male', 'Businessman', '1990-05-15', '2023-01-10', 'active'),
('20000000-0000-0000-0000-000000000002', 'SEED-M002', '999543210V', 'Fathima Nuzha', '45 Beach Rd, Kattankudy', '0759876543', 'female', 'Teacher', '1988-11-20', '2023-02-14', 'active'),
('20000000-0000-0000-0000-000000000003', 'SEED-M003', '999112223V', 'Abdul Rahman', '78 Grand Mosque Rd, Kattankudy', '0714445555', 'male', 'Farmer', '1995-03-10', '2023-03-05', 'active'),
('20000000-0000-0000-0000-000000000004', 'SEED-M004', '999678901V', 'Ayesha Siddiqa', '12 Lake View Rd, Kattankudy', '0763332222', 'female', 'Housewife', '1992-08-25', '2023-04-12', 'inactive'),
('20000000-0000-0000-0000-000000000005', 'SEED-M005', '999334445V', 'Mohamed Hasan', '55 Market St, Kattankudy', '0721118888', 'male', 'Shop Owner', '1985-12-05', '2023-05-20', 'active')
ON CONFLICT (member_no) DO NOTHING;

-- 4. Create Savings Accounts
INSERT INTO public.savings_accounts (id, member_id, account_no, passbook_no, account_type, opening_balance, current_balance, interest_rate, status)
VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'SEED-SA001', 'SEED-PB001', 'savings', 5000, 25000, 4.5, 'active'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'SEED-SA002', 'SEED-PB002', 'savings', 10000, 45000, 4.5, 'active'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'SEED-SA003', 'SEED-PB003', 'savings', 2000, 15000, 4.5, 'active'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'SEED-SA004', 'SEED-PB004', 'savings', 15000, 105000, 4.5, 'active')
ON CONFLICT (account_no) DO NOTHING;

-- 5. Create Loans
INSERT INTO public.loans (id, member_id, loan_category, requested_amount, approved_amount, interest_rate, repayment_period, monthly_installment, guarantor, purpose, status, start_date)
VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'livelihood', 100000, 100000, 12.0, 12, 8884.88, 'SEED-M005', 'Business Expansion', 'active', '2023-06-01'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'consumption', 50000, 50000, 15.0, 6, 8701.59, 'SEED-M001', 'Medical Expenses', 'completed', '2023-02-15'),
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'small_industrial', 500000, 450000, 10.5, 24, 20875.00, 'SEED-M001', 'Shop Renovation', 'active', '2023-08-10')
ON CONFLICT (id) DO NOTHING;
