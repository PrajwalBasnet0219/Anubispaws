import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    /* --------------------------------
       1️⃣ Get order
    -------------------------------- */
    const [orders]: any = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orders.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    /* --------------------------------
       2️⃣ Check existing payment
    -------------------------------- */
    const [payments]: any = await db.query(
      "SELECT * FROM payments WHERE order_id = ? AND payment_method = 'KHALTI'",
      [order.id]
    );

    // ❌ Already paid
    if (payments.length && payments[0].payment_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    /* --------------------------------
       3️⃣ Initiate Khalti
    -------------------------------- */
    const payload = {
      return_url: `${req.headers.get("origin")}/payment/success`,
      website_url: req.headers.get("origin"),
      amount: Math.round(order.total_amount * 100),
      purchase_order_id: order.id.toString(),
      purchase_order_name: `Order #${order.id}`,
      customer_info: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.contact_phone,
      },
    };

    const khaltiRes = await fetch(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const khaltiData = await khaltiRes.json();

    if (!khaltiRes.ok) {
      console.error("Khalti initiate error:", khaltiData);
      return NextResponse.json(
        { error: "Khalti initiation failed" },
        { status: 400 }
      );
    }

    /* --------------------------------
       4️⃣ Save or UPDATE payment row
    -------------------------------- */
    if (payments.length) {
      // ✅ Reuse existing row
      await db.query(
        `UPDATE payments
         SET khalti_pidx = ?, payment_status = 'PENDING', updated_at = NOW()
         WHERE id = ?`,
        [khaltiData.pidx, payments[0].id]
      );
    } else {
      // ✅ First-time insert
      await db.query(
        `INSERT INTO payments
         (order_id, amount, payment_method, payment_status, khalti_pidx)
         VALUES (?, ?, 'KHALTI', 'PENDING', ?)`,
        [order.id, order.total_amount, khaltiData.pidx]
      );
    }

    /* --------------------------------
       5️⃣ Return payment URL
    -------------------------------- */
    return NextResponse.json({
      payment_url: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    });

  } catch (err: any) {
    console.error("Khalti initiate error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
