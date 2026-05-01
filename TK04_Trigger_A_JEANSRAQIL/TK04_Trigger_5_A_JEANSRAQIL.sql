SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_event_artist()
RETURNS TRIGGER AS $$
DECLARE
    artist_name TEXT;
    event_title TEXT;
BEGIN
    SELECT name INTO artist_name
    FROM artist
    WHERE artist_id = NEW.artist_id;

    IF artist_name IS NULL THEN
        RAISE EXCEPTION 'ERROR: Artist dengan ID % tidak ditemukan.', NEW.artist_id;
    END IF;

    SELECT e.event_title INTO event_title
    FROM event e
    WHERE e.event_id = NEW.event_id;

    IF event_title IS NULL THEN
        RAISE EXCEPTION 'ERROR: Event dengan ID % tidak ditemukan.', NEW.event_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM event_artist ea
        WHERE ea.artist_id = NEW.artist_id
          AND ea.event_id = NEW.event_id
    ) THEN
        RAISE EXCEPTION 'ERROR: Artist "%" sudah terdaftar pada event "%"', artist_name, event_title;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_event_artist ON event_artist;

CREATE TRIGGER trg_validate_event_artist
BEFORE INSERT ON event_artist
FOR EACH ROW
EXECUTE FUNCTION validate_event_artist();