-- Add missing unique constraint on customers(garage_id, phone) for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_garage_phone ON customers(garage_id, phone);
