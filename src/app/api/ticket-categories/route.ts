import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function validateTotalQuota(
  eventId: string,
  quota: number,
  excludeCategoryId?: string
) {
  const eventResult = await pool.query(
    `
    SELECT 
      e.event_id,
      e.event_title,
      v.capacity AS venue_capacity
    FROM tiktaktuk.event e
    JOIN tiktaktuk.venue v ON v.venue_id = e.venue_id
    WHERE e.event_id = $1;
    `,
    [eventId]
  );

  if (eventResult.rows.length === 0) {
    return {
      valid: false,
      message: "Event tidak ditemukan.",
    };
  }

  const event = eventResult.rows[0];

  const quotaResult = await pool.query(
    `
    SELECT COALESCE(SUM(quota), 0) AS total_quota
    FROM tiktaktuk.ticket_category
    WHERE event_id = $1
      AND ($2::uuid IS NULL OR category_id <> $2::uuid);
    `,
    [eventId, excludeCategoryId || null]
  );

  const totalQuota = Number(quotaResult.rows[0].total_quota);

  if (totalQuota + quota > Number(event.venue_capacity)) {
    return {
      valid: false,
      message: `Total kuota melebihi kapasitas venue (${event.venue_capacity}) untuk event ${event.event_title}.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        tc.category_id,
        tc.category_name,
        tc.quota,
        tc.price::float AS price,
        tc.event_id,
        e.event_title
      FROM tiktaktuk.ticket_category tc
      JOIN tiktaktuk.event e ON e.event_id = tc.event_id
      ORDER BY e.event_title ASC, tc.category_name ASC;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data kategori tiket." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category_name, quota, price, event_id } = body;

    if (!category_name || !String(category_name).trim() || !quota || price === "" || !event_id) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const parsedQuota = Number(quota);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedQuota) || parsedQuota <= 0) {
      return NextResponse.json(
        { message: "Kuota harus berupa bilangan bulat positif (> 0)." },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { message: "Harga harus berupa bilangan tidak negatif (>= 0)." },
        { status: 400 }
      );
    }

    const validation = await validateTotalQuota(event_id, parsedQuota);

    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.message },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO tiktaktuk.ticket_category
        (category_id, category_name, quota, price, event_id)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        category_id,
        category_name,
        quota,
        price,
        event_id;
      `,
      [
        crypto.randomUUID(),
        String(category_name).trim(),
        parsedQuota,
        parsedPrice,
        event_id,
      ]
    );

    const inserted = result.rows[0];

    const joinedResult = await pool.query(
      `
      SELECT
        tc.category_id,
        tc.category_name,
        tc.quota,
        tc.price::float AS price,
        tc.event_id,
        e.event_title
      FROM tiktaktuk.ticket_category tc
      JOIN tiktaktuk.event e ON e.event_id = tc.event_id
      WHERE tc.category_id = $1;
      `,
      [inserted.category_id]
    );

    return NextResponse.json(joinedResult.rows[0]);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Gagal menambahkan kategori tiket." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { category_id, category_name, quota, price, event_id } = body;

    if (!category_id || !category_name || !String(category_name).trim() || !quota || price === "" || !event_id) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const parsedQuota = Number(quota);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedQuota) || parsedQuota <= 0) {
      return NextResponse.json(
        { message: "Kuota harus berupa bilangan bulat positif (> 0)." },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { message: "Harga harus berupa bilangan tidak negatif (>= 0)." },
        { status: 400 }
      );
    }

    const validation = await validateTotalQuota(
      event_id,
      parsedQuota,
      category_id
    );

    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.message },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE tiktaktuk.ticket_category
      SET
        category_name = $2,
        quota = $3,
        price = $4,
        event_id = $5
      WHERE category_id = $1
      RETURNING
        category_id,
        category_name,
        quota,
        price,
        event_id;
      `,
      [
        category_id,
        String(category_name).trim(),
        parsedQuota,
        parsedPrice,
        event_id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Kategori tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    const joinedResult = await pool.query(
      `
      SELECT
        tc.category_id,
        tc.category_name,
        tc.quota,
        tc.price::float AS price,
        tc.event_id,
        e.event_title
      FROM tiktaktuk.ticket_category tc
      JOIN tiktaktuk.event e ON e.event_id = tc.event_id
      WHERE tc.category_id = $1;
      `,
      [category_id]
    );

    return NextResponse.json(joinedResult.rows[0]);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Gagal memperbarui kategori tiket." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { category_id } = body;

    const result = await pool.query(
      `
      DELETE FROM tiktaktuk.ticket_category
      WHERE category_id = $1
      RETURNING category_id, category_name, quota, price, event_id;
      `,
      [category_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Kategori tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error.code === "23503"
            ? "Kategori tiket tidak dapat dihapus karena sudah memiliki tiket terkait."
            : error.message || "Gagal menghapus kategori tiket.",
      },
      { status: 500 }
    );
  }
}