SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_seat_delete()
RETURNS TRIGGER AS $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM tiktaktuk.ticket t
        JOIN tiktaktuk.has_relationship hr ON t.ticket_id = hr.ticket_id
        JOIN tiktaktuk.seat s ON hr.seat_id = s.seat_id
        WHERE s.seat_id = OLD.seat_id
    ) THEN
        RAISE EXCEPTION 'ERROR: Kursi % - Baris % - No.% Tidak dapat dihapus karena udah terisi.', OLD.section, OLD.row_number, OLD.seat_number;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validate_seat_delete
BEFORE DELETE ON seat
FOR EACH ROW
EXECUTE FUNCTION validate_seat_delete();

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