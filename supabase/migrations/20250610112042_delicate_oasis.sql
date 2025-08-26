/*
  # Add Campaign Tables and Features

  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `subject` (text)
      - `content` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `email_signatures`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `content` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `social_media_posts`
      - `id` (uuid, primary key)
      - `content` (text, required)
      - `platforms` (text array)
      - `media_url` (text)
      - `scheduled_at` (timestamptz)
      - `status` (text, default 'draft')
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for CRUD operations
    - Add updated_at triggers
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text,
  content text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_signatures table
CREATE TABLE IF NOT EXISTS email_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create social_media_posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  platforms text[],
  media_url text,
  scheduled_at timestamptz,
  status text DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates (with conflict checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Users can view their own email templates'
  ) THEN
    CREATE POLICY "Users can view their own email templates"
      ON email_templates
      FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Users can insert their own email templates'
  ) THEN
    CREATE POLICY "Users can insert their own email templates"
      ON email_templates
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Users can update their own email templates'
  ) THEN
    CREATE POLICY "Users can update their own email templates"
      ON email_templates
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_templates' 
    AND policyname = 'Users can delete their own email templates'
  ) THEN
    CREATE POLICY "Users can delete their own email templates"
      ON email_templates
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for email_signatures (with conflict checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signatures' 
    AND policyname = 'Users can view their own email signatures'
  ) THEN
    CREATE POLICY "Users can view their own email signatures"
      ON email_signatures
      FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signatures' 
    AND policyname = 'Users can insert their own email signatures'
  ) THEN
    CREATE POLICY "Users can insert their own email signatures"
      ON email_signatures
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signatures' 
    AND policyname = 'Users can update their own email signatures'
  ) THEN
    CREATE POLICY "Users can update their own email signatures"
      ON email_signatures
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signatures' 
    AND policyname = 'Users can delete their own email signatures'
  ) THEN
    CREATE POLICY "Users can delete their own email signatures"
      ON email_signatures
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for social_media_posts (with conflict checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_media_posts' 
    AND policyname = 'Users can view their own social media posts'
  ) THEN
    CREATE POLICY "Users can view their own social media posts"
      ON social_media_posts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_media_posts' 
    AND policyname = 'Users can insert their own social media posts'
  ) THEN
    CREATE POLICY "Users can insert their own social media posts"
      ON social_media_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_media_posts' 
    AND policyname = 'Users can update their own social media posts'
  ) THEN
    CREATE POLICY "Users can update their own social media posts"
      ON social_media_posts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_media_posts' 
    AND policyname = 'Users can delete their own social media posts'
  ) THEN
    CREATE POLICY "Users can delete their own social media posts"
      ON social_media_posts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create updated_at triggers (with conflict checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_email_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_email_templates_updated_at
      BEFORE UPDATE ON email_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_email_signatures_updated_at'
  ) THEN
    CREATE TRIGGER update_email_signatures_updated_at
      BEFORE UPDATE ON email_signatures
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_social_media_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_social_media_posts_updated_at
      BEFORE UPDATE ON social_media_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default data only if tables are empty
DO $$
BEGIN
  -- Insert default email signatures if none exist
  IF NOT EXISTS (SELECT 1 FROM email_signatures LIMIT 1) THEN
    INSERT INTO email_signatures (name, content, created_by) 
    SELECT 
      'Alisha''s Professional Signature', 
      '<p>Best regards,<br>Alisha Hanif<br>Insurance Agent<br>Phone: (555) 123-4567<br>Email: alisha@example.com</p>', 
      auth.uid()
    WHERE auth.uid() IS NOT NULL;
    
    INSERT INTO email_signatures (name, content, created_by) 
    SELECT 
      'Default Signature', 
      '<p>Thank you,<br>Alisha Hanif</p>', 
      auth.uid()
    WHERE auth.uid() IS NOT NULL;
  END IF;

  -- Insert default email templates if none exist
  IF NOT EXISTS (SELECT 1 FROM email_templates LIMIT 1) THEN
    INSERT INTO email_templates (title, subject, content, created_by) 
    SELECT 
      'Welcome Email', 
      'Welcome to Our Services', 
      '<p>Dear {{first_name}},</p><p>Welcome to our insurance services! We''re excited to help you protect what matters most.</p><p>Best regards,<br>The Team</p>', 
      auth.uid()
    WHERE auth.uid() IS NOT NULL;
    
    INSERT INTO email_templates (title, subject, content, created_by) 
    SELECT 
      'Policy Renewal Reminder', 
      'Your Policy Renewal is Coming Up', 
      '<p>Dear {{first_name}},</p><p>This is a friendly reminder that your policy is up for renewal on {{renewal_date}}.</p><p>Please contact us to discuss your options.</p>', 
      auth.uid()
    WHERE auth.uid() IS NOT NULL;
  END IF;
END $$;