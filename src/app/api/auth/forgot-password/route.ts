import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { resetPasswordEmail } from "@/lib/emailTemplates/resetPassword";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const [users]: any = await db.query(
    "SELECT id, name, email FROM users WHERE email=?",
    [email]
  );

  // Always return success (prevents email enumeration)
  if (!users.length) {
    return NextResponse.json({ success: true });
  }

  const user = users[0];

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await db.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES (?, ?, NOW() + INTERVAL '10 minutes')`,
    [user.id, tokenHash]
  );

  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: resetPasswordEmail(resetLink, user.name),
  });

  return NextResponse.json({ success: true });
}
