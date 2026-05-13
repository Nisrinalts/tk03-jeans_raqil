import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 

    const result = await pool.query(
  `
  SELECT
    e.event_id,
    e.event_title,
    e.event_datetime,
    v.venue_id,
    v.venue_name,
    o.organizer_name
  FROM tiktaktuk.event e
  JOIN tiktaktuk.venue v ON e.venue_id = v.venue_id
  JOIN tiktaktuk.organizer o ON e.organizer_id = o.organizer_id
  WHERE e.event_id = $1;
  `,
  [id]
);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error("FETCH EVENT BY ID ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data event." },
      { status: 500 }
    );
  }
}