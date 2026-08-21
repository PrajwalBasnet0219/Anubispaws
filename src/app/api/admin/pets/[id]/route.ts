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
    return decoded.email === ADMIN_EMAIL && decoded.role === "admin"
      ? decoded
      : null;
  } catch {
    return null;
  }
}

/* ===================== PATCH (FIXED) ===================== */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ PROMISE
) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ IMPORTANT
    const petId = Number(id);

    if (isNaN(petId)) {
      return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
    }

    const {
      name,
      species,
      breed,
      age,
      gender,
      status,
      price,
      image_url,
      description,
    } = await req.json();

    const [result]: any = await pool.execute(
      `
      UPDATE pets SET
        name = ?,
        species = ?,
        breed = ?,
        age = ?,
        gender = ?,
        status = ?,
        price = ?,
        image_url = ?,
        description = ?
      WHERE id = ?
      `,
      [
        name,
        species,
        breed,
        age,
        gender,
        status,
        price,
        image_url,
        description,
        petId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pet not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Pet update failed:", err.message);
    return NextResponse.json(
      { error: "Failed to update pet" },
      { status: 500 }
    );
  }
}

/* ===================== DELETE (UNCHANGED) ===================== */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await pool.execute("DELETE FROM pets WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
