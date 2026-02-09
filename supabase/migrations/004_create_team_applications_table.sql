-- Create team_applications table
CREATE TABLE team_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_role TEXT NOT NULL,
  experience TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create indexes
CREATE INDEX idx_team_applications_team_id ON team_applications(team_id);
CREATE INDEX idx_team_applications_user_id ON team_applications(user_id);
CREATE INDEX idx_team_applications_status ON team_applications(status);

-- Enable RLS
ALTER TABLE team_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_applications
-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON team_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Team admins can read applications to their teams
CREATE POLICY "Team admins can read team applications"
  ON team_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_applications.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- Users can create applications
CREATE POLICY "Users can create applications"
  ON team_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Team admins can update application status
CREATE POLICY "Team admins can update applications"
  ON team_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_applications.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_applications.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );
