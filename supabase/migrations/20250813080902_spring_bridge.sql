/*
  # Add Companies and Policy Documents Tables

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `domain` (text)
      - `industry` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip` (text)
      - `phone` (text)
      - `email` (text)
      - `notes` (text)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `contact_companies`
      - `contact_id` (uuid, foreign key to contacts)
      - `company_id` (uuid, foreign key to companies)
      - `relationship_type` (text)
      - `created_at` (timestamp)

    - `policy_documents`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `file_name` (text, required)
      - `file_url` (text, required)
      - `file_type` (text)
      - `file_size` (integer)
      - `uploaded_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  industry text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_companies linking table
CREATE TABLE IF NOT EXISTS contact_companies (
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (contact_id, company_id)
);

-- Create policy_documents table
CREATE TABLE IF NOT EXISTS policy_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contact_companies table
ALTER TABLE contact_companies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on policy_documents table
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for contact_companies table
CREATE POLICY "Users can link contacts to companies"
  ON contact_companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_companies.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view contact-company links"
  ON contact_companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_companies.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete contact-company links"
  ON contact_companies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_companies.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

-- Create policies for policy_documents table
CREATE POLICY "Users can upload policy documents"
  ON policy_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view policy documents for their contacts"
  ON policy_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = policy_documents.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete policy documents they uploaded"
  ON policy_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Create updated_at trigger for companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();