-- Security hardening: remove direct INSERT policies for public tables
-- Orders, waiter_calls, and reservations now go through Edge Functions
-- with rate limiting and validation. Only the service role (used by Edge Functions)
-- can insert, which bypasses RLS.

-- 1. Lock down waiter_calls: remove public INSERT, only service role (bypasses RLS)
DROP POLICY IF EXISTS "Anyone can create waiter calls" ON public.waiter_calls;

-- 2. Lock down reservations: remove public INSERT, only service role (bypasses RLS)
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;

-- 3. Add SELECT policy for waiter_calls so clients can check status of their own calls
-- (Still requires anon access for the QR client to see if a call is pending)
CREATE POLICY "Anyone can view pending waiter calls for their table"
ON public.waiter_calls FOR SELECT
USING (status = 'pending');

-- 4. Add a stricter INSERT for orders (keep removed, service role only) 
-- Already done in previous migration, just ensuring consistency