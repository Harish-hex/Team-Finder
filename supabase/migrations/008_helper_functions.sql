-- Get user's current team
CREATE OR REPLACE FUNCTION get_my_team()
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_description TEXT,
  invite_code TEXT,
  event_type TEXT,
  tech_stack TEXT[],
  roles_needed TEXT[],
  max_members INTEGER,
  is_beginner_friendly BOOLEAN,
  has_mentor BOOLEAN,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.invite_code,
    t.event_type,
    t.tech_stack,
    t.roles_needed,
    t.max_members,
    t.is_beginner_friendly,
    t.has_mentor,
    tm.role,
    t.created_at
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resolve invite code to team (for /join/:code route)
CREATE OR REPLACE FUNCTION get_team_by_invite(p_invite_code TEXT)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  description TEXT,
  event_type TEXT,
  tech_stack TEXT[],
  roles_needed TEXT[],
  max_members INTEGER,
  current_members_count BIGINT,
  is_beginner_friendly BOOLEAN,
  has_mentor BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.event_type,
    t.tech_stack,
    t.roles_needed,
    t.max_members,
    (SELECT COUNT(*) FROM team_members WHERE team_id = t.id),
    t.is_beginner_friendly,
    t.has_mentor
  FROM teams t
  WHERE t.invite_code = p_invite_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's pending applications (for dashboard)
CREATE OR REPLACE FUNCTION get_my_applications()
RETURNS TABLE (
  application_id UUID,
  team_id UUID,
  team_name TEXT,
  team_description TEXT,
  status TEXT,
  preferred_role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id,
    t.id,
    t.name,
    t.description,
    ta.status,
    ta.preferred_role,
    ta.created_at
  FROM team_applications ta
  JOIN teams t ON ta.team_id = t.id
  WHERE ta.user_id = auth.uid()
  ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get applications for a team (admin only)
CREATE OR REPLACE FUNCTION get_team_applications(p_team_id UUID)
RETURNS TABLE (
  application_id UUID,
  user_id UUID,
  user_name TEXT,
  user_university TEXT,
  user_experience_level TEXT,
  preferred_role TEXT,
  experience TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if caller is team admin
  SELECT EXISTS(
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only team admins can view applications';
  END IF;
  
  RETURN QUERY
  SELECT 
    ta.id,
    ta.user_id,
    p.display_name,
    p.university,
    p.experience_level,
    ta.preferred_role,
    ta.experience,
    ta.message,
    ta.status,
    ta.created_at
  FROM team_applications ta
  JOIN profiles p ON ta.user_id = p.user_id
  WHERE ta.team_id = p_team_id
  ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team members with profile info
CREATE OR REPLACE FUNCTION get_team_members_with_profiles(p_team_id UUID)
RETURNS TABLE (
  member_id UUID,
  user_id UUID,
  display_name TEXT,
  university TEXT,
  experience_level TEXT,
  is_mentor BOOLEAN,
  role TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.user_id,
    p.display_name,
    p.university,
    p.experience_level,
    p.is_mentor,
    tm.role,
    tm.joined_at
  FROM team_members tm
  JOIN profiles p ON tm.user_id = p.user_id
  WHERE tm.team_id = p_team_id
  ORDER BY tm.role DESC, tm.joined_at ASC; -- Admins first, then by join date
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
