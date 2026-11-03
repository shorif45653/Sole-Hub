-- 001_initial_schema.sql
-- Creates core tables for SoleHub e-commerce database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(10,2) CHECK (discount_price >= 0 AND discount_price < price),
  images TEXT[] DEFAULT '{}',
  sizes INTEGER[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size INTEGER NOT NULL,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, size, color)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'NOT_REQUIRED')),
  order_status TEXT NOT NULL DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  shipping_full_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  idempotency_key UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  color TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_reference TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'NOT_REQUIRED')),
  is_demo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_reference);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();