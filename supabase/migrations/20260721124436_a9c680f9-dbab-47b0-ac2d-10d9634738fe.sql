
DROP POLICY IF EXISTS "Anyone can upload inquiry attachments" ON storage.objects;

CREATE POLICY "Anyone can upload inquiry attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'inquiry-attachments'
  AND (storage.foldername(name))[1] = 'uploads'
  AND octet_length(name) < 300
);
