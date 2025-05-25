CREATE OR REPLACE FUNCTION check_zone_violation()
RETURNS TRIGGER AS $$
DECLARE
  z_id int;
BEGIN
  -- ищем первую пересекаемую зону
  SELECT id INTO z_id
  FROM public.zone
  WHERE ST_Intersects(geom, NEW.pos)
  LIMIT 1;

  IF z_id IS NOT NULL THEN
    INSERT INTO public.zone_alert(drone_id, zone_id) VALUES (NEW.id, z_id);
    PERFORM pg_notify('zone_alert', json_build_object(
      'droneId', NEW.id,
      'zoneId',  z_id
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_drone_pos ON public.drone;
CREATE TRIGGER trg_drone_pos
AFTER UPDATE OF pos ON public.drone
FOR EACH ROW EXECUTE FUNCTION check_zone_violation();