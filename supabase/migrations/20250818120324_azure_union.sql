/*
  # Enhance text messages table for TextMagic integration

  1. New Columns
    - `contact_id` (uuid, nullable) - Reference to contacts table
    - `sender_phone` (text) - Phone number of sender
    - `recipient_phone` (text) - Phone number of recipient  
    - `direction` (text) - 'incoming' or 'outgoing'
    - `status` (text) - 'pending', 'sent', 'delivered', 'failed', 'draft'
    - `content` (text) - Message content (renamed from message_text)
    - `sent_at` (timestamp) - When message was sent
    - `textmagic_id` (text) - TextMagic API message ID for tracking

  2. Security
    - Enable RLS on text_messages table
    - Add policies for authenticated users to manage their messages

  3. Changes
    - Make recipient_id nullable for contact messages
    - Add foreign key constraint for contact_id
*/

-- Add new columns to text_messages table
DO $$
BEGIN
  -- Add contact_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN contact_id uuid;
  END IF;

  -- Add sender_phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'sender_phone'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN sender_phone text;
  END IF;

  -- Add recipient_phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'recipient_phone'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN recipient_phone text;
  END IF;

  -- Add direction column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'direction'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN direction text DEFAULT 'outgoing';
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'status'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN status text DEFAULT 'pending';
  END IF;

  -- Add content column if it doesn't exist (rename from message_text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'content'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN content text;
    -- Copy data from message_text to content if message_text exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'text_messages' AND column_name = 'message_text'
    ) THEN
      UPDATE text_messages SET content = message_text WHERE message_text IS NOT NULL;
    END IF;
  END IF;

  -- Add sent_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN sent_at timestamptz;
  END IF;

  -- Add textmagic_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'text_messages' AND column_name = 'textmagic_id'
  ) THEN
    ALTER TABLE text_messages ADD COLUMN textmagic_id text;
  END IF;
END $$;

-- Add foreign key constraint for contact_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'text_messages_contact_id_fkey'
  ) THEN
    ALTER TABLE text_messages 
    ADD CONSTRAINT text_messages_contact_id_fkey 
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE text_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for text messages
CREATE POLICY "Users can view their own text messages"
  ON text_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = text_messages.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own text messages"
  ON text_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = text_messages.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own text messages"
  ON text_messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = text_messages.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own text messages"
  ON text_messages
  FOR DELETE
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = text_messages.contact_id 
      AND contacts.created_by = auth.uid()
    )
  );