
-- Remove the direct INSERT policy for anon/authenticated since orders now go through the edge function
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Add a service-role-only insert policy (edge function uses service role key)
-- No explicit policy needed since service role bypasses RLS
