CREATE OR REPLACE FUNCTION tiktaktuk.validate_venue_name_city()
RETURNS TRIGGER AS $$
DECLARE
    existing_id UUID;
BEGIN
    SELECT venue_id INTO existing_id
    FROM tiktaktuk.venue
    WHERE LOWER(venue_name) = LOWER(NEW.venue_name)
      AND LOWER(city) = LOWER(NEW.city)
      AND venue_id != COALESCE(NEW.venue_id, '00000000-0000-0000-0000-000000000000');

    IF existing_id IS NOT NULL THEN
        RAISE EXCEPTION 'Venue "%" di kota "%" sudah terdaftar dengan ID %.', NEW.venue_name, NEW.city, existing_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_venue_name_city ON tiktaktuk.venue;

CREATE TRIGGER trg_validate_venue_name_city
BEFORE INSERT OR UPDATE ON tiktaktuk.venue
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_venue_name_city();


CREATE OR REPLACE FUNCTION tiktaktuk.validate_venue_delete()
RETURNS TRIGGER AS $$
DECLARE
    v_venue_name TEXT;
    has_event BOOLEAN;
BEGIN
    SELECT venue_name INTO v_venue_name
    FROM tiktaktuk.venue
    WHERE venue_id = OLD.venue_id;

    SELECT EXISTS (
        SELECT 1 FROM tiktaktuk.event WHERE venue_id = OLD.venue_id
    ) INTO has_event;

    IF has_event THEN
        RAISE EXCEPTION 'Venue "%" masih memiliki event aktif sehingga tidak dapat dihapus.', v_venue_name;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_venue_delete ON tiktaktuk.venue;

CREATE TRIGGER trg_validate_venue_delete
BEFORE DELETE ON tiktaktuk.venue
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_venue_delete();
