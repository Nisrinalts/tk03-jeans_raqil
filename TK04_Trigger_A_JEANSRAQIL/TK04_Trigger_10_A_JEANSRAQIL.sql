SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_category_capacity()
RETURNS TRIGGER AS $$ 
DECLARE
    sold_count BIGINT;
    BEGIN
    SELECT COUNT(*) INTO sold_count
    FROM tiktaktuk.ticket t
    WHERE t.tcategory_id = NEW.category_id; 
    IF sold_count >= (SELECT quota FROM tiktaktuk.ticket_category WHERE category_id = NEW.category_id) THEN
        RAISE EXCEPTION 'ERROR: Kuota kategori tiket % sudah penuh. Tidak dapat membuat tiket baru.', **NEW.category_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validate_category_capacity
BEFORE INSERT ON tiktaktuk.ticket
FOR EACH ROW
EXECUTE FUNCTION validate_category_capacity();