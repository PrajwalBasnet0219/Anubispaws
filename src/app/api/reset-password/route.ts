import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/db/db";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
