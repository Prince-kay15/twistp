
-- Drop unused zoom columns
ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS zoom_start_url,
  DROP COLUMN IF EXISTS zoom_join_url,
  DROP COLUMN IF EXISTS zoom_meeting_id;

-- Tighten anon insert policy on bookings
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;

CREATE POLICY "Public can submit bookings with valid data"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(name, '')) BETWEEN 1 AND 100
    AND char_length(coalesce(email, '')) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(coalesce(message, '')) <= 5000
    AND scheduled_at > now()
  );

-- Tighten function exec
REVOKE EXECUTE ON FUNCTION public.get_booked_slots() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots() TO authenticated, service_role;
