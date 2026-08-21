import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

const KHALTI_VERIFY_URL = process.env.KHALTI_VERIFY_URL!;
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { pidx } = await req.json();

    if (!pidx) {
      return NextResponse.json({ error: "Missing pidx" }, { status: 400 });
    }

    // 1️⃣ Find payment
    const [payments]: any = await db.query(
      "SELECT * FROM payments WHERE khalti_pidx = ?",
      [pidx]
    );

    if (!payments.length) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = payments[0];

    // Prevent double verification
    if (payment.payment_status === "COMPLETED") {
      return NextResponse.json({ success: true });
    }

    // 2️⃣ Verify with Khalti
    const verifyRes = await fetch(KHALTI_VERIFY_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.status !== "Completed") {
      console.error("Khalti verify failed:", verifyData);
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 3️⃣ Fraud check (transaction reuse)
    const [reuse]: any = await db.query(
      "SELECT id FROM payments WHERE khalti_transaction_id = ?",
      [verifyData.transaction_id]
    );

    if (reuse.length) {
      return NextResponse.json({ error: "Transaction already used" }, { status: 403 });
    }

    // 4️⃣ Update payment
    await db.query(
      `UPDATE payments 
       SET payment_status = 'COMPLETED',
           khalti_transaction_id = ?
       WHERE id = ?`,
      [verifyData.transaction_id, payment.id]
    );

    // 5️⃣ Update order
    await db.query(
      "UPDATE orders SET status = 'PROCESSING' WHERE id = ?",
      [payment.order_id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
