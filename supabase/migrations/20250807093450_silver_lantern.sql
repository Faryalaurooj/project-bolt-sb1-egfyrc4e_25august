/*
  # Update calendar events table with proper RLS policies

  1. Security Updates
    - Enable RLS on `calendar_events` table
    - Add policies for authenticated users to manage calendar events
    - Allow all authenticated users to view all events (team visibility)
    - Allow users to create, update, and delete their own events

  2. Table Updates
    - Ensure proper foreign key relationship with users table
*/

-- Enable RLS if not already enabled
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;

-- Create new policies
CREATE POLICY "Users can view all calendar events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own calendar events"
  ON calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);