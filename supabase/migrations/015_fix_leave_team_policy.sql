-- Allow members to leave teams (delete their own membership row)
CREATE POLICY "Members can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
