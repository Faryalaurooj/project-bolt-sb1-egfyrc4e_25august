/*
  # Add sticky notes support to notes table

  1. New Columns
    - `is_sticky` (boolean) - Marks notes that should appear as sticky notes on dashboard
    - `x_position` (integer) - X coordinate for sticky note position on dashboard
    - `y_position` (integer) - Y coordinate for sticky note position on dashboard
    - `media_url` (text) - URL for attached files stored in Supabase Storage

  2. Storage
    - Create storage bucket for note attachments

  3. Security
    - Add RLS policies for storage bucket access
*/

-- Add new columns to notes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'is_sticky'
  ) THEN
    ALTER TABLE notes ADD COLUMN is_sticky BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'x_position'
  ) THEN
    ALTER TABLE notes ADD COLUMN x_position INTEGER DEFAULT 100;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'y_position'
  ) THEN
    ALTER TABLE notes ADD COLUMN y_position INTEGER DEFAULT 100;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE notes ADD COLUMN media_url TEXT;
  END IF;
END $$;

-- Create storage bucket for note attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-attachments', 'note-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for storage bucket
CREATE POLICY "Users can upload note attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'note-attachments');

CREATE POLICY "Users can view note attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'note-attachments');

CREATE POLICY "Users can delete their note attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'note-attachments');