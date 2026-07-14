-- Allow admins to read all profiles
CREATE POLICY IF NOT EXISTS "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to update all profiles  
CREATE POLICY IF NOT EXISTS "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to read all orders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    -- Check if policy exists first
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can read all orders') THEN
      EXECUTE 'CREATE POLICY "Admins can read all orders" ON orders FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can update all orders') THEN
      EXECUTE 'CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can delete orders') THEN
      EXECUTE 'CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
  END IF;
END $$;

-- Allow admins to manage all order_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admins can read all order_items') THEN
      EXECUTE 'CREATE POLICY "Admins can read all order_items" ON order_items FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
  END IF;
END $$;

-- Allow admins full access to products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can manage products') THEN
      EXECUTE 'CREATE POLICY "Admins can manage products" ON products FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
  END IF;
END $$;

-- Allow admins full access to categories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Admins can manage categories') THEN
      EXECUTE 'CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = ''admin'')';
    END IF;
  END IF;
END $$;
