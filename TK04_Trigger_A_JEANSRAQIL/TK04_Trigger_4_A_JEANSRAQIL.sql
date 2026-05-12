SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_venue_delete()
RETURNS TRIGGER AS $$
DECLARE
    venue_name TEXT;
    has_event BOOLEAN;
BEGIN
    SELECT name INTO venue_name FROM venue WHERE venue_id = OLD.venue_id;

    SELECT EXISTS (
        SELECT 1 FROM event WHERE venue_id = OLD.venue_id
    ) INTO has_event;

    IF has_event THEN
        RAISE EXCEPTION 'Venue "%" masih memiliki event aktif sehingga tidak dapat dihapus.', venue_name;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_venue_delete ON venue;

CREATE TRIGGER trg_validate_venue_delete
BEFORE DELETE ON venue
FOR EACH ROW
EXECUTE FUNCTION validate_venue_delete();