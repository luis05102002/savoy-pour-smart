INSERT INTO storage.buckets (id, name, public) VALUES ('drink-images', 'drink-images', true);

CREATE POLICY "Anyone can view drink images"
ON storage.objects FOR SELECT
USING (bucket_id = 'drink-images');

CREATE POLICY "Staff can upload drink images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'drink-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Staff can update drink images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'drink-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Staff can delete drink images"
ON storage.objects FOR DELETE
USING (bucket_id = 'drink-images' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff')));