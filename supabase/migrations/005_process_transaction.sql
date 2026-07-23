-- ══════════════════════════════════════════════════════════════
-- Migration 005: Atomic Transaction Processing
-- ══════════════════════════════════════════════════════════════

-- Create a secure function to process deposits and withdrawals atomically.
-- This ensures that balances are never corrupted by simultaneous requests.

CREATE OR REPLACE FUNCTION process_transaction(
  p_account_id UUID,
  p_type TEXT,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
  v_new_balance NUMERIC;
  v_receipt_no TEXT;
  v_txn_id UUID;
  v_officer_id UUID;
  v_result jsonb;
BEGIN
  -- Basic validation
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF p_type NOT IN ('deposit', 'withdrawal') THEN
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;

  -- Get the current authenticated user's profile ID (officer)
  v_officer_id := auth.uid();

  -- Lock the row for update to prevent race conditions
  SELECT * INTO v_account 
  FROM savings_accounts 
  WHERE id = p_account_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  IF v_account.status NOT IN ('active', 'dormant') THEN
    RAISE EXCEPTION 'Cannot process transaction on % account', v_account.status;
  END IF;

  -- Calculate new balance
  IF p_type = 'deposit' THEN
    v_new_balance := v_account.current_balance + p_amount;
  ELSIF p_type = 'withdrawal' THEN
    IF v_account.current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient funds (Current Balance: %)', v_account.current_balance;
    END IF;
    v_new_balance := v_account.current_balance - p_amount;
  END IF;

  -- Generate a unique receipt number based on timestamp and type
  v_receipt_no := UPPER(SUBSTRING(p_type, 1, 3)) || '-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISSMS');

  -- Update account balance
  UPDATE savings_accounts
  SET current_balance = v_new_balance,
      status = 'active', -- any dormant account becomes active upon transaction
      updated_at = NOW()
  WHERE id = p_account_id;

  -- Insert transaction record
  INSERT INTO transactions (
    account_id, type, amount, balance_after, officer_id, receipt_no, description
  ) VALUES (
    p_account_id, p_type, p_amount, v_new_balance, v_officer_id, v_receipt_no, p_description
  ) RETURNING id INTO v_txn_id;

  -- Return the transaction data
  SELECT jsonb_build_object(
    'txn_id', v_txn_id,
    'receipt_no', v_receipt_no,
    'balance_after', v_new_balance
  ) INTO v_result;

  RETURN v_result;
END;
$$;
