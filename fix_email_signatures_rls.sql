-- Fix email_signatures RLS policies to allow all authenticated users to view signatures
-- This makes sense for a CRM system where signatures might be shared across the team

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own email signatures" ON email_signatures;

-- Create a new policy that allows all authenticated users to view all signatures
CREATE POLICY "All authenticated users can view email signatures"
  ON email_signatures
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep the insert/update/delete policies restrictive (users can only modify their own)
-- But allow viewing all signatures for better UX in a CRM system
