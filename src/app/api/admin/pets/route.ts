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
    return decoded.email === ADMIN_EMAIL && decoded.role === "admin" ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  console.log("📍 Admin Pets GET called");
  
  const admin = verifyAdmin(req);
  if (!admin) {
    console.log("❌ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM pets ORDER BY created_at DESC"
    );
    console.log("✅ Fetched", (rows as any[]).length, "pets");
    return NextResponse.json({ pets: rows });
  } catch (err: any) {
    console.error("❌ Failed to fetch pets:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("📍 Admin Pets POST called");

  const admin = verifyAdmin(req);
  if (!admin) {
    console.log("❌ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("📦 Received pet data:", body);

    const { name, species, breed, age, gender, description, status, image_url, price } = body;

    // Ensure image_url is either string or null
    const image = image_url && image_url.trim() !== "" ? image_url : null;

    const [result] = await pool.execute(
      "INSERT INTO pets (name, species, breed, age, gender, description, status, image_url, price, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, species, breed, age, gender, description, status, image, price, admin.id]
    );

    console.log("✅ Pet added successfully, ID:", (result as any).insertId);
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (err: any) {
    console.error("❌ Failed to add pet:", err);
    console.error("❌ Error message:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
