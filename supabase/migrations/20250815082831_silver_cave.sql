/*
  # Create policies table for IVANS data

  1. New Tables
    - `policies`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `policy_type` (text)
      - `company` (text)
      - `policy_number` (text)
      - `effective_date` (date)
      - `expiration_date` (date)
      - `premium` (numeric)
      - `pfm_level` (text)
      - `policy_forms` (text)
      - `raw_data` (jsonb) - stores original parsed data
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `policies` table
    - Add policies for authenticated users to manage their own policies
*/

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  policy_type text,
  company text,
  policy_number text,
  effective_date date,
  expiration_date date,
  premium numeric,
  pfm_level text,
  policy_forms text,
  raw_data jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own policies"
  ON policies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_policies_updated_at'
  ) THEN
    CREATE TRIGGER update_policies_updated_at
      BEFORE UPDATE ON policies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;