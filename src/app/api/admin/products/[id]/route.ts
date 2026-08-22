import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";
import { ADMIN_EMAIL } from "@/lib/admin";

function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.email === ADMIN_EMAIL && decoded.role === "admin"
      ? decoded
      : null;
  } catch {
    return null;
  }
}

/* =========================
   PATCH → UPDATE PRODUCT
   ========================= */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const productId = Number(id);
    const body = await req.json();

    const {
      name,
      category,
      price,
      stock,
      weight,
    } = body;

    const [result]: any = await pool.execute(
      `
      UPDATE products
      SET
        name = ?,
        category = ?,
        price = ?,
        stock = ?,
        weight = ?
      WHERE id = ?
      `,
      [name, category, price, stock, weight, productId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Product update failed:", err.message);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → KEEP AS-IS
   ========================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params; // IMPORTANT
    const productId = Number(id);

    const [result] = await pool.execute(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );

    const affected = (result as any).affectedRows;

    if (affected === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Failed to delete product:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
