ALTER TABLE public.drone
  ADD COLUMN IF NOT EXISTS pos geography(POINT, 4326);