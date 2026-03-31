-- ─── Appointments ───────────────────────────────────────
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  service_type TEXT, -- e.g., 'טיפול שוטף', 'תיקון', 'בדיקה', 'טסט'
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  customer_name TEXT, -- for quick appointments without full customer record
  customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_garage ON appointments(garage_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);

CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (garage_id = auth_garage_id());

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT WITH CHECK (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "appointments_delete" ON appointments
  FOR DELETE USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager')
  );
