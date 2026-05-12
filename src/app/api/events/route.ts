import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET() {
  try {
    const result = await sql`SELECT * FROM tiktaktuk.event;`;

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data event." },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_name, venue_name, event_date } = body;

    if (!event_name || !String(event_name).trim()) {
      return NextResponse.json(
        { message: "Nama Event wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tiktaktuk.event (event_id, event_name, venue_name, event_date)
      VALUES (${crypto.randomUUID()}, ${String(event_name).trim()}, ${String(venue_name).trim()}, ${String(event_date).trim()})
      RETURNING event_id, event_name, venue_name, event_date;
    `;

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan event." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { event_id, event_name, venue_name, event_date } = body;

    if (!event_id) {
      return NextResponse.json(
        { message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!event_name || !String(event_name).trim()) {
      return NextResponse.json(
        { message: "Nama Event wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE tiktaktuk.event
      SET event_name = ${String(event_name).trim()},
          venue_name = ${String(venue_name).trim()},
          event_date = ${String(event_date).trim()}
      WHERE event_id = ${event_id}
      RETURNING event_id, event_name, venue_name, event_date;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal memperbarui event." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { event_id } = body;

    const result = await sql`
      DELETE FROM tiktaktuk.event
      WHERE event_id = ${event_id}
      RETURNING event_id, event_name, venue_name, event_date;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus event." },
      { status: 500 }
    );
  }
}
