import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET() {
  try {
    const result = await sql`
    SELECT DISTINCT ON (s.seat_id)
      s.seat_id, s.section, s.seat_number, s.row_number, t.ticket_id, t.torder_id, og.user_id AS org_user_id, c.full_name, u.user_id, e.event_title, v.venue_name,
    CASE
        WHEN s.seat_id IN (SELECT seat_id FROM tiktaktuk.has_relationship) THEN 'Terisi' ELSE 'Tersedia' END AS status
    FROM tiktaktuk.seat s
    LEFT JOIN tiktaktuk.has_relationship hr ON s.seat_id = hr.seat_id
    LEFT JOIN tiktaktuk.ticket t ON hr.ticket_id = t.ticket_id
    LEFT JOIN tiktaktuk.venue v ON s.venue_id = v.venue_id
    LEFT JOIN tiktaktuk.order o ON t.torder_id = o.order_id
    LEFT JOIN tiktaktuk.customer c ON o.customer_id = c.customer_id
    LEFT JOIN tiktaktuk.user_account u ON c.user_id = u.user_id
    LEFT JOIN tiktaktuk.ticket_category tc ON t.tcategory_id = tc.category_id
    LEFT JOIN tiktaktuk.event e ON tc.event_id = e.event_id
    LEFT JOIN tiktaktuk.organizer og ON e.organizer_id = og.organizer_id
    ORDER BY s.seat_id, v.venue_name ASC;`;

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data ticket." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seat_id , section, row_number, seat_number, venue_id } = body;

    if (!seat_id || !String(seat_id).trim()) {
      return NextResponse.json(
        { message: "ID Kursi wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tiktaktuk.seat (seat_id, section, row_number, seat_number, venue_id)
      VALUES (${String(seat_id).trim()}, ${String(section).trim()}, ${String(row_number).trim()}, ${String(seat_number).trim()}, ${String(venue_id).trim()})
      RETURNING seat_id, section, row_number, seat_number, venue_id;
    `;

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan seat." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { seat_id, section, row_number, seat_number, venue_id } = body;

    if (!seat_id) {
      return NextResponse.json(
        { message: "Seat tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!seat_number || !String(seat_number).trim()) {
      return NextResponse.json(
        { message: "Nomor Kursi wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE tiktaktuk.seat
      SET section = ${String(section).trim()},
          row_number = ${String(row_number).trim()},
          seat_number = ${String(seat_number).trim()},
          venue_id = ${String(venue_id).trim()}
      WHERE seat_id = ${seat_id}
      RETURNING seat_id, section, row_number, seat_number, venue_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Seat tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal memperbarui seat." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { seat_id } = body;

    const result = await sql`
      DELETE FROM tiktaktuk.seat
      WHERE seat_id = ${seat_id}
      RETURNING seat_id, section, row_number, seat_number, venue_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Seat tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus seat." },
      { status: 500 }
    );
  }
}
