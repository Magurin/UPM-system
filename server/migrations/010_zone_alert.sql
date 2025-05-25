CREATE TABLE public.zone_alert (
  id          SERIAL PRIMARY KEY,
  drone_id    INT REFERENCES public.drone(id) ON DELETE CASCADE,
  zone_id     INT REFERENCES public.zone(id)  ON DELETE CASCADE,
  entered_at  TIMESTAMP DEFAULT now()
);