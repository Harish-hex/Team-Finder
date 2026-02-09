-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('hackathon', 'ctf', 'competition', 'project')),
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  roles_needed TEXT[] NOT NULL DEFAULT '{}',
  max_members INTEGER NOT NULL CHECK (max_members >= 2 AND max_members <= 10),
  is_beginner_friendly BOOLEAN NOT NULL DEFAULT false,
  has_mentor BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_teams_invite_code ON teams(invite_code);
CREATE INDEX idx_teams_event_type ON teams(event_type);
CREATE INDEX idx_teams_created_by ON teams(created_by);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
-- All authenticated users can read all teams (for browsing)
CREATE POLICY "Authenticated users can read all teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Team creators can update their own teams
CREATE POLICY "Team creators can update own teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Team creators can delete their own teams
CREATE POLICY "Team creators can delete own teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
