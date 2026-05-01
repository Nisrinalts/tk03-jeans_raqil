import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { message: "Event wajib dipilih." },
        { status: 400 }
      );
    }

    const result = await pool.query(
  `SELECT * FROM tiktaktuk.get_sisa_kuota_ticket_category($1);`,
  [event_id]
);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error.message || "Gagal mengambil sisa kuota ticket category.",
      },
      { status: 500 }
    );
  }
}