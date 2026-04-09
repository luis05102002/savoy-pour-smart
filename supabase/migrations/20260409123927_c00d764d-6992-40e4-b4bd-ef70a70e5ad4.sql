
-- 1. Tighten orders INSERT: only allow pending status
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- 2. Add explicit admin-only policies on user_roles
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Restrict staff policies to authenticated only (not anon)
DROP POLICY IF EXISTS "Staff can delete menu items" ON public.menu_items;
CREATE POLICY "Staff can delete menu items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can update menu items" ON public.menu_items;
CREATE POLICY "Staff can update menu items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can insert menu items" ON public.menu_items;
CREATE POLICY "Staff can insert menu items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- 4. Restrict staff order policies to authenticated only
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- 5. Restrict user_roles SELECT to authenticated only  
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Storage: restrict staff policies to authenticated
DROP POLICY IF EXISTS "Staff can delete drink images" ON storage.objects;
CREATE POLICY "Staff can delete drink images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'drink-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

DROP POLICY IF EXISTS "Staff can update drink images" ON storage.objects;
CREATE POLICY "Staff can update drink images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'drink-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

DROP POLICY IF EXISTS "Staff can upload drink images" ON storage.objects;
CREATE POLICY "Staff can upload drink images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'drink-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
