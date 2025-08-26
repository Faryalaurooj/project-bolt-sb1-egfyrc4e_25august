/*
  # Create policy-documents storage bucket

  1. New Storage Bucket
    - `policy-documents` bucket for storing policy documents
    - Public access for viewing documents
    - File size limit of 50MB
    - Allowed MIME types for documents and images

  2. Security
    - Enable RLS policies for storage bucket access
    - Allow authenticated users to upload documents
    - Allow authenticated users to view documents
    - Allow authenticated users to delete their own documents
*/

-- Create storage bucket for policy documents
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
    'application/octet-stream' -- For .accord files
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for policy documents storage
CREATE POLICY "Authenticated users can upload policy documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'policy-documents');

CREATE POLICY "Authenticated users can view policy documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'policy-documents');

CREATE POLICY "Users can delete their own policy documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'policy-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own policy documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'policy-documents' AND auth.uid()::text = (storage.foldername(name))[1]);