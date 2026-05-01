SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION get_sisa_kuota_ticket_category(p_event_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    event_id UUID,
    event_title VARCHAR,
    quota INTEGER,
    sold_tickets BIGINT,
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
        COUNT(t.ticket_id) AS sold_tickets,
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