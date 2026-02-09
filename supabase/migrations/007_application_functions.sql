-- Function to submit application to join a team
CREATE OR REPLACE FUNCTION apply_to_team(
  p_team_id UUID,
  p_preferred_role TEXT,
  p_experience TEXT,
  p_message TEXT
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
  INSERT INTO team_applications (team_id, user_id, preferred_role, experience, message)
  VALUES (p_team_id, auth.uid(), p_preferred_role, p_experience, p_message);
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve an application (admin only)
CREATE OR REPLACE FUNCTION approve_application(p_application_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_user_id UUID;
  v_max_members INTEGER;
  v_current_count INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  -- Get application details
  SELECT team_id, user_id INTO v_team_id, v_user_id
  FROM team_applications
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Application not found or already processed'
    );
  END IF;
  
  -- Check if caller is team admin
  SELECT EXISTS(
    SELECT 1 FROM team_members
    WHERE team_id = v_team_id AND user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Only team admins can approve applications'
    );
  END IF;
  
  -- Check if team is full
  SELECT max_members INTO v_max_members FROM teams WHERE id = v_team_id;
  SELECT COUNT(*) INTO v_current_count FROM team_members WHERE team_id = v_team_id;
  
  IF v_current_count >= v_max_members THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Team is full'
    );
  END IF;
  
  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, v_user_id, 'member');
  
  -- Update application status
  UPDATE team_applications
  SET status = 'approved', updated_at = now()
  WHERE id = p_application_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject an application (admin only)
CREATE OR REPLACE FUNCTION reject_application(p_application_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get team_id from application
  SELECT team_id INTO v_team_id
  FROM team_applications
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Application not found or already processed'
    );
  END IF;
  
  -- Check if caller is team admin
  SELECT EXISTS(
    SELECT 1 FROM team_members
    WHERE team_id = v_team_id AND user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Only team admins can reject applications'
    );
  END IF;
  
  -- Update application status
  UPDATE team_applications
  SET status = 'rejected', updated_at = now()
  WHERE id = p_application_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
