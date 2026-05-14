import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  try {
    if (userId) {
      const result = await pool.query(
        `SELECT * FROM tiktaktuk.organizer WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "organizer tidak ditemukan." },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    }

    const result = await pool.query(
      `SELECT o.organizer_id, o.user_id, u.username
       FROM tiktaktuk.organizer o
       JOIN tiktaktuk.user_account u ON o.user_id = u.user_id
       ORDER BY u.username ASC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil organizer." },
      { status: 500 }
    );
  }
}
