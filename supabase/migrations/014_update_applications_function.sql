-- Update get_team_applications to include avatar_url and interests
DROP FUNCTION IF EXISTS get_team_applications(UUID);

CREATE OR REPLACE FUNCTION get_team_applications(p_team_id UUID)
RETURNS TABLE (
  application_id UUID,
  user_id UUID,
  user_name TEXT,
  user_university TEXT,
  user_experience_level TEXT,
  user_avatar_url TEXT,
  user_interests TEXT[],
  preferred_role TEXT,
  experience TEXT,
  message TEXT,
  contact_info TEXT,
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
    p.avatar_url,
    p.interests,
    ta.preferred_role,
    ta.experience,
    ta.message,
    ta.contact_info,
    ta.status,
    ta.created_at
  FROM team_applications ta
  JOIN profiles p ON ta.user_id = p.user_id
  WHERE ta.team_id = p_team_id
  ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
