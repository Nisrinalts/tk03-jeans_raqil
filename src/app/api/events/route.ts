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
        COALESCE(
          (SELECT ARRAY_AGG(ea.artist_id) FROM tiktaktuk.event_artist ea WHERE ea.event_id = e.event_id),
          ARRAY[]::uuid[]
        ) AS artist_ids,
        COALESCE(
          (SELECT ARRAY_AGG(a.name) FROM tiktaktuk.event_artist ea
           JOIN tiktaktuk.artist a ON ea.artist_id = a.artist_id
           WHERE ea.event_id = e.event_id),
          ARRAY[]::varchar[]
        ) AS artist_names,
        COALESCE(
          (SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'category_id', tc.category_id,
            'category_name', tc.category_name,
            'price', tc.price::float,
            'quota', tc.quota
          ) ORDER BY tc.category_name) FROM tiktaktuk.ticket_category tc WHERE tc.event_id = e.event_id),
          '[]'::json
        ) AS categories
      FROM tiktaktuk.event e
      JOIN tiktaktuk.venue v ON e.venue_id = v.venue_id
      JOIN tiktaktuk.organizer o ON e.organizer_id = o.organizer_id
      GROUP BY e.event_id, v.venue_name;
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
    const { event_title, event_datetime, venue_id, organizer_id, artist_ids, categories } = body;

    const result = await pool.query(
      `INSERT INTO tiktaktuk.event (event_title, event_datetime, venue_id, organizer_id)
       VALUES ($1, $2, $3, $4) RETURNING event_id;`,
      [event_title, event_datetime, venue_id, organizer_id]
    );

    const event_id = result.rows[0].event_id;

    if (Array.isArray(artist_ids) && artist_ids.length > 0) {
      for (const aid of artist_ids) {
        await pool.query(
          `INSERT INTO tiktaktuk.event_artist (event_id, artist_id, role) VALUES ($1, $2, 'Main Artist');`,
          [event_id, aid]
        );
      }
    }

    if (Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        await pool.query(
          `INSERT INTO tiktaktuk.ticket_category (category_id, category_name, quota, price, event_id)
           VALUES (gen_random_uuid(), $1, $2, $3, $4);`,
          [cat.category_name, Number(cat.quota), Number(cat.price), event_id]
        );
      }
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
    const { event_id, event_title, event_datetime, venue_id, organizer_id, artist_ids, categories } = body;

    await client.query("BEGIN");

    await client.query(
      `UPDATE tiktaktuk.event SET event_title = $2, event_datetime = $3, venue_id = $4, organizer_id = $5 WHERE event_id = $1;`,
      [event_id, event_title, event_datetime, venue_id, organizer_id]
    );

    if (Array.isArray(artist_ids)) {
      await client.query(`DELETE FROM tiktaktuk.event_artist WHERE event_id = $1;`, [event_id]);
      for (const aid of artist_ids) {
        await client.query(
          `INSERT INTO tiktaktuk.event_artist (event_id, artist_id, role) VALUES ($1, $2, 'Main Artist');`,
          [event_id, aid]
        );
      }
    }

    if (Array.isArray(categories)) {
      // Existing category_ids di DB untuk event ini
      const existingRes = await client.query(
        `SELECT category_id FROM tiktaktuk.ticket_category WHERE event_id = $1;`,
        [event_id]
      );
      const existingIds = new Set<string>(existingRes.rows.map((r: { category_id: string }) => r.category_id));
      const payloadIds = new Set<string>(
        categories.filter((c: { category_id?: string }) => c.category_id).map((c: { category_id: string }) => c.category_id)
      );

      // DELETE: yang ada di DB tapi tidak ada di payload
      for (const id of existingIds) {
        if (!payloadIds.has(id)) {
          await client.query(`DELETE FROM tiktaktuk.ticket_category WHERE category_id = $1;`, [id]);
        }
      }

      // UPDATE existing, INSERT new
      for (const cat of categories) {
        if (cat.category_id && existingIds.has(cat.category_id)) {
          await client.query(
            `UPDATE tiktaktuk.ticket_category SET category_name = $1, quota = $2, price = $3 WHERE category_id = $4;`,
            [cat.category_name, Number(cat.quota), Number(cat.price), cat.category_id]
          );
        } else {
          await client.query(
            `INSERT INTO tiktaktuk.ticket_category (category_id, category_name, quota, price, event_id)
             VALUES (gen_random_uuid(), $1, $2, $3, $4);`,
            [cat.category_name, Number(cat.quota), Number(cat.price), event_id]
          );
        }
      }
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
