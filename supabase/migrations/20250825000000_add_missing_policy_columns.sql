/*
  # Add missing policy columns based on frontend form data
  
  This migration adds any missing columns to the policies table
  to ensure all frontend form data can be properly stored.
*/

-- Add policy_entry column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'policy_entry'
  ) THEN
    ALTER TABLE policies ADD COLUMN policy_entry text DEFAULT 'New Business';
  END IF;
END $$;

-- Add source column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'source'
  ) THEN
    ALTER TABLE policies ADD COLUMN source text;
  END IF;
END $$;

-- Add sub_source column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'sub_source'
  ) THEN
    ALTER TABLE policies ADD COLUMN sub_source text;
  END IF;
END $$;

-- Add policy_agent_of_record column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'policy_agent_of_record'
  ) THEN
    ALTER TABLE policies ADD COLUMN policy_agent_of_record text;
  END IF;
END $$;

-- Add policy_csr column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'policy_csr'
  ) THEN
    ALTER TABLE policies ADD COLUMN policy_csr text;
  END IF;
END $$;

-- Add prior_policy_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'prior_policy_number'
  ) THEN
    ALTER TABLE policies ADD COLUMN prior_policy_number text;
  END IF;
END $$;

-- Add payment_due_day column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'payment_due_day'
  ) THEN
    ALTER TABLE policies ADD COLUMN payment_due_day integer;
  END IF;
END $$;

-- Add commission_split column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'commission_split'
  ) THEN
    ALTER TABLE policies ADD COLUMN commission_split text DEFAULT '100.00%';
  END IF;
END $$;

-- Add product column if it doesn't exist (as backup for policy_type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'product'
  ) THEN
    ALTER TABLE policies ADD COLUMN product text;
  END IF;
END $$;

-- Add payment_plan column if it doesn't exist (as backup for pfm_level)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'payment_plan'
  ) THEN
    ALTER TABLE policies ADD COLUMN payment_plan text;
  END IF;
END $$;

-- Add memo column if it doesn't exist (as backup for policy_forms)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'memo'
  ) THEN
    ALTER TABLE policies ADD COLUMN memo text;
  END IF;
END $$;

-- Add eff_date column if it doesn't exist (as backup for effective_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'eff_date'
  ) THEN
    ALTER TABLE policies ADD COLUMN eff_date date;
  END IF;
END $$;

-- Add exp_date column if it doesn't exist (as backup for expiration_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'exp_date'
  ) THEN
    ALTER TABLE policies ADD COLUMN exp_date date;
  END IF;
END $$;

-- Add pure_premium column if it doesn't exist (as backup for premium)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'pure_premium'
  ) THEN
    ALTER TABLE policies ADD COLUMN pure_premium numeric;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_policy_entry ON policies(policy_entry);
CREATE INDEX IF NOT EXISTS idx_policies_source ON policies(source);
CREATE INDEX IF NOT EXISTS idx_policies_policy_agent ON policies(policy_agent_of_record);
CREATE INDEX IF NOT EXISTS idx_policies_policy_csr ON policies(policy_csr);
