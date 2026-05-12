SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_venue_name_city()
RETURNS TRIGGER AS $$
DECLARE
    existing_id UUID;
BEGIN
    SELECT venue_id INTO existing_id
    FROM venue
    WHERE LOWER(name) = LOWER(NEW.name)
      AND LOWER(city) = LOWER(NEW.city)
      AND venue_id != COALESCE(NEW.venue_id, '00000000-0000-0000-0000-000000000000');

    IF existing_id IS NOT NULL THEN
        RAISE EXCEPTION 'Venue "%" di kota "%" sudah terdaftar dengan ID %.', NEW.name, NEW.city, existing_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_venue_name_city ON venue;

CREATE TRIGGER trg_validate_venue_name_city
BEFORE INSERT OR UPDATE ON venue
FOR EACH ROW
EXECUTE FUNCTION validate_venue_name_city();

