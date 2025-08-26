/*
  # Add comprehensive personal details to contacts table

  1. New Columns Added
    - Personal Information: date_of_birth, cell_number, home_phone_number, work_number, language, ssn_tax_id
    - Demographics: marital_status, gender
    - Business Details: customer_type, account_type, status, customer_sub_status
    - Management: customer_agent_of_record, customer_csr, keyed_by, office, source, date_added

  2. Data Types
    - All text fields for flexibility
    - Date fields for birth date and date added
    - Default values where appropriate

  3. Security
    - No RLS changes needed as contacts table already has proper policies
*/

-- Add personal information fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE contacts ADD COLUMN date_of_birth date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'cell_number'
  ) THEN
    ALTER TABLE contacts ADD COLUMN cell_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'home_phone_number'
  ) THEN
    ALTER TABLE contacts ADD COLUMN home_phone_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'work_number'
  ) THEN
    ALTER TABLE contacts ADD COLUMN work_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'language'
  ) THEN
    ALTER TABLE contacts ADD COLUMN language text DEFAULT 'English';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ssn_tax_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ssn_tax_id text;
  END IF;
END $$;

-- Add demographic fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'marital_status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN marital_status text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'gender'
  ) THEN
    ALTER TABLE contacts ADD COLUMN gender text;
  END IF;
END $$;

-- Add business/customer fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'customer_type'
  ) THEN
    ALTER TABLE contacts ADD COLUMN customer_type text DEFAULT 'Individual';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE contacts ADD COLUMN account_type text DEFAULT 'Standard';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'contact_status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN contact_status text DEFAULT 'Active';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'customer_sub_status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN customer_sub_status text;
  END IF;
END $$;

-- Add management fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'customer_agent_of_record'
  ) THEN
    ALTER TABLE contacts ADD COLUMN customer_agent_of_record text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'customer_csr'
  ) THEN
    ALTER TABLE contacts ADD COLUMN customer_csr text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'keyed_by'
  ) THEN
    ALTER TABLE contacts ADD COLUMN keyed_by text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'office'
  ) THEN
    ALTER TABLE contacts ADD COLUMN office text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'source'
  ) THEN
    ALTER TABLE contacts ADD COLUMN source text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date_added'
  ) THEN
    ALTER TABLE contacts ADD COLUMN date_added timestamptz DEFAULT now();
  END IF;
END $$;