-- ══════════════════════════════════════════════════════════════
-- Storage Buckets Setup
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES 
  ('member-photos', 'member-photos', false),
  ('member-documents', 'member-documents', false),
  ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security for Storage ──

-- Member Photos: Authenticated users can view, Admin/Cashier/Manager can upload
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authorized roles can insert photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated' AND (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('administrator', 'bank_manager', 'cashier'))
));

-- Member Documents: Authenticated users can view, Admin/Cashier/Manager can upload
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authorized roles can insert documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-documents' AND auth.role() = 'authenticated' AND (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('administrator', 'bank_manager', 'cashier'))
));

-- Signatures: Authenticated users can view, Admin/Cashier/Manager can upload
CREATE POLICY "Authenticated users can view signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures' AND auth.role() = 'authenticated');

CREATE POLICY "Authorized roles can insert signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'signatures' AND auth.role() = 'authenticated' AND (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('administrator', 'bank_manager', 'cashier'))
));
