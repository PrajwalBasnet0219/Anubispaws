import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";
import { parseToken } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/admin";

function isAdmin(decoded: any): boolean {
  return !!decoded && decoded.role === "admin" && decoded.email === ADMIN_EMAIL;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = parseToken(token);

    if (!isAdmin(decoded)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

if (isNaN(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const { status } = await req.json();
    await pool.execute("UPDATE orders SET status=? WHERE id=?", [status, orderId]);

    return NextResponse.json({ message: "Order updated", id: orderId, status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
     const { id } = await context.params; // ✅ unwrap the promise
    const orderId = Number(id);
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = parseToken(token);

    if (!isAdmin(decoded)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isNaN(orderId))
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    await pool.execute("DELETE FROM orders WHERE id=?", [orderId]);

    return NextResponse.json({ message: "Order deleted", id: orderId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
