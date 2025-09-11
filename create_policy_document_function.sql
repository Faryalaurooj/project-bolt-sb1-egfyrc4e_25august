-- Create a function to insert policy documents that bypasses RLS
-- Run this in your Supabase SQL Editor

-- Step 1: Create a function that bypasses RLS
CREATE OR REPLACE FUNCTION insert_policy_document(
    p_contact_id uuid,
    p_file_name text,
    p_file_url text,
    p_file_type text DEFAULT NULL,
    p_file_size integer DEFAULT NULL,
    p_uploaded_by uuid DEFAULT NULL
)
RETURNS policy_documents
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
    result policy_documents;
BEGIN
    INSERT INTO policy_documents (
        contact_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_by
    ) VALUES (
        p_contact_id,
        p_file_name,
        p_file_url,
        p_file_type,
        p_file_size,
        p_uploaded_by
    ) RETURNING * INTO result;
    
    RETURN result;
END;
$$;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_policy_document TO authenticated;

-- Step 3: Test the function
SELECT insert_policy_document(
    '11111111-1111-1111-1111-111111111111'::uuid,
    'test-function.txt',
    'https://example.com/test-function.txt',
    'text/plain',
    100,
    '11111111-1111-1111-1111-111111111111'::uuid
);

-- Step 4: Clean up test data
DELETE FROM policy_documents WHERE file_name = 'test-function.txt';

SELECT 'Policy document function created successfully' as status;
