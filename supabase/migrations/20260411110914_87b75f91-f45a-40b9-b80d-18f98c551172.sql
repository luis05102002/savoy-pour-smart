-- Create reservation status enum
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');

-- Create zone enum
CREATE TYPE public.bar_zone AS ENUM ('barra', 'terraza', 'salon', 'privado');

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  preferred_zone bar_zone,
  preferred_table INTEGER,
  customer_notes TEXT,
  status reservation_status NOT NULL DEFAULT 'pending',
  staff_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a reservation (public form, no auth required)
CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
TO public
WITH CHECK (true);

-- Only staff can view reservations
CREATE POLICY "Staff can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only staff can update reservations
CREATE POLICY "Staff can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only staff can delete reservations
CREATE POLICY "Staff can delete reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();