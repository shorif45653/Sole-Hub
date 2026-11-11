-- Allow administrators to view and manage customer orders.

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Admins can read all order items" ON order_items
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can read all payments" ON payments
  FOR SELECT USING (is_admin_user());