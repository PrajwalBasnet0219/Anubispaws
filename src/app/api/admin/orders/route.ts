import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";
import { parseToken } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ orders: [] });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded: any = parseToken(token);

    if (!decoded || decoded.role !== "admin" || decoded.email !== ADMIN_EMAIL) {
      return NextResponse.json({ orders: [] });
    }

    const [rows]: any = await pool.execute(`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.order_pets,
        o.order_products,
        o.customer_name,
        o.customer_email,
        o.contact_phone,
        o.shipping_address,
        o.payment_method,
        u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC
    `);

    return NextResponse.json({
      orders: Array.isArray(rows) ? rows : [],
    });
  } catch (err) {
    console.error("ADMIN ORDERS API ERROR:", err);

    // ⚠️ NEVER return empty response
    return NextResponse.json({ orders: [] });
  }
}
