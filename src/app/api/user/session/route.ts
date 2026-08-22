import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not defined!");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    return NextResponse.json({
      user: {
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (err: any) {
    console.error("Session error:", err.message);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
