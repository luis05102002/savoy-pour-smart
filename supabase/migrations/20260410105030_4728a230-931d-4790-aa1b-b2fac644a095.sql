
-- Restrict realtime subscriptions on the orders channel to staff/admin only
CREATE POLICY "Only staff can subscribe to orders realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'staff')
  )
);
