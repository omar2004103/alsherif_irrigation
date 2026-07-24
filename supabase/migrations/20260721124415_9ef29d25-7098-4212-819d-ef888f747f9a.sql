
CREATE POLICY "Anyone can upload inquiry attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'inquiry-attachments');

CREATE POLICY "Admins/staff can read inquiry attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'inquiry-attachments'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
);
