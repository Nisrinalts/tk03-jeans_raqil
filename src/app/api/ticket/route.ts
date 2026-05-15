import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET() {
  try {
    const result = await sql`
    SELECT t.ticket_code, t.ticket_id, t.tcategory_id, t.torder_id, tc.category_name, o.order_id, o.customer_id, c.user_id AS cust_user_id, og.user_id AS org_user_id, c.full_name, u.user_id, e.event_title, e.organizer_id, v.venue_name
    FROM tiktaktuk.ticket t 
    JOIN tiktaktuk.ticket_category tc ON t.tcategory_id = tc.category_id
    JOIN tiktaktuk.order o ON t.torder_id = o.order_id
    JOIN tiktaktuk.customer c ON o.customer_id = c.customer_id
    JOIN tiktaktuk.user_account u ON c.user_id = u.user_id
    JOIN tiktaktuk.event e ON tc.event_id = e.event_id
    JOIN tiktaktuk.venue v ON e.venue_id = v.venue_id
    JOIN tiktaktuk.organizer og ON e.organizer_id = og.organizer_id
    ORDER BY ticket_code ASC;`;

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data ticket." },
      { status: 500 }
    );
  }
}
export async function GetCat() {
  try {
    const result = await sql`SELECT * FROM tiktaktuk.ticket_category;`;

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data ticket category." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticket_code , tcategory_id, torder_id } = body;

    if (!ticket_code || !String(ticket_code).trim()) {
      return NextResponse.json(
        { message: "Kode Tiket wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tiktaktuk.ticket (ticket_id, ticket_code, tcategory_id, torder_id)
      VALUES (gen_random_uuid(), ${String(ticket_code).trim()}, ${String(tcategory_id).trim()}, ${String(torder_id).trim()})
      RETURNING ticket_id, ticket_code, tcategory_id, torder_id;
    `;

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error(error.message);
    const errorMessage = error.message || "Gagal menambahkan ticket.";
    return NextResponse.json(
      { message: "Gagal menambahkan ticket.", detail: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ticket_id, ticket_code , tcategory_id, torder_id } = body;

    if (!ticket_id) {
      return NextResponse.json(
        { message: "Ticket tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!ticket_code || !String(ticket_code).trim()) {
      return NextResponse.json(
        { message: "Kode Tiket wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE tiktaktuk.ticket
      SET ticket_code = ${String(ticket_code).trim()},
          tcategory_id = ${String(tcategory_id).trim()},
          torder_id = ${String(torder_id).trim()}
      WHERE ticket_id = ${ticket_id}
      RETURNING ticket_id, ticket_code, tcategory_id, torder_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Ticket tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal memperbarui ticket." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ticket_id } = body;

    const result = await sql`
      DELETE FROM tiktaktuk.ticket
      WHERE ticket_id = ${ticket_id}
      RETURNING ticket_id, ticket_code, tcategory_id, torder_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Ticket tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus ticket." },
      { status: 500 }
    );
  }
}
