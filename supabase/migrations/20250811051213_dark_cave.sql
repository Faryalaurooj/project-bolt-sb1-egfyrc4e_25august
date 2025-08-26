/*
  # Add media support to text messages

  1. Changes
    - Add `media_url` column to `text_messages` table for file attachments
    - Add storage bucket for message attachments

  2. Security
    - Create storage bucket with appropriate policies
    - Allow authenticated users to upload and view attachments
*/

-- Add media_url column to text_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN media_url text;
  END IF;
END $$;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Authenticated users can upload message attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can view message attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their own message attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);