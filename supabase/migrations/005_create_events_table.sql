-- Create events table for dashboard announcements
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- All authenticated users can read events
CREATE POLICY "Authenticated users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Only specific admin users can create events
-- For MVP, we'll use a simple approach: check if user email is in a hardcoded list
-- In production, you'd want a proper admin role system
CREATE POLICY "Admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@example.edu',
      'harishgovind2007@gmail.com'
    )
  );

-- Admins can update their own events
CREATE POLICY "Admins can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Admins can delete their own events
CREATE POLICY "Admins can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
