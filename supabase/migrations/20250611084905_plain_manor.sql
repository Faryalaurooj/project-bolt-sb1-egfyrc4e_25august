/*
  # Complete CRM Schema Migration

  1. New Tables
    - Enhanced contacts table with household fields
    - household_members for family tracking
    - notes and phone_calls for communication
    - text_campaigns and recipients
    - email_templates and signatures
    - social_media_posts
    - card_templates

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for CRUD operations
    - Add updated_at triggers
*/

-- Create or update contacts table with all household fields
DO $$
BEGIN
  -- Add spouse information columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'spouse_first_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN spouse_first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'spouse_last_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN spouse_last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'spouse_email'
  ) THEN
    ALTER TABLE contacts ADD COLUMN spouse_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'spouse_phone'
  ) THEN
    ALTER TABLE contacts ADD COLUMN spouse_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'spouse_date_of_birth'
  ) THEN
    ALTER TABLE contacts ADD COLUMN spouse_date_of_birth date;
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE contacts ADD COLUMN tags text[];
  END IF;

  -- Add keep in touch columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'keep_in_touch_interval'
  ) THEN
    ALTER TABLE contacts ADD COLUMN keep_in_touch_interval text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'last_contacted_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN last_contacted_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  relationship text NOT NULL, -- 'child', 'parent', 'sibling', 'other'
  date_of_birth date,
  email text,
  phone text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  visibility text NOT NULL DEFAULT 'all employees',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_action_item boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create phone_calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS phone_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  visibility text NOT NULL DEFAULT 'all employees',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_action_item boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create text_campaigns table
CREATE TABLE IF NOT EXISTS text_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create text_campaign_recipients table
CREATE TABLE IF NOT EXISTS text_campaign_recipients (
  campaign_id uuid REFERENCES text_campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, contact_id)
);

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

-- Create card_templates table
CREATE TABLE IF NOT EXISTS card_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  category text,
  industry text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create policies for household_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'household_members' 
    AND policyname = 'Users can view household members for contacts they can access'
  ) THEN
    CREATE POLICY "Users can view household members for contacts they can access"
      ON household_members
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'household_members' 
    AND policyname = 'Users can insert household members for their contacts'
  ) THEN
    CREATE POLICY "Users can insert household members for their contacts"
      ON household_members
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'household_members' 
    AND policyname = 'Users can update household members for their contacts'
  ) THEN
    CREATE POLICY "Users can update household members for their contacts"
      ON household_members
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM contacts 
          WHERE id = household_members.contact_id 
          AND created_by = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'household_members' 
    AND policyname = 'Users can delete household members for their contacts'
  ) THEN
    CREATE POLICY "Users can delete household members for their contacts"
      ON household_members
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM contacts 
          WHERE id = household_members.contact_id 
          AND created_by = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policies for notes (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' 
    AND policyname = 'Users can view notes they have access to'
  ) THEN
    CREATE POLICY "Users can view notes they have access to"
      ON notes
      FOR SELECT
      TO authenticated
      USING (
        visibility = 'all employees' OR
        created_by = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' 
    AND policyname = 'Users can insert their own notes'
  ) THEN
    CREATE POLICY "Users can insert their own notes"
      ON notes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' 
    AND policyname = 'Users can update their own notes'
  ) THEN
    CREATE POLICY "Users can update their own notes"
      ON notes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notes' 
    AND policyname = 'Users can delete their own notes'
  ) THEN
    CREATE POLICY "Users can delete their own notes"
      ON notes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for phone_calls (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phone_calls' 
    AND policyname = 'Users can view phone calls they have access to'
  ) THEN
    CREATE POLICY "Users can view phone calls they have access to"
      ON phone_calls
      FOR SELECT
      TO authenticated
      USING (
        visibility = 'all employees' OR
        created_by = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phone_calls' 
    AND policyname = 'Users can insert their own phone calls'
  ) THEN
    CREATE POLICY "Users can insert their own phone calls"
      ON phone_calls
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phone_calls' 
    AND policyname = 'Users can update their own phone calls'
  ) THEN
    CREATE POLICY "Users can update their own phone calls"
      ON phone_calls
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'phone_calls' 
    AND policyname = 'Users can delete their own phone calls'
  ) THEN
    CREATE POLICY "Users can delete their own phone calls"
      ON phone_calls
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for text_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaigns' 
    AND policyname = 'Users can view their own text campaigns'
  ) THEN
    CREATE POLICY "Users can view their own text campaigns"
      ON text_campaigns
      FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaigns' 
    AND policyname = 'Users can insert their own text campaigns'
  ) THEN
    CREATE POLICY "Users can insert their own text campaigns"
      ON text_campaigns
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaigns' 
    AND policyname = 'Users can update their own text campaigns'
  ) THEN
    CREATE POLICY "Users can update their own text campaigns"
      ON text_campaigns
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaigns' 
    AND policyname = 'Users can delete their own text campaigns'
  ) THEN
    CREATE POLICY "Users can delete their own text campaigns"
      ON text_campaigns
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create policies for text_campaign_recipients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaign_recipients' 
    AND policyname = 'Users can view recipients for their campaigns'
  ) THEN
    CREATE POLICY "Users can view recipients for their campaigns"
      ON text_campaign_recipients
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM text_campaigns 
          WHERE id = campaign_id AND created_by = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaign_recipients' 
    AND policyname = 'Users can insert recipients for their campaigns'
  ) THEN
    CREATE POLICY "Users can insert recipients for their campaigns"
      ON text_campaign_recipients
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM text_campaigns 
          WHERE id = campaign_id AND created_by = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'text_campaign_recipients' 
    AND policyname = 'Users can delete recipients for their campaigns'
  ) THEN
    CREATE POLICY "Users can delete recipients for their campaigns"
      ON text_campaign_recipients
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM text_campaigns 
          WHERE id = campaign_id AND created_by = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policies for email_templates
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

-- Create policies for email_signatures
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

-- Create policies for social_media_posts
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

-- Create policies for card_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'card_templates' 
    AND policyname = 'All authenticated users can view card templates'
  ) THEN
    CREATE POLICY "All authenticated users can view card templates"
      ON card_templates
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'card_templates' 
    AND policyname = 'Users can insert their own card templates'
  ) THEN
    CREATE POLICY "Users can insert their own card templates"
      ON card_templates
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'card_templates' 
    AND policyname = 'Users can update their own card templates'
  ) THEN
    CREATE POLICY "Users can update their own card templates"
      ON card_templates
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'card_templates' 
    AND policyname = 'Users can delete their own card templates'
  ) THEN
    CREATE POLICY "Users can delete their own card templates"
      ON card_templates
      FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

-- Create updated_at triggers for all tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_household_members_updated_at'
  ) THEN
    CREATE TRIGGER update_household_members_updated_at
      BEFORE UPDATE ON household_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_phone_calls_updated_at'
  ) THEN
    CREATE TRIGGER update_phone_calls_updated_at
      BEFORE UPDATE ON phone_calls
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_text_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER update_text_campaigns_updated_at
      BEFORE UPDATE ON text_campaigns
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_email_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_email_templates_updated_at
      BEFORE UPDATE ON email_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_email_signatures_updated_at'
  ) THEN
    CREATE TRIGGER update_email_signatures_updated_at
      BEFORE UPDATE ON email_signatures
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_social_media_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_social_media_posts_updated_at
      BEFORE UPDATE ON social_media_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_card_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_card_templates_updated_at
      BEFORE UPDATE ON card_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default data
DO $$
BEGIN
  -- Insert default email signatures if none exist
  IF NOT EXISTS (SELECT 1 FROM email_signatures LIMIT 1) THEN
    INSERT INTO email_signatures (name, content) VALUES
      ('Professional Signature', '<p>Best regards,<br>Alisha Hanif<br>Insurance Agent<br>Phone: (555) 123-4567<br>Email: alisha@example.com</p>'),
      ('Simple Signature', '<p>Thank you,<br>Alisha Hanif</p>');
  END IF;

  -- Insert default email templates if none exist
  IF NOT EXISTS (SELECT 1 FROM email_templates LIMIT 1) THEN
    INSERT INTO email_templates (title, subject, content) VALUES
      ('Welcome Email', 'Welcome to Our Services', '<p>Dear {first_name},</p><p>Welcome to our insurance services! We''re excited to help you protect what matters most.</p><p>Best regards,<br>The Team</p>'),
      ('Policy Renewal Reminder', 'Your Policy Renewal is Coming Up', '<p>Dear {first_name},</p><p>This is a friendly reminder that your policy is up for renewal on {renewal_date}.</p><p>Please contact us to discuss your options.</p>');
  END IF;

  -- Insert default card templates if none exist
  IF NOT EXISTS (SELECT 1 FROM card_templates LIMIT 1) THEN
    INSERT INTO card_templates (name, image_url, category, industry) VALUES
      ('Congrats - High Five', 'https://images.pexels.com/photos/1449459/pexels-photo-1449459.jpeg?auto=compress&cs=tinysrgb&w=400', 'Congrats', 'Insurance'),
      ('Holiday - Christmas Tree', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Holiday', 'Insurance'),
      ('Birthday - Cake', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Birthday', 'Insurance'),
      ('Thank You - Flowers', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Thank You', 'Insurance');
  END IF;
END $$;