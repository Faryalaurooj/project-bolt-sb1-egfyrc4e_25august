-- Create a very permissive RLS policy for policy_documents
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can view policy documents for their contacts" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete policy documents they uploaded" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can view policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete their own policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can update their own policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on policy_documents" ON policy_documents;

-- Step 2: Create a single, very permissive policy
CREATE POLICY "Allow everything for everyone on policy_documents"
  ON policy_documents
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'policy_documents';

-- Step 4: Test insert
INSERT INTO policy_documents (contact_id, file_name, file_url, uploaded_by)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- dummy UUID for testing
  'test.txt',
  'https://example.com/test.txt',
  '00000000-0000-0000-0000-000000000000'  -- dummy UUID for testing
);

-- Step 5: Clean up test record
DELETE FROM policy_documents WHERE file_name = 'test.txt';

SELECT 'Permissive policy created successfully' as status;
