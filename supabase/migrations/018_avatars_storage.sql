-- Storage policies for avatars bucket
-- NOTE: You must create the bucket manually in Supabase Dashboard:
--   Storage -> New Bucket -> name: "avatars", public: true

-- Allow public read access to avatars
CREATE POLICY "Public read access for avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
  );

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
  );

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
  );
