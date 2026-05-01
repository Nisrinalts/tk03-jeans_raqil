import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [eventArtistsResult, artistsResult, eventsResult] = await Promise.all([
      pool.query(`
        SELECT
          ea.event_id,
          e.event_title,
          ea.artist_id,
          a.name AS artist_name,
          ea.role
        FROM tiktaktuk.event_artist ea
        JOIN tiktaktuk.event e ON e.event_id = ea.event_id
        JOIN tiktaktuk.artist a ON a.artist_id = ea.artist_id
        ORDER BY e.event_title ASC, a.name ASC;
      `),
      pool.query(`
        SELECT artist_id, name, genre
        FROM tiktaktuk.artist
        ORDER BY name ASC;
      `),
      pool.query(`
        SELECT event_id, event_title
        FROM tiktaktuk.event
        ORDER BY event_title ASC;
      `),
    ]);

    return NextResponse.json({
      eventArtists: eventArtistsResult.rows,
      artists: artistsResult.rows,
      events: eventsResult.rows,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Gagal mengambil data artist event." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, artist_id, role } = body;

    if (!event_id || !artist_id || !role?.trim()) {
      return NextResponse.json(
        { message: "Event, artist, dan role wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO tiktaktuk.event_artist (event_id, artist_id, role)
      VALUES ($1, $2, $3)
      RETURNING event_id, artist_id, role;
      `,
      [event_id, artist_id, role.trim()]
    );

    const inserted = result.rows[0];

    const joinedResult = await pool.query(
      `
      SELECT
        ea.event_id,
        e.event_title,
        ea.artist_id,
        a.name AS artist_name,
        ea.role
      FROM tiktaktuk.event_artist ea
      JOIN tiktaktuk.event e ON e.event_id = ea.event_id
      JOIN tiktaktuk.artist a ON a.artist_id = ea.artist_id
      WHERE ea.event_id = $1 AND ea.artist_id = $2;
      `,
      [inserted.event_id, inserted.artist_id]
    );

    return NextResponse.json(joinedResult.rows[0]);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { message: error.message || "Gagal menambahkan artist ke event." },
      { status: 500 }
    );
  }
}