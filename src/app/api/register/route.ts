import { NextResponse } from "next/server";
import pool from "@/lib/db";

type RegisterBody = {
  username?: string;
  password?: string;
  role?: "admin" | "organizer" | "customer";
  full_name?: string;
  phone_number?: string;
  organizer_name?: string;
  contact_email?: string;
};

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { message: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const { username, password, role } = body;

  if (!username || !password || !role) {
    return NextResponse.json(
      { message: "username, password, dan role wajib diisi." },
      { status: 400 }
    );
  }

  if (role !== "admin" && role !== "organizer" && role !== "customer") {
    return NextResponse.json(
      { message: "Role tidak valid." },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    const userId = crypto.randomUUID();

    // Panggil stored procedure register_user.
    // Validasi (karakter spesial + duplikat username) dilakukan oleh
    // TRIGGER trg_validate_username_register di dalam database.
    // Jika trigger melempar RAISE EXCEPTION, pg driver akan throw error
    // dengan .message berisi pesan dari trigger — pesan itu kita
    // teruskan apa adanya ke frontend.
    await client.query("CALL tiktaktuk.register_user($1, $2, $3, $4)", [
      userId,
      username,
      password,
      role,
    ]);

    // Optional: simpan profile tambahan ke tabel customer / organizer
    // (jika tabel-nya ada). Dibungkus try-catch agar tidak gagal kalau
    // tabel belum tersedia.
    if (role === "customer" && body.full_name) {
      try {
        await client.query(
          `INSERT INTO tiktaktuk.customer (customer_id, user_id, full_name, phone_number)
           VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), userId, body.full_name, body.phone_number ?? null]
        );
      } catch (e) {
        console.error("Gagal insert customer profile:", e);
      }
    } else if (role === "organizer" && body.organizer_name) {
      try {
        await client.query(
          `INSERT INTO tiktaktuk.organizer (organizer_id, user_id, organizer_name, contact_email)
           VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), userId, body.organizer_name, body.contact_email ?? null]
        );
      } catch (e) {
        console.error("Gagal insert organizer profile:", e);
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      username,
      role,
    });
  } catch (error: unknown) {
    // Ambil pesan error langsung dari trigger / procedure PostgreSQL.
    // Pesan ini sudah dalam format "ERROR: ..." sesuai spesifikasi.
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Pendaftaran gagal.";

    console.error("Register error:", message);

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}
