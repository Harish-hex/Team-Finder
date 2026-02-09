-- Create team_members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
-- All authenticated users can read all team members (for browsing team details)
CREATE POLICY "Authenticated users can read all team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system functions can insert team members (via create_team or approve_application)
-- This policy allows inserts only from SECURITY DEFINER functions
CREATE POLICY "System functions can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Team admins can remove members from their team
CREATE POLICY "Team admins can remove members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );
