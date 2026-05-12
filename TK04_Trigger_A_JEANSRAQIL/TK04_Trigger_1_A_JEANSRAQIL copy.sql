SET search_path TO tiktaktuk;

CREATE OR REPLACE FUNCTION validate_username_chars()
RETURNS TRIGGER AS $$
BEGIN
    -- Cek karakter spesial: hanya boleh a-z, A-Z, 0-9
    IF NEW.username !~ '^[a-zA-Z0-9]+$' THEN
        RAISE EXCEPTION 'ERROR: Username "%" hanya boleh mengandung huruf dan angka tanpa simbol atau spasi.', NEW.username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_username_chars ON user_account;

CREATE TRIGGER trg_validate_username_chars
BEFORE INSERT ON user_account
FOR EACH ROW
EXECUTE FUNCTION validate_username_chars();

CREATE OR REPLACE FUNCTION validate_username_unique()
RETURNS TRIGGER AS $$
BEGIN
    -- Cek duplikat username (case-insensitive)
    IF EXISTS (
        SELECT 1
        FROM user_account u
        WHERE LOWER(u.username) = LOWER(NEW.username)
    ) THEN
        RAISE EXCEPTION 'ERROR: Username "%" sudah terdaftar, gunakan username lain.', NEW.username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_username_unique ON user_account;

CREATE TRIGGER trg_validate_username_unique
BEFORE INSERT ON user_account
FOR EACH ROW
EXECUTE FUNCTION validate_username_unique();


CREATE OR REPLACE PROCEDURE register_user(
    p_user_id UUID,
    p_username VARCHAR,
    p_password VARCHAR,
    p_role VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Trigger trg_validate_username_chars dan trg_validate_username_unique
    -- akan otomatis dipanggil sebelum INSERT.
    INSERT INTO user_account (user_id, username, password, role)
    VALUES (p_user_id, p_username, p_password, p_role);
END;
$$;
