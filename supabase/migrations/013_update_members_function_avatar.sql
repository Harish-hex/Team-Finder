-- Update function to include avatar_url
CREATE OR REPLACE FUNCTION get_team_members_with_profiles(p_team_id UUID)
RETURNS TABLE (
  member_id UUID,
  user_id UUID,
  display_name TEXT,
  university TEXT,
  experience_level TEXT,
  is_mentor BOOLEAN,
  avatar_url TEXT,
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
    p.avatar_url,
    tm.role,
    tm.joined_at
  FROM team_members tm
  JOIN profiles p ON tm.user_id = p.user_id
  WHERE tm.team_id = p_team_id
  ORDER BY tm.role DESC, tm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
