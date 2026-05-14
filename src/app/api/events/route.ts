import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        e.event_id,
        e.event_title,
        e.event_datetime,
        e.venue_id,
        v.venue_name,
        e.organizer_id,
        ea.artist_id,
        ARRAY_AGG(tc.category_id) as category_ids,
        ARRAY_AGG(tc.category_name) as category_names
      FROM tiktaktuk.event e
      JOIN tiktaktuk.venue v ON e.venue_id = v.venue_id
      JOIN tiktaktuk.organizer o ON e.organizer_id = o.organizer_id
      LEFT JOIN tiktaktuk.event_artist ea ON e.event_id = ea.event_id
      LEFT JOIN tiktaktuk.artist a ON ea.artist_id = a.artist_id
      LEFT JOIN tiktaktuk.ticket_category tc ON e.event_id = tc.event_id
      GROUP BY e.event_id, v.venue_name, ea.artist_id;
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data event.", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_title, description, event_datetime, venue_id, organizer_id, artist_id } = body;

    const result = await pool.query(
      `INSERT INTO tiktaktuk.event (event_title, description, event_datetime, venue_id, organizer_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING event_id;`,
      [event_title, description, event_datetime, venue_id, organizer_id]
    );

    const event_id = result.rows[0].event_id;

    if (artist_id) {
      await pool.query(
        `INSERT INTO tiktaktuk.event_artist (event_id, artist_id, role) VALUES ($1, $2, 'Main Artist');`,
        [event_id, artist_id]
      );
    }

    return NextResponse.json({ event_id });
  } catch (error: unknown) {
    console.error("Database Error:", error);
    return NextResponse.json({ message: "Gagal membuat event." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { event_id, event_title, description, event_datetime, venue_id, organizer_id, artist_id } = body;

    await client.query("BEGIN");

    await client.query(
      `UPDATE tiktaktuk.event SET event_title = $2, description = $3, event_datetime = $4, venue_id = $5, organizer_id = $6 WHERE event_id = $1;`,
      [event_id, event_title, description, event_datetime, venue_id, organizer_id]
    );

    if (artist_id) {
      await client.query(`DELETE FROM tiktaktuk.event_artist WHERE event_id = $1;`, [event_id]);
      await client.query(
        `INSERT INTO tiktaktuk.event_artist (event_id, artist_id, role) VALUES ($1, $2, 'Main Artist');`,
        [event_id, artist_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Event updated" });
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    console.error("Database Error:", error);
    return NextResponse.json({ message: "Gagal memperbarui event." }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE handler removed as per requirement: events cannot be deleted
