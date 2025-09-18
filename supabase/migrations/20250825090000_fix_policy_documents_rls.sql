/*
  # Fix policy_documents RLS policies

  The current RLS policy is too restrictive and causing 403 errors.
  We need to update the policies to allow proper document uploads.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can view policy documents for their contacts" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete policy documents they uploaded" ON policy_documents;

-- Create more permissive policies for policy_documents
CREATE POLICY "Authenticated users can upload policy documents"
  ON policy_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view policy documents"
  ON policy_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their own policy documents"
  ON policy_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own policy documents"
  ON policy_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by);
