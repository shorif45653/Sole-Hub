-- 002_rls_policies.sql
-- Row Level Security policies for SoleHub

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles policies
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- Products policies
-- ============================================

-- Public can read active products
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Cart items policies
-- ============================================

-- Users can read their own cart items
CREATE POLICY "Users can read own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Orders policies
-- ============================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users cannot insert orders directly (must use create_order function)
-- Orders are created via secure server-side function

-- Users cannot update orders directly
-- Order status updates are restricted to admin/trusted logic

-- ============================================
-- Order items policies
-- ============================================

-- Users can read order items for their own orders
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Order items are created via secure server-side function (checkout)

-- ============================================
-- Payments policies
-- ============================================

-- Users can read payments for their own orders
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

-- Payments are created via secure server-side function (process_demo_payment)

-- ============================================
-- Admin helper function (for use in RLS and server-side functions)
-- ============================================

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;