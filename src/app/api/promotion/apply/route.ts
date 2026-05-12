import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {

  const client = await pool.connect();

  try {

    const body =
      await request.json();
    const {
      customer_id,
      promotion_id,
    } = body;
    if (
      !customer_id ||
      !promotion_id
    ) {
      return NextResponse.json(
        {
          error:
            "customer_id dan promotion_id wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    await client.query("BEGIN");

    // =====================================================
    // INSERT DUMMY ORDER
    // =====================================================

    const orderId =
      crypto.randomUUID();

    await client.query(
      `
      INSERT INTO tiktaktuk."order"
      (
        order_id,
        order_date,
        payment_status,
        total_amount,
        customer_id
      )
      VALUES ($1, NOW(), 'Pending', 0, $2)
      `,
      [
        orderId,
        customer_id,
      ]
    );

    // =====================================================
    // INSERT ORDER PROMOTION
    // TRIGGER AKAN JALAN DI SINI
    // =====================================================

    const orderPromotionId =
      crypto.randomUUID();

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
        orderId,
      ]
    );

    // =====================================================
    // TIDAK DISIMPAN
    // =====================================================

    await client.query("ROLLBACK");

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {

    await client.query("ROLLBACK");

    console.error(
      "PROMO APPLY ERROR:",
      error.message
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Promo tidak valid.",
      },
      {
        status: 400,
      }
    );
  } finally {
    client.release();
  }
}