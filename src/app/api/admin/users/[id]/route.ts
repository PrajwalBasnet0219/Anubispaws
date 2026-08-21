import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/db/db";
import { ADMIN_EMAIL } from "@/lib/admin";

function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.email === ADMIN_EMAIL && decoded.role === "admin" ? decoded : null;
  } catch {
    return null;
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <--- note this
) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params; // <--- unwrap the promise
    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete user:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
