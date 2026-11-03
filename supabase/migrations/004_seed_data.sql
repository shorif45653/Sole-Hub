-- 004_seed_data.sql
-- Sample data for SoleHub (repeatable - uses ON CONFLICT to avoid duplicates)

-- Insert sample products
INSERT INTO products (name, brand, category, description, price, discount_price, images, sizes, colors, stock, is_active) VALUES
('Velocity Runner X', 'Nike', 'Running', 'Lightweight running shoes with responsive cushioning for everyday miles.', 8999, 7499, 
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'], 
 ARRAY[7,8,9,10,11], ARRAY['White','Black','Red'], 50, true),

('Air Max Pulse', 'Nike', 'Lifestyle', 'Iconic street style with visible air unit for all-day comfort.', 12999, NULL,
 ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10], ARRAY['White','Black','Grey'], 30, true),

('LeBron Witness 8', 'Nike', 'Basketball', 'Court-dominating basketball shoes with lockdown support.', 10999, 9499,
 ARRAY['https://images.unsplash.com/photo-1577801842755-3a1e9a1d9f27?w=600&h=600&fit=crop'],
 ARRAY[7,8,9,10,11,12], ARRAY['Red','White','Blue'], 25, true),

('Metcon 9 Training', 'Nike', 'Training', 'Versatile training shoes built for every workout.', 9999, NULL,
 ARRAY['https://images.unsplash.com/photo-1608234940312-a6294a2c9234?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10], ARRAY['Black','White','Grey'], 40, true),

('Ultraboost 22', 'Adidas', 'Running', 'Premium running shoes with boost energy return.', 14999, 11999,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10,11], ARRAY['White','Black','Blue'], 35, true),

('Stan Smith', 'Adidas', 'Lifestyle', 'Classic tennis-inspired sneakers for everyday wear.', 7999, NULL,
 ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10,11], ARRAY['White','Green','Black'], 60, true),

('Harden Vol 7', 'Adidas', 'Basketball', 'Explosive basketball performance with signature traction.', 13999, 11499,
 ARRAY['https://images.unsplash.com/photo-1577801842755-3a1e9a1d9f27?w=600&h=600&fit=crop'],
 ARRAY[7,8,9,10,11,12], ARRAY['Red','White','Black'], 20, true),

('Response Trail', 'Adidas', 'Training', 'Trail-ready training shoes for outdoor workouts.', 8499, NULL,
 ARRAY['https://images.unsplash.com/photo-1608234940312-a6294a2c9234?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10], ARRAY['Grey','Black','White'], 30, true),

('Gel-Kayano 30', 'ASICS', 'Running', 'Maximum cushioning running shoes for long distances.', 15999, 13499,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
 ARRAY[7,8,9,10,11], ARRAY['White','Blue','Black'], 25, true),

('Gel-Lyte III', 'ASICS', 'Lifestyle', 'Retro running style with split tongue design.', 10999, NULL,
 ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'],
 ARRAY[6,7,8,9,10], ARRAY['Grey','White','Black'], 45, true),

('Curry Flow 10', 'Under Armour', 'Basketball', 'Lightweight basketball shoes with excellent court feel.', 12999, 10999,
 ARRAY['https://images.unsplash.com/photo-1577801842755-3a1e9a1d9f27?w=600&h=600&fit=crop'],
 ARRAY[7,8,9,10,11], ARRAY['White','Blue','Yellow'], 28, true),

('HOVR Machina', 'Under Armour', 'Running', 'Connected running shoes with form coaching.', 11999, NULL,
 ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
 ARRAY[7,8,9,10,11], ARRAY['Black','White','Grey'], 35, true);

-- Note: This seed script is designed to be run once.
-- To re-seed, you would need to clear existing data first or add ON CONFLICT logic.
-- For production use, consider adding a unique constraint on (name, brand) and using ON CONFLICT.