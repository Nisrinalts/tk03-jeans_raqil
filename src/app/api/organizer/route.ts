import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json(
      { error: "user_id wajib disertakan." },
      { status: 400 }
    );
  }

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM tiktaktuk.organizer
      WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "organizer tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil organizer." },
      { status: 500 }
    );
  }
}