-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  visibility text NOT NULL DEFAULT 'all employees',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_action_item boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at triggers
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phone_calls_updated_at
  BEFORE UPDATE ON phone_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();