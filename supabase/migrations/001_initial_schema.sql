-- ─── Extensions ────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ─── Garages ────────────────────────────────────────────
CREATE TABLE garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'pro', 'enterprise')),
  settings JSONB NOT NULL DEFAULT '{
    "sms_enabled": false,
    "whatsapp_enabled": false,
    "auto_notify_on_status_change": true,
    "tax_rate": 17,
    "currency": "ILS",
    "job_prefix": "AK"
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Users (extends auth.users) ─────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician'
    CHECK (role IN ('super_admin', 'manager', 'receptionist', 'technician', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Customers ──────────────────────────────────────────
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_garage ON customers(garage_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name_trgm ON customers USING gin(full_name gin_trgm_ops);

-- ─── Vehicles ───────────────────────────────────────────
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  license_plate TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  vin TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_garage ON vehicles(garage_id);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE UNIQUE INDEX idx_vehicles_plate_garage ON vehicles(garage_id, license_plate);

-- ─── Job number sequence ─────────────────────────────────
CREATE TABLE job_sequences (
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (garage_id, year)
);

CREATE OR REPLACE FUNCTION next_job_number(p_garage_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_next INTEGER;
BEGIN
  INSERT INTO job_sequences (garage_id, year, last_number)
  VALUES (p_garage_id, v_year, 1)
  ON CONFLICT (garage_id, year)
  DO UPDATE SET last_number = job_sequences.last_number + 1
  RETURNING last_number INTO v_next;
  RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- ─── Work Orders ────────────────────────────────────────
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  job_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'in_progress', 'ready', 'delivered', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high', 'urgent')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  mileage INTEGER,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  signature_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_garage ON work_orders(garage_id);
CREATE INDEX idx_orders_status ON work_orders(status);
CREATE INDEX idx_orders_customer ON work_orders(customer_id);
CREATE INDEX idx_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX idx_orders_created ON work_orders(created_at DESC);
CREATE UNIQUE INDEX idx_orders_job_number ON work_orders(garage_id, job_number);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Inventory ──────────────────────────────────────────
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_garage ON inventory(garage_id);

-- ─── Notifications log ──────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'whatsapp', 'email')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ─────────────────────────────────
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's garage_id from JWT
CREATE OR REPLACE FUNCTION auth_garage_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'garage_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Garages: users see only their garage
CREATE POLICY "garage_select" ON garages
  FOR SELECT USING (id = auth_garage_id());

-- Users: see only their garage members
CREATE POLICY "users_select" ON users
  FOR SELECT USING (garage_id = auth_garage_id());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Manager+ can manage users
CREATE POLICY "users_manage" ON users
  FOR ALL USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager')
  );

-- Customers: tenant isolation
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (garage_id = auth_garage_id());

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

-- Vehicles: tenant isolation
CREATE POLICY "vehicles_select" ON vehicles
  FOR SELECT USING (garage_id = auth_garage_id());

CREATE POLICY "vehicles_insert" ON vehicles
  FOR INSERT WITH CHECK (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "vehicles_update" ON vehicles
  FOR UPDATE USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

-- Work orders: tenant isolation + technician sees own
CREATE POLICY "orders_select" ON work_orders
  FOR SELECT USING (
    garage_id = auth_garage_id()
    AND (
      auth_user_role() IN ('super_admin', 'manager', 'receptionist', 'viewer')
      OR (auth_user_role() = 'technician' AND technician_id = auth.uid())
    )
  );

CREATE POLICY "orders_insert" ON work_orders
  FOR INSERT WITH CHECK (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager', 'receptionist')
  );

CREATE POLICY "orders_update" ON work_orders
  FOR UPDATE USING (
    garage_id = auth_garage_id()
    AND (
      auth_user_role() IN ('super_admin', 'manager', 'receptionist')
      OR (auth_user_role() = 'technician' AND technician_id = auth.uid())
    )
  );

-- Inventory: tenant isolation
CREATE POLICY "inventory_select" ON inventory
  FOR SELECT USING (garage_id = auth_garage_id());

CREATE POLICY "inventory_manage" ON inventory
  FOR ALL USING (
    garage_id = auth_garage_id()
    AND auth_user_role() IN ('super_admin', 'manager')
  );

-- ─── Dashboard view ─────────────────────────────────────
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  garage_id,
  COUNT(*) FILTER (WHERE status != 'delivered' AND status != 'cancelled') AS open_orders,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
  COUNT(*) FILTER (WHERE status = 'ready') AS ready_for_pickup,
  COUNT(*) FILTER (WHERE status = 'delivered' AND completed_at::date = CURRENT_DATE) AS completed_today,
  COALESCE(SUM(total_amount) FILTER (WHERE status = 'delivered' AND completed_at::date = CURRENT_DATE), 0) AS revenue_today,
  COALESCE(SUM(total_amount) FILTER (WHERE status = 'delivered' AND completed_at >= date_trunc('week', NOW())), 0) AS revenue_week,
  COALESCE(SUM(total_amount) FILTER (WHERE status = 'delivered' AND completed_at >= date_trunc('month', NOW())), 0) AS revenue_month
FROM work_orders
GROUP BY garage_id;
