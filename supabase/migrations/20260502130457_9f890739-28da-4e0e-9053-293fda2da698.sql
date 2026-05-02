-- Drop the security-definer view and replace with a SECURITY INVOKER function
DROP VIEW IF EXISTS public.booked_slots;

CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE (scheduled_at TIMESTAMPTZ, duration_minutes INT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT scheduled_at, duration_minutes
  FROM public.bookings
  WHERE status IN ('pending','accepted')
    AND scheduled_at >= now();
$$;

-- Allow public read of just the slot times via a permissive SELECT policy scoped to the function context.
-- Since the function uses SECURITY INVOKER, we need an RLS policy permitting anon to read non-PII.
-- Simpler: keep the function SECURITY DEFINER but only return non-PII columns, then revoke public exec on has_role.
DROP FUNCTION IF EXISTS public.get_booked_slots();

CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE (scheduled_at TIMESTAMPTZ, duration_minutes INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT scheduled_at, duration_minutes
  FROM public.bookings
  WHERE status IN ('pending','accepted')
    AND scheduled_at >= now();
$$;

REVOKE ALL ON FUNCTION public.get_booked_slots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots() TO anon, authenticated;

-- Lock down has_role: only callable from server-side / definer contexts via grants
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;