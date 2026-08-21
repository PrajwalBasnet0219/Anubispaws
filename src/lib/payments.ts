import pool from "@/db/db";

export async function createPaymentFromOrder(
  orderId: number,
  paymentMethod: "KHALTI"
) {
  const conn = await pool.getConnection();

  try {
    // 1️⃣ Get order info
    const [orders]: any = await conn.query(
      `SELECT 
        id,
        total_amount,
        customer_name,
        customer_email,
        contact_phone
       FROM orders
       WHERE id = ?`,
      [orderId]
    );

    if (!orders.length) {
      throw new Error("Order not found");
    }

    const order = orders[0];

    // 2️⃣ Prevent duplicate payment
    const [existing]: any = await conn.query(
      `SELECT id FROM payments WHERE order_id = ?`,
      [orderId]
    );

    if (existing.length) {
      throw new Error("Payment already exists for this order");
    }

    // 3️⃣ Create payment
    const [result]: any = await conn.query(
      `INSERT INTO payments
       (order_id, amount, payment_method, payment_status, user_email, user_name, user_phone)
       VALUES (?, ?, ?, 'PENDING', ?, ?, ?)`,
      [
        orderId,
        order.total_amount,
        paymentMethod,
        order.customer_email,
        order.customer_name,
        order.contact_phone,
      ]
    );

    return {
      paymentId: result.insertId,
      order,
    };
  } finally {
    conn.release();
  }
}
