import { NextResponse } from "next/server";
import pool from "@/lib/db";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM tiktaktuk.venue;`);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Gagal mengambil data venue.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, address, capacity } = body;

    if (!name || !city || !address || capacity === undefined) {
      return NextResponse.json(
        { message: "Nama, kota, alamat, dan kapasitas wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO tiktaktuk.venue (venue_id, venue_name, city, address, capacity) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *;`,
      [name, city, address, capacity]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Gagal menambahkan venue.") },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { venue_id, name, city, address, capacity } = body;

    if (!venue_id) {
      return NextResponse.json(
        { message: "ID Venue wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE tiktaktuk.venue SET venue_name = $2, city = $3, address = $4, capacity = $5 WHERE venue_id = $1 RETURNING *;`,
      [venue_id, name, city, address, capacity]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Venue tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Gagal memperbarui venue.") },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { venue_id } = body;

    if (!venue_id) {
      return NextResponse.json(
        { message: "ID Venue wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM tiktaktuk.venue WHERE venue_id = $1 RETURNING *;`,
      [venue_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Venue tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Gagal menghapus venue.") },
      { status: 400 }
    );
  }
}