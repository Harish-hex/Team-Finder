-- Storage policies for event-brochures bucket
-- NOTE: You must create the bucket manually in Supabase Dashboard:
--   Storage -> New Bucket -> name: "event-brochures", public: true

-- Allow public read access to brochures
CREATE POLICY "Public read access for event brochures"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-brochures');

-- Allow admin users to upload brochures
CREATE POLICY "Admins can upload event brochures"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-brochures'
    AND auth.jwt() ->> 'email' IN (
      'admin@example.edu',
      'harishgovind2007@gmail.com'
    )
  );

-- Allow admin users to update brochures
CREATE POLICY "Admins can update event brochures"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-brochures'
    AND auth.jwt() ->> 'email' IN (
      'admin@example.edu',
      'harishgovind2007@gmail.com'
    )
  );

-- Allow admin users to delete brochures
CREATE POLICY "Admins can delete event brochures"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-brochures'
    AND auth.jwt() ->> 'email' IN (
      'admin@example.edu',
      'harishgovind2007@gmail.com'
    )
  );
