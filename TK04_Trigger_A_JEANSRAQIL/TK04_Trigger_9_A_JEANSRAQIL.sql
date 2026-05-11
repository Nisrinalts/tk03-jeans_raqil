SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_seat_delete()
RETURNS TRIGGER AS $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM ticket t
        JOIN seat s ON t.seat_id = s.seat_id
        WHERE s.seat_id = OLD.seat_id
    ) THEN
        RAISE EXCEPTION 'ERROR: Kursi % - Baris % - No.% Tidak dapat dihapus karenas udah terisi.', OLD.section, OLD.row_number, OLD.seat_number;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_seat_delete
BEFORE DELETE ON seat
FOR EACH ROW
EXECUTE FUNCTION validate_seat_delete();