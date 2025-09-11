-- FORCE DISABLE RLS COMPLETELY
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'policy_documents';

-- Step 2: Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'policy_documents';

-- Step 3: Drop ALL policies (including any we might have missed)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'policy_documents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON policy_documents';
    END LOOP;
END $$;

-- Step 4: Disable RLS completely
ALTER TABLE policy_documents DISABLE ROW LEVEL SECURITY;

-- Step 5: Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'policy_documents';

-- Step 6: Verify no policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'policy_documents';

-- Step 7: Test insert with a dummy contact ID
-- First, let's create a dummy contact for testing
INSERT INTO contacts (id, first_name, last_name, email, created_by)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test',
    'Contact',
    'test@example.com',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Step 8: Test policy document insert
INSERT INTO policy_documents (contact_id, file_name, file_url, uploaded_by)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test-document.txt',
    'https://example.com/test-document.txt',
    '11111111-1111-1111-1111-111111111111'
);

-- Step 9: Verify the insert worked
SELECT * FROM policy_documents WHERE file_name = 'test-document.txt';

-- Step 10: Clean up test data
DELETE FROM policy_documents WHERE file_name = 'test-document.txt';
DELETE FROM contacts WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT 'RLS completely disabled and tested successfully' as status;
