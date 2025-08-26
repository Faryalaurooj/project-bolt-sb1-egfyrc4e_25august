/*
  # Add do not contact column to contacts table

  1. Schema Changes
    - Add `do_not_contact` boolean column to `contacts` table
    - Set default value to `false`
    - Allow contacts to opt out of text messaging

  2. Security
    - No changes to existing RLS policies
    - Column follows existing security model
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_contact'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_contact boolean DEFAULT false;
  END IF;
END $$;