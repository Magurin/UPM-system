DROP TABLE IF EXISTS public.zone CASCADE;
CREATE TABLE public.zone (
  id          SERIAL PRIMARY KEY,
  name        TEXT,
  geom        geography(MULTIPOLYGON, 4326) NOT NULL,
  created_at  TIMESTAMP DEFAULT now()
);