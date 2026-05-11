import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - fetch all orders
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (o.order_id)
        o.order_id,
        TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
        o.payment_status,
        o.total_amount,
        o.customer_id,

        c.full_name AS customer_name,

        e.event_title,
        e.organizer_id

      FROM tiktaktuk."order" o

      LEFT JOIN tiktaktuk.customer c
        ON c.customer_id = o.customer_id

      LEFT JOIN tiktaktuk.ticket t
        ON t.torder_id = o.order_id

      LEFT JOIN tiktaktuk.ticket_category tc
        ON tc.category_id = t.tcategory_id

      LEFT JOIN tiktaktuk.event e
        ON e.event_id = tc.event_id

      ORDER BY o.order_id, o.order_date DESC
    `);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("GET /api/order error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data order." },
      { status: 500 }
    );
  }
}

// POST - create order
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer_id,
      total_amount,
      payment_status = "Pending",
      promotion_id,
    } = body;

    if (!customer_id || total_amount == null) {
      return NextResponse.json(
        { error: "customer_id dan total_amount wajib diisi." },
        { status: 400 }
      );
    }

    const orderDate = new Date();

    // ─────────────────────────────────────────────────────────────
    // VALIDASI PROMOTION
    // ─────────────────────────────────────────────────────────────
    if (promotion_id) {

      const promoResult = await pool.query(
        `
        SELECT
          p.promotion_id,
          p.promo_code,
          p.usage_limit,
          p.start_date,
          p.end_date,

          COUNT(op.order_promotion_id)::INTEGER AS usage_count

        FROM tiktaktuk.promotion p

        LEFT JOIN tiktaktuk.order_promotion op
          ON op.promotion_id = p.promotion_id

        WHERE p.promotion_id = $1

        GROUP BY
          p.promotion_id,
          p.promo_code,
          p.usage_limit,
          p.start_date,
          p.end_date
        `,
        [promotion_id]
      );

      if (promoResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Promotion dengan ID ${promotion_id} tidak ditemukan.` },
          { status: 404 }
        );
      }

      const promo = promoResult.rows[0];

      // cek usage limit
      if (promo.usage_count >= promo.usage_limit) {
        return NextResponse.json(
          {
            error: `Promotion "${promo.promo_code}" telah mencapai batas maksimum penggunaan.`,
          },
          { status: 400 }
        );
      }

      // cek tanggal promo
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);

      endDate.setHours(23, 59, 59, 999);

      if (orderDate < startDate || orderDate > endDate) {
        return NextResponse.json(
          {
            error: `Promotion "${promo.promo_code}" sudah tidak berlaku.`,
          },
          { status: 400 }
        );
      }

      // transaction
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const orderId = crypto.randomUUID();

        const orderResult = await client.query(
          `
          INSERT INTO tiktaktuk."order"
          (
            order_id,
            order_date,
            payment_status,
            total_amount,
            customer_id
          )
          VALUES ($1, $2, $3, $4, $5)

          RETURNING
            order_id,
            TO_CHAR(order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
            payment_status,
            total_amount,
            customer_id
          `,
          [
            orderId,
            orderDate,
            payment_status,
            total_amount,
            customer_id
          ]
        );

        // insert relation order_promotion
        const orderPromotionId = crypto.randomUUID();

        await client.query(
          `
          INSERT INTO tiktaktuk.order_promotion
          (
            order_promotion_id,
            promotion_id,
            order_id
          )
          VALUES ($1, $2, $3)
          `,
          [
            orderPromotionId,
            promotion_id,
            orderId
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json(
          orderResult.rows[0],
          { status: 201 }
        );

      } catch (txError) {

        await client.query("ROLLBACK");
        throw txError;

      } finally {

        client.release();

      }
    }

    // ─────────────────────────────────────────────────────────────
    // TANPA PROMOTION
    // ─────────────────────────────────────────────────────────────
    const orderId = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO tiktaktuk."order"
      (
        order_id,
        order_date,
        payment_status,
        total_amount,
        customer_id
      )
      VALUES ($1, $2, $3, $4, $5)

      RETURNING
        order_id,
        TO_CHAR(order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
        payment_status,
        total_amount,
        customer_id
      `,
      [
        orderId,
        orderDate,
        payment_status,
        total_amount,
        customer_id
      ]
    );

    return NextResponse.json(
      result.rows[0],
      { status: 201 }
    );

  } catch (error) {

    console.error("POST /api/order error:", error);

    return NextResponse.json(
      { error: "Gagal membuat order." },
      { status: 500 }
    );
  }
}

// PUT - update payment status
export async function PUT(request: Request) {
  try {

    const body = await request.json();

    const {
      order_id,
      payment_status
    } = body;

    if (!order_id || !payment_status) {
      return NextResponse.json(
        {
          error: "order_id dan payment_status wajib disertakan."
        },
        { status: 400 }
      );
    }

    const allowed = ["Pending", "Paid", "Cancelled"];

    if (!allowed.includes(payment_status)) {
      return NextResponse.json(
        {
          error: `payment_status harus salah satu dari: ${allowed.join(", ")}.`
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE tiktaktuk."order"
      SET payment_status = $2
      WHERE order_id = $1

      RETURNING
        order_id,
        TO_CHAR(order_date, 'YYYY-MM-DD HH24:MI:SS') AS order_date,
        payment_status,
        total_amount,
        customer_id
      `,
      [order_id, payment_status]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Order tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {

    console.error("PUT /api/order error:", error);

    return NextResponse.json(
      { error: "Gagal mengupdate order." },
      { status: 500 }
    );
  }
}

// DELETE - delete order
export async function DELETE(request: Request) {
  try {

    const body = await request.json();

    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "order_id wajib disertakan." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {

      await client.query("BEGIN");

      // hapus relasi promotion dulu
      await client.query(
        `
        DELETE FROM tiktaktuk.order_promotion
        WHERE order_id = $1
        `,
        [order_id]
      );

      const result = await client.query(
        `
        DELETE FROM tiktaktuk."order"
        WHERE order_id = $1
        RETURNING order_id
        `,
        [order_id]
      );

      if (result.rows.length === 0) {

        await client.query("ROLLBACK");

        return NextResponse.json(
          { error: "Order tidak ditemukan." },
          { status: 404 }
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        deleted_id: order_id
      });

    } catch (txError) {

      await client.query("ROLLBACK");
      throw txError;

    } finally {

      client.release();

    }

  } catch (error) {

    console.error("DELETE /api/order error:", error);

    return NextResponse.json(
      { error: "Gagal menghapus order." },
      { status: 500 }
    );
  }
}