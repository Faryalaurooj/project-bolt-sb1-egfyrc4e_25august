-- Completely disable RLS on policy_documents table
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'policy_documents';

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can view policy documents for their contacts" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete policy documents they uploaded" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can view policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete their own policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can update their own policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on policy_documents" ON policy_documents;

-- Step 3: Completely disable RLS
ALTER TABLE policy_documents DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'policy_documents';

-- Step 5: Test insert (this should work now)
INSERT INTO policy_documents (contact_id, file_name, file_url, uploaded_by)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- dummy UUID for testing
  'test.txt',
  'https://example.com/test.txt',
  '00000000-0000-0000-0000-000000000000'  -- dummy UUID for testing
);

-- Step 6: Clean up test record
DELETE FROM policy_documents WHERE file_name = 'test.txt';

-- Step 7: Show final status
SELECT 'RLS disabled successfully' as status;
