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