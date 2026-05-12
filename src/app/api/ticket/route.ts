import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Ticket, createTicket, toJson } from "@/types/ticket";

export async function GET() {
  try {
    const result = await sql`SELECT * FROM tiktaktuk.ticket ORDER BY ticket_code ASC;`;

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
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
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data ticket category." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticket_code , tcat_id, torder_id } = body;

    if (!ticket_code || !String(ticket_code).trim()) {
      return NextResponse.json(
        { message: "Kode Tiket wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tiktaktuk.ticket (ticket_id, ticket_code, tcat_id, torder_id)
      VALUES (${crypto.randomUUID()}, ${String(ticket_code).trim()}, ${String(tcat_id).trim()}, ${String(torder_id).trim()})
      RETURNING ticket_id, ticket_code, tcat_id, torder_id;
    `;

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan ticket." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ticket_id, ticket_code , tcat_id, torder_id } = body;

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
          tcat_id = ${String(tcat_id).trim()},
          torder_id = ${String(torder_id).trim()}
      WHERE ticket_id = ${ticket_id}
      RETURNING ticket_id, ticket_code, tcat_id, torder_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Ticket tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
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
      RETURNING ticket_id, ticket_code, tcat_id, torder_id;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Ticket tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus ticket." },
      { status: 500 }
    );
  }
}
