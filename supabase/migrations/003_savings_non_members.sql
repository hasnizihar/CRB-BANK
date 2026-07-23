-- ══════════════════════════════════════════════════════════════
-- Migration 003: Support Non-Member Savings Accounts
-- ══════════════════════════════════════════════════════════════

-- 1. Upgrade the `customers` table to store full details for non-members, minors, and institutions.
-- First, add the new columns
ALTER TABLE customers 
ADD COLUMN full_name TEXT,
ADD COLUMN nic TEXT,
ADD COLUMN address TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN customer_type TEXT DEFAULT 'normal' CHECK (customer_type IN ('minor', 'institution', 'normal'));

-- Since full_name is required for a customer, we update any existing rows (if any) to have a fallback name, then make it NOT NULL
UPDATE customers SET full_name = guardian_name WHERE full_name IS NULL;
ALTER TABLE customers ALTER COLUMN full_name SET NOT NULL;

-- 2. Modify `savings_accounts` table
-- Drop the existing CHECK constraint on account_type (if it was an enum check)
-- Actually, in 001, account_type had no CHECK constraint, just a DEFAULT 'savings'
-- We will change the DEFAULT and add a CHECK constraint
ALTER TABLE savings_accounts 
ALTER COLUMN account_type SET DEFAULT 'normal';

-- Drop the NOT NULL constraint on member_id so an account can belong to a customer instead
ALTER TABLE savings_accounts 
ALTER COLUMN member_id DROP NOT NULL;

-- Add customer_id reference
ALTER TABLE savings_accounts 
ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT;

-- Add a CHECK constraint to ensure an account belongs to EITHER a member OR a customer, but not both or neither
ALTER TABLE savings_accounts
ADD CONSTRAINT chk_account_owner 
CHECK (
  (member_id IS NOT NULL AND customer_id IS NULL) OR 
  (member_id IS NULL AND customer_id IS NOT NULL)
);

-- Add a CHECK constraint for account_type
ALTER TABLE savings_accounts
ADD CONSTRAINT chk_account_type
CHECK (account_type IN ('normal', 'minor', 'institution'));

-- Update any existing rows to match the new constraints
UPDATE savings_accounts SET account_type = 'normal' WHERE account_type = 'savings';
