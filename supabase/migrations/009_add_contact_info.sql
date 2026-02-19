-- Add contact_info column to team_applications
ALTER TABLE team_applications ADD COLUMN IF NOT EXISTS contact_info TEXT DEFAULT '';

-- Drop existing functions first (return type changed, can't use CREATE OR REPLACE)
DROP FUNCTION IF EXISTS apply_to_team(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_team_applications(UUID);

-- Recreate apply_to_team function with contact_info parameter
CREATE OR REPLACE FUNCTION apply_to_team(
  p_team_id UUID,
  p_preferred_role TEXT,
  p_experience TEXT,
  p_message TEXT,
  p_contact_info TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_user_team_count INTEGER;
  v_existing_application INTEGER;
BEGIN
  -- Check if user already in a team
  SELECT COUNT(*) INTO v_user_team_count
  FROM team_members
  WHERE user_id = auth.uid();
  
  IF v_user_team_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'You are already in a team'
    );
  END IF;
  
  -- Check for existing application
  SELECT COUNT(*) INTO v_existing_application
  FROM team_applications
  WHERE team_id = p_team_id AND user_id = auth.uid();
  
  IF v_existing_application > 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'You have already applied to this team'
    );
  END IF;
  
  -- Create application
  INSERT INTO team_applications (team_id, user_id, preferred_role, experience, message, contact_info)
  VALUES (p_team_id, auth.uid(), p_preferred_role, p_experience, p_message, p_contact_info);
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_team_applications to return contact_info
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
