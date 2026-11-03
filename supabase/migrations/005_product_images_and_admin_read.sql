-- Product management support: admin reads and product image storage.

CREATE POLICY "Admins can read all products" ON products
  FOR SELECT USING (
    is_active = true OR is_admin_user()
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND is_admin_user()
  );

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin_user())
  WITH CHECK (bucket_id = 'product-images' AND is_admin_user());

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin_user());