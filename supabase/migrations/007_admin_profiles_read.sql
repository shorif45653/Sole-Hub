-- 007_admin_profiles_read.sql
-- Add email column to profiles and admin read access to all profiles

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (is_admin_user());

-- RLS policy: Admins can update any profile role
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (is_admin_user())
  WITH CHECK (is_admin_user());