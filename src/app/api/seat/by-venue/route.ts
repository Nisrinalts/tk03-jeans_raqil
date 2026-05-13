import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venue_id = searchParams.get("venue_id");

    if (!venue_id) {
      return NextResponse.json(
        { message: "venue_id wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
        s.seat_id,
        s.section,
        s.seat_number,
        s.row_number,
        CASE
          WHEN s.seat_id IN (
            SELECT seat_id FROM tiktaktuk.has_relationship
          ) THEN 'Terisi'
          ELSE 'Tersedia'
        END AS status
      FROM tiktaktuk.seat s
      WHERE s.venue_id = ${venue_id}
      ORDER BY s.section ASC, s.row_number ASC, s.seat_number ASC;
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data seat." },
      { status: 500 }
    );
  }
}