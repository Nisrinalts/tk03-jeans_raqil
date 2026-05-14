SET search_path TO tiktaktuk;
CREATE OR REPLACE FUNCTION tiktaktuk.validate_promotion_usage()
RETURNS TRIGGER AS
$$
DECLARE
    promo_data RECORD;
    total_usage INTEGER;
BEGIN

    RAISE NOTICE 'TRIGGER validate_promotion_usage DIJALANKAN';

    IF NEW.promotion_id IS NULL THEN
        RAISE NOTICE 'promotion_id NULL';
        RETURN NEW;
    END IF;

    SELECT *
    INTO promo_data
    FROM tiktaktuk.promotion
    WHERE promotion_id = NEW.promotion_id;

    IF NOT FOUND THEN
        RAISE NOTICE 'Promo tidak ditemukan';

        RAISE EXCEPTION
        'ERROR: Promotion dengan ID % tidak ditemukan.',
        NEW.promotion_id;
    END IF;

    RAISE NOTICE 'Promo ditemukan: %', promo_data.promo_code;

    SELECT COUNT(*)
    INTO total_usage
    FROM tiktaktuk.order_promotion
    WHERE promotion_id = NEW.promotion_id;

    RAISE NOTICE 'Total usage: %', total_usage;

    IF total_usage >= promo_data.usage_limit THEN
        RAISE NOTICE 'Kuota promo habis';

        RAISE EXCEPTION
        'ERROR: Promotion "%" telah mencapai batas maksimum penggunaan.',
        promo_data.promo_code;
    END IF;

    RAISE NOTICE 'Promo valid';

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_promotion_usage
BEFORE INSERT OR UPDATE
ON tiktaktuk.order_promotion
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_promotion_usage();

CREATE OR REPLACE FUNCTION tiktaktuk.validate_promotion_order_date()
RETURNS TRIGGER AS
$$
DECLARE
    promo_data RECORD;
    current_order_date DATE;
BEGIN

    RAISE NOTICE 'TRIGGER validate_promotion_order_date DIJALANKAN';

    IF NEW.promotion_id IS NULL THEN
        RAISE NOTICE 'promotion_id NULL';
        RETURN NEW;
    END IF;

    SELECT *
    INTO promo_data
    FROM tiktaktuk.promotion
    WHERE promotion_id = NEW.promotion_id;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    SELECT order_date::DATE
    INTO current_order_date
    FROM tiktaktuk."order"
    WHERE order_id = NEW.order_id;

    RAISE NOTICE 'Order date: %', current_order_date;

    IF current_order_date < promo_data.start_date
       OR current_order_date > promo_data.end_date THEN

        RAISE NOTICE 'Promo tidak berlaku untuk tanggal order ini';

        RAISE EXCEPTION
        'ERROR: Promotion "%" tidak berlaku untuk tanggal event ini.',
        promo_data.promo_code;
    END IF;

    RAISE NOTICE 'Tanggal promo valid';

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_promotion_order_date
BEFORE INSERT OR UPDATE
ON tiktaktuk.order_promotion
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_promotion_order_date();