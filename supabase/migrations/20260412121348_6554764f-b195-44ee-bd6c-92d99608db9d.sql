
CREATE TABLE public.waiter_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create waiter calls"
ON public.waiter_calls FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Staff can view waiter calls"
ON public.waiter_calls FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update waiter calls"
ON public.waiter_calls FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can delete waiter calls"
ON public.waiter_calls FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_calls;
