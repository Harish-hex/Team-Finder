-- Expand events table with richer event data
ALTER TABLE events
  ADD COLUMN event_date TIMESTAMPTZ,
  ADD COLUMN event_type TEXT CHECK (event_type IN ('hackathon', 'ctf', 'competition', 'workshop', 'meetup', 'other')),
  ADD COLUMN max_members INTEGER CHECK (max_members IS NULL OR max_members >= 1),
  ADD COLUMN registration_link TEXT,
  ADD COLUMN venue TEXT,
  ADD COLUMN brochure_url TEXT;

-- Index for sorting by upcoming date
CREATE INDEX idx_events_event_date ON events(event_date ASC NULLS LAST);
