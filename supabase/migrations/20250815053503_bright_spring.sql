/*
  # Add Outlook Email Integration to Users

  1. Schema Changes
    - Add `outlook_email` column to `users` table
    - Allow users to link their Outlook calendar accounts

  2. Purpose
    - Enable Outlook calendar integration for dashboard calendar
    - Store Outlook email addresses for calendar sync
    - Support multi-user calendar display with Outlook events
*/

-- Add outlook_email column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'outlook_email'
  ) THEN
    ALTER TABLE users ADD COLUMN outlook_email text;
  END IF;
END $$;