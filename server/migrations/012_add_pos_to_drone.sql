ALTER TABLE public.drone
  ADD COLUMN IF NOT EXISTS pos geometry(Point,4326);