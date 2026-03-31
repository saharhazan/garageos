-- ─── Garage PDF settings (branding, business details for documents) ───
ALTER TABLE garages ADD COLUMN IF NOT EXISTS business_details JSONB NOT NULL DEFAULT '{}'::jsonb;
-- business_details stores: {
--   legal_name, osek_number, address, phone, email,
--   logo_url, stamp_url, manager_name, manager_license,
--   bank_name, bank_branch, bank_account,
--   primary_color (hex), secondary_color (hex)
-- }

-- ─── Document sequences (separate from job_sequences) ────
CREATE TABLE document_sequences (
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- 'invoice', 'receipt', 'quote', 'intake', 'release', 'warranty'
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (garage_id, doc_type, year)
);

CREATE OR REPLACE FUNCTION next_doc_number(p_garage_id UUID, p_doc_type TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_next INTEGER;
BEGIN
  INSERT INTO document_sequences (garage_id, doc_type, year, last_number)
  VALUES (p_garage_id, p_doc_type, v_year, 1)
  ON CONFLICT (garage_id, doc_type, year)
  DO UPDATE SET last_number = document_sequences.last_number + 1
  RETURNING last_number INTO v_next;
  RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- ─── Generated documents log ─────────────────────────────
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('invoice', 'receipt', 'invoice_receipt', 'quote', 'work_order', 'intake', 'release', 'warranty')),
  doc_number TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb, -- snapshot of all data at generation time
  total_amount NUMERIC(10,2),
  pdf_url TEXT, -- Supabase Storage URL after generation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_garage ON documents(garage_id);
CREATE INDEX idx_documents_order ON documents(order_id);
CREATE INDEX idx_documents_type ON documents(doc_type);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select" ON documents FOR SELECT USING (garage_id = auth_garage_id());
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (garage_id = auth_garage_id());

-- ─── Custom fields per garage per document type ──────────
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- which document type this field appears on
  field_name TEXT NOT NULL, -- internal name
  field_label TEXT NOT NULL, -- Hebrew display label
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'number', 'date', 'checkbox', 'select')),
  options JSONB, -- for select type: ["option1", "option2"]
  required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custom_fields_garage ON custom_fields(garage_id, doc_type);
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_fields_select" ON custom_fields FOR SELECT USING (garage_id = auth_garage_id());
CREATE POLICY "custom_fields_manage" ON custom_fields FOR ALL USING (
  garage_id = auth_garage_id() AND auth_user_role() IN ('super_admin', 'manager')
);
