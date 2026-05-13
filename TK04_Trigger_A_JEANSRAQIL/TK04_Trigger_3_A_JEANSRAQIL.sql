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
        RAISE EXCEPTION 'ERROR: Artist "%" sudah terdaftar pada event "%".', artist_name, event_title;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_event_artist ON event_artist;

CREATE TRIGGER trg_validate_event_artist
BEFORE INSERT ON event_artist
FOR EACH ROW
EXECUTE FUNCTION validate_event_artist();



CREATE OR REPLACE FUNCTION get_sisa_kuota_ticket_category(p_event_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    event_id UUID,
    event_title VARCHAR,
    quota INTEGER,
    sold_quantity BIGINT,
    remaining_quota BIGINT,
    price NUMERIC
) AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM event e WHERE e.event_id = p_event_id
    ) THEN
        RAISE EXCEPTION 'ERROR: Event dengan ID % tidak ditemukan.', p_event_id;
    END IF;

    RETURN QUERY
    SELECT
        tc.category_id,
        tc.category_name,
        e.event_id,
        e.event_title,
        tc.quota,
        COUNT(t.ticket_id) AS sold_quantity,
        tc.quota - COUNT(t.ticket_id) AS remaining_quota,
        tc.price
    FROM ticket_category tc
    JOIN event e ON e.event_id = tc.event_id
    LEFT JOIN ticket t ON t.tcategory_id = tc.category_id
    WHERE tc.event_id = p_event_id
    GROUP BY
        tc.category_id,
        tc.category_name,
        e.event_id,
        e.event_title,
        tc.quota,
        tc.price
    ORDER BY tc.category_name ASC;
END;
$$ LANGUAGE plpgsql;
