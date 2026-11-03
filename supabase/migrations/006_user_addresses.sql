-- 006_user_addresses.sql
-- Adds user addresses table for managing shipping/billing addresses

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON addresses(user_id, is_default);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);
