/*
  # Add Contacts Table and Policies

  1. New Tables
    - contacts
      - id (uuid, primary key)
      - first_name (text)
      - last_name (text)
      - email (text)
      - phone (text)
      - address (text)
      - city (text)
      - state (text)
      - zip (text)
      - notes (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - created_by (uuid, references auth.users)

  2. Security
    - Enable RLS on contacts table
    - Add policies for CRUD operations
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();