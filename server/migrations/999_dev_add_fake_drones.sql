DO $$
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO public.drone (brand, model, serial_number, pilot_id)
    VALUES ('Sim', 'v' || i, 'SIM-'||i, 1)      -- пилот 1 = ваш тестовый
    ON CONFLICT (serial_number) DO NOTHING;
  END LOOP;
END $$;
