-- Create storage bucket for signatures and images
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for signatures bucket
CREATE POLICY "signatures_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'signatures' AND auth.role() = 'authenticated');

CREATE POLICY "signatures_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'signatures');

CREATE POLICY "images_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
