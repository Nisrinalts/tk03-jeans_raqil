import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - fetch all promotions
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        p.promotion_id,
        p.promo_code,
        p.discount_type,
        p.discount_value,
        TO_CHAR(p.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(p.end_date, 'YYYY-MM-DD') AS end_date,
        p.usage_limit,

        COUNT(op.order_promotion_id)::INTEGER AS usage_count

      FROM tiktaktuk.promotion p

      LEFT JOIN tiktaktuk.order_promotion op
        ON op.promotion_id = p.promotion_id

      GROUP BY
        p.promotion_id,
        p.promo_code,
        p.discount_type,
        p.discount_value,
        p.start_date,
        p.end_date,
        p.usage_limit

      ORDER BY p.start_date DESC
    `);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("GET /api/promotion error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data promosi." },
      { status: 500 }
    );
  }
}

// POST - create promotion
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      promo_code,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit,
    } = body;

    // validation
    if (
      !promo_code ||
      !discount_type ||
      discount_value == null ||
      !start_date ||
      !end_date ||
      usage_limit == null
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (end_date < start_date) {
      return NextResponse.json(
        {
          error:
            "Tanggal berakhir harus sama dengan atau setelah tanggal mulai.",
        },
        { status: 400 }
      );
    }

    // check duplicate promo code
    const existing = await pool.query(
      `
      SELECT promotion_id
      FROM tiktaktuk.promotion
      WHERE UPPER(promo_code) = UPPER($1)
      `,
      [promo_code]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error: `Kode promo "${promo_code.toUpperCase()}" sudah digunakan.`,
        },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO tiktaktuk.promotion
      (
        promotion_id,
        promo_code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)

      RETURNING
        promotion_id,
        promo_code,
        discount_type,
        discount_value,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
        usage_limit
      `,
      [
        id,
        promo_code.toUpperCase().trim(),
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit,
      ]
    );

    return NextResponse.json(
      {
        ...result.rows[0],
        usage_count: 0,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/promotion error:", error);

    return NextResponse.json(
      { error: "Gagal membuat promosi." },
      { status: 500 }
    );
  }
}

// PUT - update promotion
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      promotion_id,
      promo_code,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit,
    } = body;

    if (!promotion_id) {
      return NextResponse.json(
        { error: "promotion_id wajib disertakan." },
        { status: 400 }
      );
    }

    if (end_date && start_date && end_date < start_date) {
      return NextResponse.json(
        {
          error:
            "Tanggal berakhir harus sama dengan atau setelah tanggal mulai.",
        },
        { status: 400 }
      );
    }

    // check duplicate promo code
    if (promo_code) {
      const existing = await pool.query(
        `
        SELECT promotion_id
        FROM tiktaktuk.promotion
        WHERE UPPER(promo_code) = UPPER($1)
        AND promotion_id <> $2
        `,
        [promo_code, promotion_id]
      );

      if (existing.rows.length > 0) {
        return NextResponse.json(
          {
            error: `Kode promo "${promo_code.toUpperCase()}" sudah digunakan.`,
          },
          { status: 409 }
        );
      }
    }

    const result = await pool.query(
      `
      UPDATE tiktaktuk.promotion
      SET
        promo_code = COALESCE($2, promo_code),
        discount_type = COALESCE($3, discount_type),
        discount_value = COALESCE($4, discount_value),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        usage_limit = COALESCE($7, usage_limit)

      WHERE promotion_id = $1

      RETURNING
        promotion_id,
        promo_code,
        discount_type,
        discount_value,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
        usage_limit
      `,
      [
        promotion_id,
        promo_code ? promo_code.toUpperCase().trim() : null,
        discount_type ?? null,
        discount_value ?? null,
        start_date ?? null,
        end_date ?? null,
        usage_limit ?? null,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Promosi tidak ditemukan." },
        { status: 404 }
      );
    }

    // calculate usage_count realtime
    const usageResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS usage_count
      FROM tiktaktuk.order_promotion
      WHERE promotion_id = $1
      `,
      [promotion_id]
    );

    return NextResponse.json({
      ...result.rows[0],
      usage_count: usageResult.rows[0].usage_count,
    });

  } catch (error) {
    console.error("PUT /api/promotion error:", error);

    return NextResponse.json(
      { error: "Gagal mengupdate promosi." },
      { status: 500 }
    );
  }
}

// DELETE - delete promotion
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { promotion_id } = body;

    if (!promotion_id) {
      return NextResponse.json(
        { error: "promotion_id wajib disertakan." },
        { status: 400 }
      );
    }

    // delete relation first
    await pool.query(
      `
      DELETE FROM tiktaktuk.order_promotion
      WHERE promotion_id = $1
      `,
      [promotion_id]
    );

    const result = await pool.query(
      `
      DELETE FROM tiktaktuk.promotion
      WHERE promotion_id = $1
      RETURNING promotion_id
      `,
      [promotion_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Promosi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_id: promotion_id,
    });

  } catch (error) {
    console.error("DELETE /api/promotion error:", error);

    return NextResponse.json(
      { error: "Gagal menghapus promosi." },
      { status: 500 }
    );
  }
}