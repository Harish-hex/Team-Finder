-- Helper function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar looking chars (I, O, 0, 1, L)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  -- Check uniqueness (recursive retry if collision)
  IF EXISTS (SELECT 1 FROM teams WHERE invite_code = result) THEN
    RETURN generate_invite_code();
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a team atomically
CREATE OR REPLACE FUNCTION create_team(
  p_name TEXT,
  p_description TEXT,
  p_event_type TEXT,
  p_tech_stack TEXT[],
  p_roles_needed TEXT[],
  p_max_members INTEGER,
  p_is_beginner_friendly BOOLEAN,
  p_has_mentor BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_team_id UUID;
  v_invite_code TEXT;
BEGIN
  -- Generate unique invite code
  v_invite_code := generate_invite_code();
  
  -- Create team
  INSERT INTO teams (
    name, 
    description, 
    event_type, 
    tech_stack, 
    roles_needed, 
    max_members, 
    is_beginner_friendly, 
    has_mentor, 
    invite_code, 
    created_by
  )
  VALUES (
    p_name, 
    p_description, 
    p_event_type, 
    p_tech_stack, 
    p_roles_needed,
    p_max_members, 
    p_is_beginner_friendly, 
    p_has_mentor, 
    v_invite_code, 
    auth.uid()
  )
  RETURNING id INTO v_team_id;
  
  -- Add creator as admin
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, auth.uid(), 'admin');
  
  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id,
    'invite_code', v_invite_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
