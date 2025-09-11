-- Fix policy_documents RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's check if the table exists and what policies are currently active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'policy_documents';

-- Drop all existing policies for policy_documents
DROP POLICY IF EXISTS "Users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can view policy documents for their contacts" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete policy documents they uploaded" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can upload policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Authenticated users can view policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can delete their own policy documents" ON policy_documents;
DROP POLICY IF EXISTS "Users can update their own policy documents" ON policy_documents;

-- Create new, more permissive policies
CREATE POLICY "Allow all operations for authenticated users on policy_documents"
  ON policy_documents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'policy_documents';

-- Also ensure the policy-documents bucket exists
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
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
CREATE POLICY "Allow all operations for authenticated users on policy-documents bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'policy-documents')
  WITH CHECK (bucket_id = 'policy-documents');
