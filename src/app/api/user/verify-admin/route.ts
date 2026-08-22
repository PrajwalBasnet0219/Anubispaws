import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ADMIN_EMAIL } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check BOTH email AND role
    const isAdmin = decoded.email === ADMIN_EMAIL && decoded.role === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, isAdmin: true });
  } catch (err: any) {
    console.error("Admin verification error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
