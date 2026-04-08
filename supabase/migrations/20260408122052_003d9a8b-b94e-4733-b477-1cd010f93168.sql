
-- 1. user_roles: allow users to read their own role
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. menu_items: replace permissive policies with role-based ones
DROP POLICY IF EXISTS "Staff can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Staff can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Staff can delete menu items" ON public.menu_items;

CREATE POLICY "Staff can insert menu items"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can update menu items"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can delete menu items"
ON public.menu_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- 3. orders: replace permissive policies with role-based ones
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;

CREATE POLICY "Staff can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
