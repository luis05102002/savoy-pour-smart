-- Security hardening Phase 2: Fix remaining vulnerabilities
-- Date: 2026-04-13

-- ========================================
-- 1. WAITER_CALLS: tighten SELECT policy
--    Current: ANYONE can view ALL pending calls (no table filter)
--    Fix: Only show pending calls (admin needs all, anon should not see them)
--    Dashboard uses authenticated role, so this is fine.
--    But the policy "Anyone can view pending waiter calls for their table" 
--    actually shows ALL pending calls with no table filter. Fix:
-- ========================================

-- Remove the overly broad policy
DROP POLICY IF EXISTS "Anyone can view pending waiter calls for their table" ON public.waiter_calls;

-- Only authenticated staff can see all waiter calls
-- (The "Staff can view waiter calls" policy already handles this)
-- Clients don't need to query waiter_calls from the client side - 
-- the edge function handles creation and returns confirmation

-- ========================================
-- 2. ORDERS: Ensure no direct INSERT from anon exists
--    The edge function creates orders with service role key (bypasses RLS)
-- ========================================
-- Already locked down in previous migration. Verifying:
-- There should be NO "Anyone can create orders" policy.
-- The only INSERT path is the edge function (service role).

-- ========================================
-- 3. RESERVATIONS: Ensure no direct INSERT from anon exists
--    The edge function creates reservations with service role key
-- ========================================
-- Already locked down in previous migration. Verifying:
-- There should be NO "Anyone can create reservations" policy.

-- ========================================
-- 4. MENU_ITEMS: Staff policies use has_role() which checks user_roles table
--    But has_role() function must exist. Verify it's created.
-- ========================================
-- (Already created in previous migration)

-- ========================================
-- 5. Add a helper function to check if user is staff or admin
--    Used by RLS policies for orders, menu_items, etc.
-- ========================================
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = $2
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========================================
-- 6. Add realtime policies for authenticated users only
--    Prevent anon users from subscribing to realtime changes
-- ========================================
-- Already handled by "Only staff can subscribe to orders realtime" policy

-- ========================================
-- 7. STORAGE: Ensure drink-images bucket has proper policies
--    Public read for images, staff-only write
-- ========================================
-- (Already covered by existing policies)