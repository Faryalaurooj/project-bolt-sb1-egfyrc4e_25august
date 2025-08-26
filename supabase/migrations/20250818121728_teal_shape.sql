/*
  # Fix Users RLS Policy for Team Member Search

  1. Security Changes
    - Drop existing restrictive RLS policy on users table
    - Add new policy allowing authenticated users to view all team members
    - This enables search functionality for team members in texting features

  2. Purpose
    - Allow users to search and message other team members
    - Maintain security by requiring authentication
    - Enable proper functionality of texting features across the CRM
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Create new policy allowing authenticated users to view all users
CREATE POLICY "Authenticated users can view all team members"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);