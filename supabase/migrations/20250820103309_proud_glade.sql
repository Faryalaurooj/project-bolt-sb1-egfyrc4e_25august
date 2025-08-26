/*
  # Add contact relationship to household_members table

  1. Schema Changes
    - Add `contact_id` column to `household_members` table with foreign key to `contacts`
    - Add `first_name`, `last_name`, `relationship`, `date_of_birth`, `email`, `phone`, `notes` columns
    - Add `created_by` column with foreign key to `auth.users`
    - Add `updated_at` column with trigger for automatic updates

  2. Security
    - Enable RLS on `household_members` table
    - Add policies for authenticated users to manage household members for their contacts

  3. Data Integrity
    - Add foreign key constraints to ensure data consistency
    - Add trigger for automatic `updated_at` timestamp updates
*/

-- Add missing columns to household_members table
DO $$
BEGIN
  -- Add contact_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE household_members ADD COLUMN contact_id uuid;
  END IF;

  -- Add first_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE household_members ADD COLUMN first_name text NOT NULL DEFAULT '';
  END IF;

  -- Add last_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE household_members ADD COLUMN last_name text NOT NULL DEFAULT '';
  END IF;

  -- Add relationship column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'relationship'
  ) THEN
    ALTER TABLE household_members ADD COLUMN relationship text NOT NULL DEFAULT '';
  END IF;

  -- Add date_of_birth column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE household_members ADD COLUMN date_of_birth date;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'email'
  ) THEN
    ALTER TABLE household_members ADD COLUMN email text;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'phone'
  ) THEN
    ALTER TABLE household_members ADD COLUMN phone text;
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'notes'
  ) THEN
    ALTER TABLE household_members ADD COLUMN notes text;
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE household_members ADD COLUMN created_by uuid;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_members' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE household_members ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key to contacts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'household_members_contact_id_fkey'
  ) THEN
    ALTER TABLE household_members 
    ADD CONSTRAINT household_members_contact_id_fkey 
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to auth.users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'household_members_created_by_fkey'
  ) THEN
    ALTER TABLE household_members 
    ADD CONSTRAINT household_members_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for household_members
CREATE POLICY "Users can view household members for their contacts"
  ON household_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = household_members.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert household members for their contacts"
  ON household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = household_members.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update household members for their contacts"
  ON household_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = household_members.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete household members for their contacts"
  ON household_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = household_members.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_household_members_updated_at'
  ) THEN
    CREATE TRIGGER update_household_members_updated_at
      BEFORE UPDATE ON household_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;