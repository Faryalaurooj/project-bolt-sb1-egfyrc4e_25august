/*
  # Add Text Campaigns, Card Templates, and Enhanced Contact Features

  1. New Tables
    - `text_campaigns`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `message` (text, required)
      - `status` (text, default 'draft')
      - `scheduled_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `text_campaign_recipients`
      - `campaign_id` (uuid, references text_campaigns)
      - `contact_id` (uuid, references contacts)
      - Composite primary key
    
    - `card_templates`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `image_url` (text)
      - `category` (text)
      - `industry` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Table Modifications
    - Add `tags` column to `contacts` table

  3. Security
    - Enable RLS on all new tables
    - Add policies for CRUD operations
    - Add updated_at triggers
*/

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

-- Add tags column to contacts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE contacts ADD COLUMN tags text[];
  END IF;
END $$;

-- Enable RLS
ALTER TABLE text_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for text_campaigns
CREATE POLICY "Users can view their own text campaigns"
  ON text_campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own text campaigns"
  ON text_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own text campaigns"
  ON text_campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own text campaigns"
  ON text_campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for text_campaign_recipients
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

-- Create policies for card_templates
CREATE POLICY "All authenticated users can view card templates"
  ON card_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own card templates"
  ON card_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own card templates"
  ON card_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own card templates"
  ON card_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create updated_at triggers
CREATE TRIGGER update_text_campaigns_updated_at
  BEFORE UPDATE ON text_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_templates_updated_at
  BEFORE UPDATE ON card_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default card templates
INSERT INTO card_templates (name, image_url, category, industry) VALUES
  ('Congrats - High Five', 'https://images.pexels.com/photos/1449459/pexels-photo-1449459.jpeg?auto=compress&cs=tinysrgb&w=400', 'Congrats', 'Insurance'),
  ('Congrats - Colorful', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Congrats', 'Insurance'),
  ('Holiday - Christmas Tree', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Holiday', 'Insurance'),
  ('Holiday - New Year', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Holiday', 'Insurance'),
  ('Birthday - Cake', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Birthday', 'Insurance'),
  ('Birthday - Balloons', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Birthday', 'Insurance'),
  ('Thank You - Flowers', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Thank You', 'Insurance'),
  ('Thank You - Handshake', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Thank You', 'Insurance'),
  ('Sympathy - Flowers', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Sympathy', 'Insurance'),
  ('Sympathy - Peaceful', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Sympathy', 'Insurance'),
  ('Business - Professional', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Business', 'Insurance'),
  ('Business - Handshake', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Business', 'Insurance'),
  ('Blank - Simple', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Blank', 'Insurance'),
  ('Blank - Elegant', 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400', 'Blank', 'Insurance');