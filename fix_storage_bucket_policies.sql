-- Fix storage bucket RLS policies for policy-documents
-- Run this in your Supabase SQL Editor

-- Step 1: Check current storage bucket policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%policy-documents%';

-- Step 2: Drop ALL existing storage policies for policy-documents bucket
DROP POLICY IF EXISTS "Authenticated users can upload policy documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view policy documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own policy documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own policy documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on policy-documents bucket" ON storage.objects;

-- Step 3: Create very permissive storage policies
CREATE POLICY "Allow all operations on policy-documents bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'policy-documents')
  WITH CHECK (bucket_id = 'policy-documents');

-- Step 4: Also create a policy for public access (if needed)
CREATE POLICY "Allow public access to policy-documents bucket"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'policy-documents')
  WITH CHECK (bucket_id = 'policy-documents');

-- Step 5: Verify the bucket exists and is configured correctly
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'policy-documents';

-- Step 6: If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'policy-documents', 
  'policy-documents', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/octet-stream'
  ];

-- Step 7: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%policy-documents%';

SELECT 'Storage bucket policies fixed successfully' as status;
