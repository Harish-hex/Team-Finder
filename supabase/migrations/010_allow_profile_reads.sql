-- Allow any authenticated user to read any profile
-- Profile data (display_name, university, etc.) is not sensitive
-- This fixes the "Unknown User" issue when reviewing team applications
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
