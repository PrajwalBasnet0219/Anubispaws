import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { sendMail } from "@/lib/mailer";
import { receiptEmail } from "@/lib/emailTemplates/receipt";

const KHALTI_VERIFY_URL = process.env.KHALTI_VERIFY_URL!;
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { pidx } = await req.json();

    if (!pidx) {
      return NextResponse.json({ error: "Missing pidx" }, { status: 400 });
    }

    /* --------------------------------
       1️⃣ Find payment
    -------------------------------- */
    const [paymentRows]: any = await db.query(
      "SELECT * FROM payments WHERE khalti_pidx = ?",
      [pidx]
    );

    if (!paymentRows.length) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = paymentRows[0];

    // 🔁 Idempotent
    if (payment.payment_status === "COMPLETED") {
      return NextResponse.json({ success: true });
    }

    /* --------------------------------
       2️⃣ Verify with Khalti
    -------------------------------- */
    const verifyRes = await fetch(KHALTI_VERIFY_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      console.error("Khalti lookup failed:", verifyData);
      return NextResponse.json({ error: "Lookup failed" }, { status: 400 });
    }

    /* --------------------------------
       3️⃣ Handle payment states
    -------------------------------- */
    if (verifyData.status !== "Completed") {
      if (verifyData.status === "User canceled" || verifyData.status === "Expired") {
        await db.query(
          "UPDATE payments SET payment_status = 'FAILED' WHERE id = ?",
          [payment.id]
        );
      }

      return NextResponse.json({
        success: false,
        status: verifyData.status,
      });
    }

    /* --------------------------------
       4️⃣ Update DB
    -------------------------------- */
    await db.query(
      `UPDATE payments
       SET payment_status = 'COMPLETED',
           khalti_transaction_id = ?
       WHERE id = ?`,
      [verifyData.transaction_id, payment.id]
    );

    await db.query(
      "UPDATE orders SET status = 'PROCESSING' WHERE id = ?",
      [payment.order_id]
    );

    /* --------------------------------
       5️⃣ Fetch order
    -------------------------------- */
    const [orderRows]: any = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [payment.order_id]
    );

    if (!orderRows.length) {
      console.error("Order not found for receipt");
      return NextResponse.json({ success: true });
    }

    const order = orderRows[0];

    /* --------------------------------
       6️⃣ Parse items
    -------------------------------- */
    const petItems =
      typeof order.order_pets === "string"
        ? JSON.parse(order.order_pets)
        : [];

    const productItems =
      typeof order.order_products === "string"
        ? JSON.parse(order.order_products)
        : [];

    /* --------------------------------
       7️⃣ Fetch pets
    -------------------------------- */
    let pets: any[] = [];

    if (petItems.length > 0) {
      const petIds = petItems.map((p: any) => p.id);

      const [petRows]: any = await db.query(
        `SELECT id, name FROM pets
         WHERE id IN (${petIds.map(() => "?").join(",")})`,
        petIds
      );

      pets = petRows;
    }

    /* --------------------------------
       8️⃣ Fetch products
    -------------------------------- */
    let products: any[] = [];

    if (productItems.length > 0) {
      const productIds = productItems.map((p: any) => p.id);

      const [productRows]: any = await db.query(
        `SELECT id, name FROM products
         WHERE id IN (${productIds.map(() => "?").join(",")})`,
        productIds
      );

      products = productRows.map((p: any) => {
        const item = productItems.find((i: any) => i.id === p.id);
        return {
          name: p.name,
          quantity: item?.quantity ?? 1,
        };
      });
    }

    /* --------------------------------
       9️⃣ Send receipt email
    -------------------------------- */
    await sendMail({
      to: order.customer_email,
      subject: "🐾 Anubis Paws – Payment Receipt",
      html: receiptEmail({
        customerName: order.customer_name,
        orderId: order.id,
        phone: order.contact_phone,
        items: [
          ...pets.map(p => `Pet Adoption: ${p.id}`),
          ...products.map(p => `Product: ${p.id} × ${p.quantity}`),
        ],
        total: order.total_amount,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
