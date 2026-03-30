-- ─── Stripe columns on garages ──────────────────────────
ALTER TABLE garages
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX idx_garages_stripe_customer ON garages(stripe_customer_id);

-- ─── Quote number sequence ──────────────────────────────
CREATE TABLE quote_sequences (
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (garage_id, year)
);

CREATE OR REPLACE FUNCTION next_quote_number(p_garage_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_next INTEGER;
BEGIN
  INSERT INTO quote_sequences (garage_id, year, last_number)
  VALUES (p_garage_id, v_year, 1)
  ON CONFLICT (garage_id, year)
  DO UPDATE SET last_number = quote_sequences.last_number + 1
  RETURNING last_number INTO v_next;
  RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- ─── Quotes ─────────────────────────────────────────────
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_garage ON quotes(garage_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_vehicle ON quotes(vehicle_id);
CREATE INDEX idx_quotes_created ON quotes(created_at DESC);
CREATE UNIQUE INDEX idx_quotes_quote_number ON quotes(garage_id, quote_number);

-- Auto-update updated_at
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS for quotes ──────────────────────────────────────
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotes_select" ON quotes
  FOR SELECT USING (
    garage_id = auth_garage_id()
    AND (
      auth_user_role() IN ('super_admin', 'manager', 'receptionist', 'viewer')
      OR (auth_user_role() = 'technician')
    )
  );

CREATE POLICY "quotes_insert" ON quotes
  FOR INSERT WITH CHECK (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "quotes_update" ON quotes
  FOR UPDATE USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );
