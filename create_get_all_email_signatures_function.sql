-- Create RPC function to get all email signatures (bypasses RLS)
-- This function allows all authenticated users to view all email signatures

CREATE OR REPLACE FUNCTION get_all_email_signatures()
RETURNS TABLE (
  id uuid,
  name text,
  content text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    name,
    content,
    created_by,
    created_at,
    updated_at
  FROM email_signatures
  ORDER BY created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_email_signatures() TO authenticated;
