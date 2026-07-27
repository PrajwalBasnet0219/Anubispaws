import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ THIS IS THE FIX

    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.execute(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [productId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: rows[0] });
  } catch (err) {
    console.error("Product fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
