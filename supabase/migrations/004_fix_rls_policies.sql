-- Fix auth_garage_id to query users table instead of JWT claim
-- The original function read auth.jwt() ->> 'garage_id' which Supabase doesn't populate,
-- causing ALL RLS policies to return no rows.
CREATE OR REPLACE FUNCTION auth_garage_id()
RETURNS UUID AS $$
  SELECT garage_id FROM public.users WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Add index on users(id) for performance since auth_garage_id() is called on every RLS check
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
