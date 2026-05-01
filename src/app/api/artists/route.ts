import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT artist_id, name, genre
      FROM tiktaktuk.artist
      ORDER BY name ASC;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data artist." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, genre } = body;

    const result = await pool.query(
      `
      INSERT INTO tiktaktuk.artist (artist_id, name, genre)
      VALUES ($1, $2, $3)
      RETURNING artist_id, name, genre;
      `,
      [crypto.randomUUID(), name, genre || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan artist." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { artist_id, name, genre } = body;

    const result = await pool.query(
      `
      UPDATE tiktaktuk.artist
      SET name = $2,
          genre = $3
      WHERE artist_id = $1
      RETURNING artist_id, name, genre;
      `,
      [artist_id, name, genre || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Artist tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal memperbarui artist." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { artist_id } = body;

    const result = await pool.query(
      `
      DELETE FROM tiktaktuk.artist
      WHERE artist_id = $1
      RETURNING artist_id, name, genre;
      `,
      [artist_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Artist tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus artist." },
      { status: 500 }
    );
  }
}