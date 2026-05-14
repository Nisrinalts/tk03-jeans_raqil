CREATE OR REPLACE FUNCTION tiktaktuk.validate_username_chars()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.username !~ '^[a-zA-Z0-9]+$' THEN
        RAISE EXCEPTION 'ERROR: Username "%" hanya boleh mengandung huruf dan angka tanpa simbol atau spasi.', NEW.username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_username_chars ON tiktaktuk.user_account;

CREATE TRIGGER trg_validate_username_chars
BEFORE INSERT ON tiktaktuk.user_account
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_username_chars();


CREATE OR REPLACE FUNCTION tiktaktuk.validate_username_unique()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM tiktaktuk.user_account u
        WHERE LOWER(u.username) = LOWER(NEW.username)
    ) THEN
        RAISE EXCEPTION 'ERROR: Username "%" sudah terdaftar, gunakan username lain.', NEW.username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_username_unique ON tiktaktuk.user_account;

CREATE TRIGGER trg_validate_username_unique
BEFORE INSERT ON tiktaktuk.user_account
FOR EACH ROW
EXECUTE FUNCTION tiktaktuk.validate_username_unique();

CREATE OR REPLACE PROCEDURE tiktaktuk.register_user(
    p_user_id UUID,
    p_username VARCHAR,
    p_password VARCHAR,
    p_role VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id UUID;
BEGIN

    SELECT role_id INTO v_role_id
    FROM tiktaktuk.role
    WHERE LOWER(role_name) = LOWER(p_role);

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: Role "%" tidak ditemukan. Role valid: admin, organizer, customer.', p_role;
    END IF;

    INSERT INTO tiktaktuk.user_account (user_id, username, password)
    VALUES (p_user_id, p_username, p_password);

    INSERT INTO tiktaktuk.account_role (role_id, user_id)
    VALUES (v_role_id, p_user_id);
END;
$$;
