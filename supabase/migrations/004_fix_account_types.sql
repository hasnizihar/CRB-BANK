-- ══════════════════════════════════════════════════════════════
-- Migration 004: Fix Account Types
-- ══════════════════════════════════════════════════════════════

-- The previous migration incorrectly set account_type to normal/minor/institution
-- It should be savings/current

ALTER TABLE savings_accounts DROP CONSTRAINT IF EXISTS chk_account_type;

-- Revert any 'normal' accounts back to 'savings' (which was the original default)
UPDATE savings_accounts SET account_type = 'savings' WHERE account_type = 'normal';
UPDATE savings_accounts SET account_type = 'savings' WHERE account_type NOT IN ('savings', 'current');

-- Set default back to savings
ALTER TABLE savings_accounts ALTER COLUMN account_type SET DEFAULT 'savings';

-- Add correct check constraint
ALTER TABLE savings_accounts
ADD CONSTRAINT chk_account_type
CHECK (account_type IN ('savings', 'current'));
