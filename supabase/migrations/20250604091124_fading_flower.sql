-- Create users table if it doesn't exist (usually handled by Supabase Auth, but good for dependencies)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  first_name varchar(255),
  last_name varchar(255),
  role varchar(255) DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL,
  email varchar(255),
  phone varchar(255),
  address varchar(255),
  city varchar(255),
  state varchar(255),
  zip varchar(255),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  visibility text NOT NULL DEFAULT 'all employees',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_action_item boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create phone_calls table
CREATE TABLE IF NOT EXISTS phone_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  visibility text NOT NULL DEFAULT 'all employees',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_action_item boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY; -- Ensure RLS is enabled for users table if not already
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY; -- Ensure RLS is enabled for contacts table if not already

-- Create policies for notes
CREATE POLICY "Users can view notes they have access to"
  ON notes
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'all employees' OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can insert their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for phone_calls
CREATE POLICY "Users can view phone calls they have access to"
  ON phone_calls
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'all employees' OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can insert their own phone calls"
  ON phone_calls
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own phone calls"
  ON phone_calls
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own phone calls"
  ON phone_calls
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for users table (basic, adjust as needed)
CREATE POLICY "Allow authenticated users to view their own user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policies for contacts table (basic, adjust as needed)
CREATE POLICY "Allow authenticated users to view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true); -- Or restrict based on ownership/visibility if applicable

CREATE POLICY "Allow authenticated users to insert contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Or restrict based on ownership/visibility if applicable

CREATE POLICY "Allow authenticated users to update contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (true); -- Or restrict based on ownership/visibility if applicable

CREATE POLICY "Allow authenticated users to delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true); -- Or restrict based on ownership/visibility if applicable
