SET search_path TO tiktaktuk;

-- ============================================================
-- TRIGGER: Validasi username saat register
-- 1. Username harus unik (case-insensitive)
-- 2. Username hanya boleh huruf (a-z, A-Z) dan angka (0-9)
-- ============================================================

CREATE OR REPLACE FUNCTION validate_username_register()
RETURNS TRIGGER AS $$
BEGIN
    -- Cek karakter spesial: hanya boleh a-z, A-Z, 0-9
    IF NEW.username !~ '^[a-zA-Z0-9]+$' THEN
        RAISE EXCEPTION 'ERROR: Username "%" hanya boleh mengandung huruf dan angka tanpa simbol atau spasi.', NEW.username;
    END IF;

    -- Cek duplikat username (case-insensitive)
    IF EXISTS (
        SELECT 1
        FROM users u
        WHERE LOWER(u.username) = LOWER(NEW.username)
    ) THEN
        RAISE EXCEPTION 'ERROR: Username "%" sudah terdaftar, gunakan username lain.', NEW.username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_username_register ON users;

CREATE TRIGGER trg_validate_username_register
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION validate_username_register();


-- ============================================================
-- STORED PROCEDURE: Register user baru
-- Procedure akan INSERT ke tabel users, lalu trigger di atas
-- akan otomatis melakukan validasi. Jika validasi gagal,
-- procedure akan melempar exception yang sama (di-bubble-up).
-- ============================================================

CREATE OR REPLACE PROCEDURE register_user(
    p_user_id UUID,
    p_username VARCHAR,
    p_password VARCHAR,
    p_role VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Trigger trg_validate_username_register akan otomatis dipanggil
    -- sebelum INSERT. Jika ada pelanggaran (karakter spesial atau
    -- username duplikat), trigger akan RAISE EXCEPTION dan
    -- procedure ini akan ikut gagal dengan pesan error yang sama.
    INSERT INTO users (user_id, username, password, role)
    VALUES (p_user_id, p_username, p_password, p_role);
END;
$$;
